import Joi from 'joi';

const signupValidator = Joi.object({
  schoolName: Joi.string().required(),
  email: Joi.string()
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  .required()
  .messages({
    "string.pattern.base": "Email is not a valid email format/address",
  }),
  phoneNumber: Joi.string().required(),
  contactAddress: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9s,.\\s'-]+$"))
    .required(),

  adminName: Joi.string().required(),
  password: Joi.string()
  .min(6)
  .required()
  .messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
  }),
  passwordConfirm: Joi.string()
  .valid(Joi.ref("password"))
  .required()
  .messages({
    "any.only": "Passwords do not match",
  }),
}).strict();

export default signupValidator;
