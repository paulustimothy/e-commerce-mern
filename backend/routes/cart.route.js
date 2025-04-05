import express from "express";
import { getAllCartItems, addToCart, clearCart, updateCartItem } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", getAllCartItems);
router.post("/", addToCart);
router.delete("/", clearCart);
router.put("/:id", updateCartItem);

export default router;
