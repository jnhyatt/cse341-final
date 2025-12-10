import Joi from "joi";

const airportId = Joi.string().required(); // Example: "KSLC"
const planeId = Joi.string().required(); // Example: "N058DB"

// Whereabouts schemas
const whereaboutsAirport = Joi.object({
    type: Joi.string().valid("airport").required(),
    airport: airportId,
}).required();

const whereaboutsPlane = Joi.object({
    type: Joi.string().valid("plane").required(),
    plane: planeId,
}).required();

const whereabouts = Joi.alternatives().try(whereaboutsAirport, whereaboutsPlane);

const packageLoadRequest = Joi.object({
    plane: planeId,
}).required();

// GET response
const packageResponse = Joi.object({
    _id: Joi.string().required(), // MongoDB ObjectId
    name: Joi.string().required(),
    type: Joi.string().valid("cargo", "passenger").required(),
    count: Joi.number().integer().min(1).required(),
    goal: airportId, // Destination airport
    whereabouts: whereabouts.required(),
    payout: Joi.number().min(0).required(), // $
    unitMass: Joi.number().min(0).required(), // kg per unit
    expiration: Joi.date().required(),
}).required();

// GET all packages query parameters
const allPackagesQuery = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
}).required();

export { packageLoadRequest, packageResponse, allPackagesQuery };
