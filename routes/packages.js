import express from "express";
import { getPackages, getPackageById, loadPackage, unloadPackage } from "../controllers/packages.js";

const router = express.Router();

/**
 * @swagger
 * /packages:
 *   get:
 *     summary: Get all packages
 *     description: Returns all packages in the system regardless of location (airport or plane). Public endpoint.
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of all packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PackageResponse'
 */
router.get("/", getPackages);

/**
 * @swagger
 * /packages/{id}:
 *   get:
 *     summary: Get a specific package
 *     description: Returns detailed information about a single package. Public endpoint.
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Package details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageResponse'
 *       404:
 *         description: Package not found
 */
router.get("/:id", getPackageById);

/**
 * @swagger
 * /packages/{id}/load:
 *   put:
 *     summary: Load package onto a plane
 *     description: Loads the package onto the specified plane. Requires authentication and plane ownership. Package must be at an airport (not already on a plane), and the plane must be at the same airport as the package.
 *     tags: [Packages]
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageMoveRequest'
 *     responses:
 *       200:
 *         description: Package loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageResponse'
 *       400:
 *         description: Cannot load package (already on a plane, plane not at same airport, plane en route)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not the plane owner
 *       404:
 *         description: Package or plane not found
 */
router.put("/:id/load", loadPackage);

/**
 * @swagger
 * /packages/{id}/unload:
 *   put:
 *     summary: Unload package from plane to airport
 *     description: Unloads the package from its current plane to the plane's current airport. Requires authentication and ownership of the plane carrying the package. Package must be on a plane (not at airport), and the plane must not be en route.
 *     tags: [Packages]
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Package unloaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageResponse'
 *       400:
 *         description: Cannot unload package (not on a plane, plane en route)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not the owner of the plane carrying the package
 *       404:
 *         description: Package not found
 */
router.put("/:id/unload", unloadPackage);

export default router;
