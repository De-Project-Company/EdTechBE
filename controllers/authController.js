import crypto from 'crypto';

import School from '../models/schoolModel.js';
import catchAsync from '../utils/catchAsync.js';
import Email from '../utils/email.js';
import AppError from '../utils/appError.js';
import { createSendToken } from '../utils/jwt.utils.js';
import { licenceNumberGenerator } from '../utils/helperFun.js';
import schema from '../validators/signup.validator.js';

const signup = catchAsync(async (req, res, next) => {
  const { licence, hashedLicence } = licenceNumberGenerator();

  const newSchool = {
    schoolName: req.body.schoolName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    contactAddress: req.body.contactAddress,
    adminName: req.body.adminName,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  };
  await schema.validateAsync(newSchool);
  newSchool.licence = hashedLicence;
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
  const hashedLicence = crypto
    .createHash('sha256')
    .update(req.body.licence)
    .digest('hex');
  const school = await School.findOne({
    licence: hashedLicence
  });
  if (!school) {
    return next(new AppError('Invalid Licence Number', 400));
  }
  school.active = true;
  await school.save({ validateBeforeSave: false });
  createSendToken(school, 200, 'Account activated successfully.', req, res);
});

const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const school = await School.findOne({ email }).select('+password -__v');
  if (!school || !(await school.correctPassword(password, school.password))) {
    return next(new AppError(`Incorrect email or password.`, 401));
  }
  createSendToken(school, 200, 'Signed in successfully.', req, res);
});

export { signup, signin, activateAccount };
