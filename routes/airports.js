import express from "express";
import { getAirports, getAirportById } from "../controllers/airports.js";

const router = express.Router();

/**
 * @swagger
 * /airports:
 *   get:
 *     tags:
 *       - Airports
 *     summary: Get all airports
 *     description: Retrieve a list of all airports in the system (approximately 5000 airports)
 *     responses:
 *       200:
 *         description: List of airports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AirportResponse'
 *       500:
 *         description: Server error
 */
router.get("/", getAirports);

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

export default router;
