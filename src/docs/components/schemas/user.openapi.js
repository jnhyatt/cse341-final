import j2s from "joi-to-swagger";
import { userRequest, userResponse } from "../../../validators/user.schema.js";

const { swagger: userRequestSchema } = j2s(userRequest);
const { swagger: userResponseSchema } = j2s(userResponse);

export { userRequestSchema as userRequest, userResponseSchema as userResponse };
