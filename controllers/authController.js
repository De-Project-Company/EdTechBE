import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import School from '../models/schoolModel.js';
import catchAsync from '../utils/catchAsync.js';
import otpGenerator from 'otp-generator';
import Email from '../utils/email.js';
import AppError from '../utils/appError.js';

const signToken = (id, expiresin) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresin
  });
};

// refactored the feedback
const createSendToken = (foundSchool, statusCode, req, res) => {
  const token = signToken(foundUser._id, process.env.JWT_EXPIRES_IN);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None'
  });
  // removes the password from the output
  delete foundSchool._doc.password;
  res.status(statusCode).json({
    status: 'success',
    data: {
      school: foundSchool
    }
  });
};

const licenceNumberGenerator = () => {
  const licence = otpGenerator.generate(11, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false
  });
  const hashedLicence = crypto
    .createHash('sha256')
    .update(licence)
    .digest('hex');

  return { licence, hashedLicence };
};

const signup = catchAsync(async (req, res, next) => {
  const { licence, hashedLicence } = licenceNumberGenerator();
  const newSchool = {
    schoolName: req.body.schoolName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    contactAddress: req.body.contactAddress,
    adminName: req.body.adminName,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    licence: hashedLicence
  };

  const school = await School.create(newSchool);

  try {
    await new Email(school).sendWelcome(licence);
    return res.status(201).json({
      status: 'success',
      message:
        'Signup successful, kindly check your email for your Licence Number.'
    });
  } catch (err) {
    await School.deleteOne({ email: req.body.email });
    return next(err);
  }
});

const activateAccount = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.licence)
    .digest('hex');

  const school = await School.findOne({
    licence: hashedToken
  });
  if (!school) {
    return next(new AppError('Invalid Licence Number', 400));
  }

  school.active = true;
  await school.save({ validateBeforeSave: false });
  createSendToken(school, 200, req, res);
});

const signin = () => {};

export { signup, signin, activateAccount };
