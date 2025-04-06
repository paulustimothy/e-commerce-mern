import express from "express";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, isAdmin ,getAnalytics);

export default router;
