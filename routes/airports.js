import express from "express";
import { getAirports, getAirportById, getNearbyAirports } from "../controllers/airports.js";
import { validateQuery } from "../middleware/validate.js";
import { nearbyQuery, allAirportsQuery } from "../validators/airport.schema.js";

const router = express.Router();

/**
 * @swagger
 * /airports:
 *   get:
 *     tags:
 *       - Airports
 *     summary: Get all airports
 *     description: Retrieve a paginated list of airports in the system sorted alphabetically by code
 *     parameters:
 *       - $ref: '#/components/parameters/AllAirportsParams/0'
 *       - $ref: '#/components/parameters/AllAirportsParams/1'
 *     responses:
 *       200:
 *         description: List of airports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AirportResponse'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get("/", validateQuery(allAirportsQuery), getAirports);

/**
 * @swagger
 * /airports/{id}:
 *   get:
 *     tags:
 *       - Airports
 *     summary: Get a specific airport
 *     description: Retrieve details of a single airport by its code (e.g., KSLC, KJFK)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The airport code (ICAO identifier)
 *         example: "KSLC"
 *     responses:
 *       200:
 *         description: Airport retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AirportResponse'
 *       404:
 *         description: Airport not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getAirportById);

/**
 * @swagger
 * /airports/near/{id}:
 *   get:
 *     tags:
 *       - Airports
 *     summary: Find airports near another airport
 *     description: Retrieve airports within a specified radius of a given airport
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The center airport code (ICAO identifier)
 *         example: "KSLC"
 *       - $ref: '#/components/parameters/NearbyAirportsParams/0'
 *       - $ref: '#/components/parameters/NearbyAirportsParams/1'
 *       - $ref: '#/components/parameters/NearbyAirportsParams/2'
 *     responses:
 *       200:
 *         description: List of nearby airports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AirportResponse'
 *       404:
 *         description: Center airport not found
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get("/near/:id", validateQuery(nearbyQuery), getNearbyAirports);

export default router;
