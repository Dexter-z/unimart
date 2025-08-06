import express, { Router } from "express";
import { addUserAddress, createShop, createStripeConnectLink, deleteUserAddress, getSeller, getUser, getUserAddresses, loginSeller, loginUser, refreshSellerToken, refreshUserToken, registerSeller, resetUserPassword, userForgotPassword, userRegistration, verifySeller, verifyUser, verifyUserForgotPasswordOtp } from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router:Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token-user", refreshUserToken)
router.get("/logged-in-user", isAuthenticated, getUser)
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-forgot-password-user", resetUserPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPasswordOtp);

router.post("/seller-registration", registerSeller)
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.post("/refresh-token-seller", refreshSellerToken)
// router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller)
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller)
router.get("shipping-addresses", isAuthenticated, getUserAddresses);
router.post("add-address", isAuthenticated, addUserAddress);
router.delete("delete-address/:addressId", isAuthenticated, deleteUserAddress);



export default router;