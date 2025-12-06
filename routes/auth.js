import express from "express";
import passport from "../config/oauth.js";
import { handleCallback, logout } from "../controllers/auth.js";

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate OAuth login
 *     description: Redirects to Google OAuth login page
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get("/login", passport.authenticate("google", { scope: ["openid"] }));

/**
 * @swagger
 * /auth/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: OAuth callback
 *     description: Handles the OAuth callback from Google. Creates user account automatically if it doesn't exist.
 *     responses:
 *       302:
 *         description: Redirect to /me on success, /auth/login on failure
 */
router.get("/callback", passport.authenticate("google", { failureRedirect: "/auth/login" }), handleCallback);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Logout
 *     description: Logs out the current user and clears the session
 *     responses:
 *       302:
 *         description: Redirect to /me
 */
router.get("/logout", logout);

export default router;
