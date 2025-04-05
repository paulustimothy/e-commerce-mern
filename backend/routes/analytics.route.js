import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protectRoute, isAdmin ,getAnalytics);

export default router;
