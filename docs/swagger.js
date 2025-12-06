import swaggerJSDoc from "swagger-jsdoc";
import { userRequest, userResponse } from "./components/schemas/user.openapi.js";
import { airportResponse } from "./components/schemas/airport.openapi.js";
import {
    planePurchaseRequest,
    planeRefuelRequest,
    planeEmbarkRequest,
    planeResponse,
} from "./components/schemas/plane.openapi.js";
import { packageLoadRequest, packageResponse } from "./components/schemas/package.openapi.js";
import { airplaneModelResponse } from "./components/schemas/airplane-model.openapi.js";
import { allAirportsParams, nearbyAirportsParams } from "./components/parameters/query.params.js";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Planes",
            version: "1.0.0",
        },
        components: {
            schemas: {
                UserRequest: userRequest,
                UserResponse: userResponse,
                AirportResponse: airportResponse,
                PlanePurchaseRequest: planePurchaseRequest,
                PlaneRefuelRequest: planeRefuelRequest,
                PlaneEmbarkRequest: planeEmbarkRequest,
                PlaneResponse: planeResponse,
                PackageLoadRequest: packageLoadRequest,
                PackageResponse: packageResponse,
                AirplaneModelResponse: airplaneModelResponse,
            },
            parameters: {
                AllAirportsParams: allAirportsParams,
                NearbyAirportsParams: nearbyAirportsParams,
            },
        },
    },
    apis: ["./routes/*.js"],
};

export default swaggerJSDoc(options);
