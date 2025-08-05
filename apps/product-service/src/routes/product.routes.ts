import express, { Router } from "express";
import { createDiscountCodes, createProduct, deleteDiscountCodes, deleteProduct, deleteProductImage, getAllProducts, getCategories, getDiscountCodeByName, getDiscountCodes, getShopProducts, restoreProduct, uploadProductImage, searchProducts, getProductDetails, getFilteredEvents, getFilteredProducts, getFilteredShops, topShops } from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/search-products", searchProducts)
router.get("/get-categories", getCategories)
router.post("/create-discount-code",isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes",isAuthenticated, getDiscountCodes);
router.get("/get-discount-code/:code", getDiscountCodeByName);
router.delete("/delete-discount-code/:id",isAuthenticated, deleteDiscountCodes);
router.post("/upload-product-image", isAuthenticated, uploadProductImage)
router.delete("/delete-product-image", isAuthenticated, deleteProductImage)
router.post("/create-product", isAuthenticated, createProduct)
router.get("/get-shop-products", isAuthenticated, getShopProducts)
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct)
router.put("/restore-product/:productId", isAuthenticated, restoreProduct)
router.get("/get-all-products",  getAllProducts)
router.get("/get-product/:slug", getProductDetails)
router.get("/get-filtered-products", getFilteredProducts) 
router.get("/get-filtered-events", getFilteredEvents) 
router.get("/get-filtered-shops", getFilteredShops)
router.get("/top-shops", topShops)



export default router;
