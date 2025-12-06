import Joi from "joi";

const docId = Joi.string().hex().length(24).required(); // MongoDB ObjectId

export default docId;
