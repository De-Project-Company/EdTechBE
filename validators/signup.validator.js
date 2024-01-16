import Joi from 'joi';

const schema = Joi.object({
  schoolName: Joi.string()
    .pattern(new RegExp("[a-zA-Z.',\\s -]+$"))
    .min(8)
    .max(30)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] }
    })
    .required(),
  phoneNumber: Joi.string().pattern(new RegExp('^[0-9]{11}$')).required(),
  contactAddress: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9s,.\\s'-]+$"))
    .min(8)
    .max(30)
    .required(),

  adminName: Joi.string().pattern(new RegExp("^[a-zA-Z.'\\s]+$")).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
  passwordConfirm: Joi.ref('password')
});

export default schema;
