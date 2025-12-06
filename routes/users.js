import { getUserById, updateUser, deleteUser } from "../controllers/users.js";
import express from "express";
import { requireAuth, requireSelf } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { userRequest } from "../validators/user.schema.js";

const router = express.Router();

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a specific user
 *     description: Retrieve details of a single user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (OAuth ID)
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 funds:
 *                   type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user information
 *     description: Update user account details (user can only update their own account)
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (OAuth ID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - not logged in
 *       403:
 *         description: Forbidden - can only modify your own resources
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/:id", requireAuth, requireSelf, validate(userRequest), updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user account
 *     description: Delete a user account (user can only delete their own account)
 *     security:
 *       - oauth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (OAuth ID)
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - not logged in
 *       403:
 *         description: Forbidden - can only delete your own account
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", requireAuth, requireSelf, deleteUser);

export default router;
