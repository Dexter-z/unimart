import express, { Router } from "express";
import { addUserAddress, createShop, createStripeConnectLink, deleteShopImage, deleteUserAddress, getSeller, getUser, getUserAddresses, loginSeller, loginUser, logoutSeller, logoutUser, refreshSellerToken, refreshUserToken, registerSeller, resetUserPassword, updateShop, updateUserAddress, updateUserPassword, uploadShopImage, userForgotPassword, userRegistration, verifySeller, verifyUser, verifyUserForgotPasswordOtp } from "../controller/auth.controller";
import isAuthenticated, { isUserAuthenticated, isSellerAuthenticated } from "@packages/middleware/isAuthenticated";

const router:Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.get("/logout-user", logoutUser);
router.post("/refresh-token-user", refreshUserToken)
router.get("/logged-in-user", isUserAuthenticated, getUser)
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-forgot-password-user", resetUserPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPasswordOtp);
router.post("/change-password", isAuthenticated, updateUserPassword)

router.post("/seller-registration", registerSeller)
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.put("/update-shop", isSellerAuthenticated, updateShop);
router.post("/upload-shop-image", isSellerAuthenticated, uploadShopImage);
router.delete("/delete-shop-image", isSellerAuthenticated, deleteShopImage);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.get("/logout-seller", logoutSeller);
router.post("/refresh-token-seller", refreshSellerToken)
router.get("/logged-in-seller", isSellerAuthenticated, getSeller)

// Address routes
router.get("/shipping-addresses", isUserAuthenticated, getUserAddresses);
router.post("/add-address", isUserAuthenticated, addUserAddress);
router.put("/update-address/:addressId", isUserAuthenticated, updateUserAddress);
router.delete("/delete-address/:addressId", isUserAuthenticated, deleteUserAddress);



export default router;