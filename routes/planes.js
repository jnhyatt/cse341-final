import express from "express";
import {
    getPlanes,
    getPlaneById,
    purchasePlane,
    upgradePlane,
    embarkPlane,
    refuelPlane,
    repairPlane,
    deletePlane,
} from "../controllers/planes.js";
import { validateParams } from "../middleware/validate.js";
import { planeIdParam } from "../validators/plane.schema.js";

const router = express.Router();

/**
 * @swagger
 * /planes:
 *   get:
 *     summary: Get all planes
 *     description: Returns all planes in the system regardless of owner. Public endpoint for viewing the complete fleet.
 *     tags: [Planes]
 *     responses:
 *       200:
 *         description: List of all planes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlaneResponse'
 */
router.get("/", getPlanes);

/**
 * @swagger
 * /planes/{id}:
 *   get:
 *     summary: Get a specific plane by tail number
 *     description: Returns detailed information about a single plane. Public endpoint.
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft tail number (e.g., N058DB)
 *         example: N058DB
 *     responses:
 *       200:
 *         description: Plane details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlaneResponse'
 *       404:
 *         description: Plane not found
 */
router.get("/:id", validateParams(planeIdParam), getPlaneById);

/**
 * @swagger
 * /planes:
 *   post:
 *     summary: Purchase a new plane
 *     description: Buy a new plane with a user-supplied tail number and place it at the specified airport. Authenticated user becomes the owner. Deducts cost from user's funds. Client should check tail number availability via GET /planes/:id first.
 *     tags: [Planes]
 *     security:
 *       - oauth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanePurchaseRequest'
 *     responses:
 *       201:
 *         description: Plane purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlaneResponse'
 *       400:
 *         description: Invalid request (invalid model, invalid airport, invalid tail number format)
 *       401:
 *         description: Not authenticated
 *       402:
 *         description: Insufficient funds
 *       404:
 *         description: Airport not found
 *       409:
 *         description: Tail number already exists
 */
router.post("/", purchasePlane);

/**
 * @swagger
 * /planes/{id}/upgrade:
 *   put:
 *     summary: Upgrade plane to next level
 *     description: Increments upgrade level by 1 (max level 3). Requires authentication and plane ownership. Deducts upgrade cost from user's funds.
 *     tags: [Planes]
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft tail number
 *         example: N058DB
 *     responses:
 *       200:
 *         description: Plane upgraded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlaneResponse'
 *       400:
 *         description: Cannot upgrade (already at max level 3)
 *       401:
 *         description: Not authenticated
 *       402:
 *         description: Insufficient funds
 *       403:
 *         description: Not the plane owner
 *       404:
 *         description: Plane not found
 */
router.put("/:id/upgrade", validateParams(planeIdParam), upgradePlane);

/**
 * @swagger
 * /planes/{id}/embark:
 *   put:
 *     summary: Depart for destination airport
 *     description: Start a flight to the specified airport. Requires authentication, plane ownership, and sufficient fuel. Plane must be at an airport (not already en route).
 *     tags: [Planes]
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft tail number
 *         example: N058DB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlaneEmbarkRequest'
 *     responses:
 *       200:
 *         description: Flight started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlaneResponse'
 *       400:
 *         description: Cannot embark (insufficient fuel, already en route, destination same as current location)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not the plane owner
 *       404:
 *         description: Plane or destination airport not found
 */
router.put("/:id/embark", validateParams(planeIdParam), embarkPlane);

/**
 * @swagger
 * /planes/{id}/refuel:
 *   patch:
 *     summary: Add fuel to plane
 *     description: Refuel the plane by specified amount in kilograms. Requires authentication and plane ownership. Cannot exceed fuel capacity. Deducts fuel cost from user's funds.
 *     tags: [Planes]
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft tail number
 *         example: N058DB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlaneRefuelRequest'
 *     responses:
 *       200:
 *         description: Plane refueled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlaneResponse'
 *       400:
 *         description: Cannot refuel (would exceed fuel capacity, plane en route)
 *       401:
 *         description: Not authenticated
 *       402:
 *         description: Insufficient funds
 *       403:
 *         description: Not the plane owner
 *       404:
 *         description: Plane not found
 */
router.patch("/:id/refuel", validateParams(planeIdParam), refuelPlane);

/**
 * @swagger
 * /planes/{id}/repair:
 *   patch:
 *     summary: Repair plane to 100% condition
 *     description: Fully repairs the plane to 100% condition. Requires authentication and plane ownership. Deducts repair cost from user's funds.
 *     tags: [Planes]
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft tail number
 *         example: N058DB
 *     responses:
 *       200:
 *         description: Plane repaired successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlaneResponse'
 *       401:
 *         description: Not authenticated
 *       402:
 *         description: Insufficient funds
 *       403:
 *         description: Not the plane owner
 *       404:
 *         description: Plane not found
 */
router.patch("/:id/repair", validateParams(planeIdParam), repairPlane);

/**
 * @swagger
 * /planes/{id}:
 *   delete:
 *     summary: Decommission plane
 *     description: Permanently removes the plane from service with no refund. Requires authentication and plane ownership.
 *     tags: [Planes]
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft tail number
 *         example: N058DB
 *     responses:
 *       204:
 *         description: Plane decommissioned successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not the plane owner
 *       404:
 *         description: Plane not found
 */
router.delete("/:id", validateParams(planeIdParam), deletePlane);

export default router;
