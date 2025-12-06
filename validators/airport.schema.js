import Joi from "joi";

const airportId = Joi.string().required(); // Example: "KSLC"

// GeoJSON Point schema
const geoJsonPoint = Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().length(2).items(Joi.number()).required(), // [longitude, latitude]
}).required();

// GET response (airports are static, GET only)
const airportResponse = Joi.object({
    _id: airportId,
    name: Joi.string().required(),
    location: geoJsonPoint.required(),
    elevation_m: Joi.number().required(),
    runway: Joi.object({
        length_m: Joi.number().min(0).required(),
        width_m: Joi.number().min(0).required(),
        lighted: Joi.boolean().required(),
    }).required(),
}).required();

// Query parameters for nearby airports search
const nearbyQuery = Joi.object({
    radius: Joi.number().min(1).max(20000000).default(100000), // meters (default 100km)
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1), // page number, starts at 1
}).required();

// General pagination query parameters
const allAirportsQuery = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
}).required();

export { airportResponse, nearbyQuery, allAirportsQuery as allAirportsQuery };
