import fs from "fs";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/oauth.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import planesRouter from "./routes/planes.js";
import planeModelsRouter from "./routes/plane-models.js";
import airportsRouter from "./routes/airports.js";
import packagesRouter from "./routes/packages.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./docs/swagger.js";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import { performGameTicks } from "./middleware/performTicks.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

// Write swaggerSpecs to a JSON file. I set up swagger-jsdoc before I realized the assignment needs
// a static JSON file for the OpenAPI spec, but we're still going to use swagger-jsdoc to generate
// it for us so we don't have to write it by hand.
fs.writeFileSync("swagger.json", JSON.stringify(swaggerSpecs, null, 2));

const app = express();

app.use(performGameTicks);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongoUrl: process.env.MONGO_URI }),
    }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/planes", planesRouter);
app.use("/plane-models", planeModelsRouter);
app.use("/airports", airportsRouter);
app.use("/packages", packagesRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.get("/me", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "not logged in" });
    res.json(req.user);
});

app.use(errorHandler);

export default app;
