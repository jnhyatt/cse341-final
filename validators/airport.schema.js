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

export { airportResponse };
