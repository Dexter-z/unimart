import isAuthenticated, { isSellerAuthenticated, isUserAuthenticated } from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import { createPaymentIntent, createPaymentSession, getOrderDetails, getSellerOrders, getSellerPayments, getUserOrders, updateOrderStatus, verifyingPaymentSession, getPlatformOrderStats } from "../controllers/order.controller";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router:Router = express.Router();

router.post("/create-payment-intent", isUserAuthenticated, createPaymentIntent)
router.post("/create-payment-session", isUserAuthenticated, createPaymentSession)
router.get("/verifying-payment-session", isUserAuthenticated, verifyingPaymentSession)
router.get("/get-seller-orders", isSellerAuthenticated, getSellerOrders)
router.get("/get-seller-payments", isSellerAuthenticated, getSellerPayments)
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails) 
router.put("/update-status/:orderId", isSellerAuthenticated, updateOrderStatus)
router.get("/get-user-orders", isUserAuthenticated, getUserOrders)
router.get("/platform-order-stats", getPlatformOrderStats)

export default router;