import j2s from "joi-to-swagger";
import { packageLoadRequest, packageResponse } from "../../../validators/package.schema.js";

const { swagger: packageLoadRequestSchema } = j2s(packageLoadRequest);
const { swagger: packageResponseSchema } = j2s(packageResponse);

export { packageLoadRequestSchema as packageLoadRequest, packageResponseSchema as packageResponse };
