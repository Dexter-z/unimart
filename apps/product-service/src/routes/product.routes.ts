import express, { Router } from "express";
import { createDiscountCodes, createProduct, deleteDiscountCodes, deleteProduct, deleteProductImage, getAllProducts, getCategories, getDiscountCodeByName, getDiscountCodes, getShopProducts, restoreProduct, uploadProductImage, searchProducts, searchShops, getProductDetails, getFilteredEvents, getFilteredProducts, getFilteredShops, topShops, getRecommendedProducts } from "../controllers/product.controller";
import isAuthenticated, { isSellerAuthenticated, isUserAuthenticated } from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/search-products", searchProducts)
router.get("/search-shops", searchShops)
router.get("/get-categories", getCategories)
router.post("/create-discount-code", isSellerAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isSellerAuthenticated, getDiscountCodes);
router.get("/get-discount-code/:code", getDiscountCodeByName);
router.delete("/delete-discount-code/:id", isSellerAuthenticated, deleteDiscountCodes);
router.post("/upload-product-image", isSellerAuthenticated, uploadProductImage)
router.delete("/delete-product-image", isSellerAuthenticated, deleteProductImage)
router.post("/create-product", isSellerAuthenticated, createProduct)
router.get("/get-shop-products", isSellerAuthenticated, getShopProducts)
router.delete("/delete-product/:productId", isSellerAuthenticated, deleteProduct)
router.put("/restore-product/:productId", isSellerAuthenticated, restoreProduct)
router.get("/get-all-products",  getAllProducts)
router.get("/get-product/:slug", getProductDetails)
router.get("/get-filtered-products", getFilteredProducts) 
router.get("/get-filtered-events", getFilteredEvents) 
router.get("/get-filtered-shops", getFilteredShops)
router.get("/top-shops", topShops)
router.post("/recommended", getRecommendedProducts)



export default router;
