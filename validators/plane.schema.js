import Joi from "joi";

const planeId = Joi.string().required(); // Example: "N058DB"
const airportId = Joi.string().required(); // Example: "KSLC"

// Whereabouts schemas
const whereaboutsAirport = Joi.object({
    type: Joi.string().valid("airport").required(),
    airport: airportId,
}).required();

const whereaboutsEnRoute = Joi.object({
    type: Joi.string().valid("enRoute").required(),
    enRoute: Joi.object({
        departure: Joi.date().required(),
        origin: airportId,
        destination: airportId,
    }).required(),
}).required();

const whereabouts = Joi.alternatives().try(whereaboutsAirport, whereaboutsEnRoute);

// Param validation for tail number in URL
const planeIdParam = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9A-Z]{6}$/)
        .required(),
}).required();

// POST - Purchase new plane
const planePurchaseRequest = Joi.object({
    tailNumber: Joi.string()
        .pattern(/^[0-9A-Z]{6}$/)
        .required(), // e.g., "N058DB"
    model: Joi.string().required(), // e.g., "skyhawk"
    airport: airportId, // Airport code where plane will be placed
}).required();

// PATCH /{id}/refuel - Refuel plane
const planeRefuelRequest = Joi.object({
    amount: Joi.number().min(0).required(), // kg of fuel to add
}).required();

// PATCH /{id}/embark - Start route
const planeEmbarkRequest = Joi.object({
    destination: airportId,
}).required();

// GET response
const planeResponse = Joi.object({
    _id: planeId,
    owner: Joi.string().required(), // OAuth ID
    model: Joi.string().required(), // airplane-models._id
    whereabouts: whereabouts.required(),
    fuel: Joi.number().min(0).required(), // kg
    upgradeLevel: Joi.number().integer().min(0).max(3).required(),
    condition: Joi.number().min(0).max(100).required(),
}).required();

export { planePurchaseRequest, planeRefuelRequest, planeEmbarkRequest, planeResponse, planeIdParam };
