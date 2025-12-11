import Joi from "joi";

// Airplane model response (static, GET only)
const airplaneModelResponse = Joi.object({
    _id: Joi.string().required(), // Example: "skyhawk"
    name: Joi.string().required(), // Example: "Cessna 172 Skyhawk"
    baseCruise: Joi.number().min(0).required(), // m/s
    cost: Joi.number().min(0).required(), // $
    cargoCapacity: Joi.number().min(0).required(), // kg
    baseFuelBurn: Joi.number().min(0).required(), // kg/s
    fuelCapacity: Joi.number().min(0).required(), // kg
    passengerSeats: Joi.number().integer().min(0).required(),
}).required();

export { airplaneModelResponse };
