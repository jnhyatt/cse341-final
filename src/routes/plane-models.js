import express from "express";
import { getPlaneModels, getPlaneModelById } from "../controllers/plane-models.js";

const router = express.Router();

/**
 * @swagger
 * /plane-models:
 *   get:
 *     summary: Get all airplane models
 *     description: Returns the catalog of available airplane models that can be purchased. Public endpoint.
 *     tags: [Plane Models]
 *     responses:
 *       200:
 *         description: List of all airplane models
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AirplaneModelResponse'
 */
router.get("/", getPlaneModels);

/**
 * @swagger
 * /plane-models/{id}:
 *   get:
 *     summary: Get a specific airplane model
 *     description: Returns detailed specifications for a specific airplane model. Public endpoint.
 *     tags: [Plane Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Model ID
 *         example: skyhawk
 *     responses:
 *       200:
 *         description: Airplane model details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AirplaneModelResponse'
 *       404:
 *         description: Model not found
 */
router.get("/:id", getPlaneModelById);

export default router;
