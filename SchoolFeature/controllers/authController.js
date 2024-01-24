import crypto from "crypto";

import School from "../models/schoolModel.js";
import catchAsync from "../../utils/catchAsync.js";
import Email from "../../utils/email.js";
import AppError from "../../utils/appError.js";
import { createSendToken } from "../../utils/jwt.utils.js";
import { licenceNumberGenerator } from "../../utils/licenceGenerator.js";
import signupValidator from "../validators/signup.validator.js";
import licenceValidator from "../validators/licence.validator.js";
import signinValidator from "../validators/signin.validator.js";

// Sign up logic
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
  };

  await signupValidator.validateAsync(newSchool);
  newSchool.licence = hashedLicence;
  const school = await School.create(newSchool);

  try {
    await new Email(school).sendWelcome(licence);
    return res.status(201).json({
      status: "success",
      message:
        "Signup successful, kindly check your email for your Licence Number.",
    });
  } catch (err) {
    await School.deleteOne({ email: req.body.email });
    return next(err);
  }
});





// Account activation logic
const activateAccount = catchAsync(async (req, res, next) => {
  const { error } = await licenceValidator.validateAsync(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  const hashedLicence = crypto
    .createHash("sha256")
    .update(req.body.licence)
    .digest("hex");
  const school = await School.findOne({
    licence: hashedLicence,
  });
  if (!school) {
    return next(new AppError("Invalid Licence Number", 400));
  }
  school.active = true;
  await school.save({ validateBeforeSave: false });
  createSendToken(school, 200, "Account activated successfully.", req, res);
});





// sign in logic
const signin = catchAsync(async (req, res, next) => {
  const { error } = await signinValidator.validateAsync(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const school = await School.findOne({ email }).select(
    "+password -__v +active"
  );
  if (!school || !(await school.correctPassword(password, school.password))) {
    return next(new AppError(`Incorrect email or password.`, 401));
  }
  if (school && (await school.correctPassword(password, school.password))) {
    if (!school.active) {
      return next(
        new AppError(
          `You have not activated your account. Please do so to gain access.`,
          401
        )
      );
    }
  }
  school._doc;
  createSendToken(school, 200, "Signed in successfully.", req, res);
});

export { signup, signin, activateAccount };
