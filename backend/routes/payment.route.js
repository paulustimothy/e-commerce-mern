import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess, handleMidtransNotification } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/midtrans-notification", handleMidtransNotification);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
