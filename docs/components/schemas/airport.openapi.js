import j2s from "joi-to-swagger";
import { airportResponse } from "../../../validators/airport.schema.js";

const { swagger: airportResponseSchema } = j2s(airportResponse);

export { airportResponseSchema as airportResponse };
