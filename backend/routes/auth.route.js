import express from "express";
import { signup, login, logout, refreshToken, getUserProfile, verifyEmail, resendVerification } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getUserProfile);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

export default router;
