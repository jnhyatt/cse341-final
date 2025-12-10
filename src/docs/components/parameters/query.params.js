import j2s from "joi-to-swagger";
import { allAirportsQuery, nearbyQuery } from "../../../validators/airport.schema.js";

const { swagger: allAirportsSwagger } = j2s(allAirportsQuery);
const { swagger: nearbySwagger } = j2s(nearbyQuery);

// Helper to convert schema properties to query parameter format
function schemaToParams(schema) {
    return Object.entries(schema.properties).map(([name, prop]) => ({
        in: "query",
        name,
        schema: prop,
        required: schema.required?.includes(name) || false,
    }));
}

export const allAirportsParams = schemaToParams(allAirportsSwagger);
export const nearbyAirportsParams = schemaToParams(nearbySwagger);
