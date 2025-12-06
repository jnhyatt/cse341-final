import j2s from "joi-to-swagger";
import { airplaneModelResponse } from "../../../validators/airplane-model.schema.js";

const { swagger: airplaneModelResponseSchema } = j2s(airplaneModelResponse);

export { airplaneModelResponseSchema as airplaneModelResponse };
