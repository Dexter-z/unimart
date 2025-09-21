import express, { Router } from "express";
import { addNewAdmin, getAllAdmins, getAllCustomizations, getAllEvents, getAllProducts, getAllSellers, getAllUsers, getCategories, addCategory, addSubCategory, deleteCategory, deleteSubCategory, uploadLogo, uploadBanner, getAllNotifications, getAllUsersNotifications, markAdminNotificationAsRead } from "../controllers/admin.controller";

import isAuthenticated, { isAdminAuthenticated } from "@packages/middleware/isAuthenticated";

const router:Router = express.Router();

router.get("/get-all-products",isAdminAuthenticated, getAllProducts)
router.get("/get-all-events",isAdminAuthenticated, getAllEvents)
router.get("/get-all-admins",isAdminAuthenticated, getAllAdmins)
router.put("/add-new-admin",isAdminAuthenticated, addNewAdmin)
router.get("/get-all-sellers",isAdminAuthenticated, getAllSellers)
router.get("/get-all-users",isAdminAuthenticated, getAllUsers)
router.get("/get-all-customizations",isAdminAuthenticated, getAllCustomizations)


router.get('/get-all-notifications', isAdminAuthenticated, getAllNotifications);
router.post("/mark-admin-notification-as-read", isAdminAuthenticated, markAdminNotificationAsRead);
router.get('/get-user-notifications', isAuthenticated, getAllUsersNotifications);

// --- Customization routes ---
router.get("/get-categories", isAdminAuthenticated, getCategories);
router.put("/add-category", isAdminAuthenticated, addCategory);
router.put("/add-subcategory", isAdminAuthenticated, addSubCategory);
router.delete("/delete-category/:category", isAdminAuthenticated, deleteCategory);
router.delete("/delete-subcategory", isAdminAuthenticated, deleteSubCategory);
router.put("/upload-logo", isAdminAuthenticated, uploadLogo);
router.put("/upload-banner", isAdminAuthenticated, uploadBanner);


export default router;