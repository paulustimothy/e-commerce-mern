import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUserOrders, getUserOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, getAllUserOrders);
router.get("/:orderId", protectRoute, getUserOrderById);

export default router;
