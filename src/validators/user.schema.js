import Joi from "joi";

const userId = Joi.string().required(); // OAuth user ID

const userRequest = Joi.object({
    name: Joi.string().min(1).max(100).required(),
}).required();

const userResponse = Joi.object({
    _id: userId,
    name: Joi.string().min(1).max(100).required(),
    funds: Joi.number().min(0).required(),
}).required();

export { userRequest, userResponse };
