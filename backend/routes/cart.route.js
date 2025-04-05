import express from "express";
import { getAllCartItems, addToCart, clearCart, updateCartItem } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllCartItems);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, clearCart);
router.put("/:id", protectRoute, updateCartItem);

export default router;
