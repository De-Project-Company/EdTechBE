import Joi from 'joi';

const licenceValidator = Joi.object({
    licence: Joi.string().required(),
}).strict();

export default licenceValidator;
