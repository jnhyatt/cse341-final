import j2s from "joi-to-swagger";
import {
    planePurchaseRequest,
    planeRefuelRequest,
    planeEmbarkRequest,
    planeResponse,
} from "../../../validators/plane.schema.js";

const { swagger: planePurchaseRequestSchema } = j2s(planePurchaseRequest);
const { swagger: planeRefuelRequestSchema } = j2s(planeRefuelRequest);
const { swagger: planeEmbarkRequestSchema } = j2s(planeEmbarkRequest);
const { swagger: planeResponseSchema } = j2s(planeResponse);

export {
    planePurchaseRequestSchema as planePurchaseRequest,
    planeRefuelRequestSchema as planeRefuelRequest,
    planeEmbarkRequestSchema as planeEmbarkRequest,
    planeResponseSchema as planeResponse,
};
