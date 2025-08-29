import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  getCategories,
  getDiscountCodes,
  getProducts,
  restoreProduct,
} from "../controllers/product.controller";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getProducts);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);
export default router;
