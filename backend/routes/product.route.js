import express from "express";
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getRecommendations, getProductsByCategory, toggleFeaturedProduct } from "../controllers/product.controller.js";
import { isAdmin, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, isAdmin, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendations);
router.get("/category/:category", getProductsByCategory);

router.post("/", protectRoute, isAdmin, createProduct);

router.patch("/:id", protectRoute, isAdmin, toggleFeaturedProduct);

router.delete("/:id", protectRoute, isAdmin, deleteProduct);

export default router;
