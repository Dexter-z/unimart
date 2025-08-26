import express, { Router } from "express";
import { addNewAdmin, getAllAdmins, getAllCustomizations, getAllEvents, getAllProducts, getAllSellers, getAllUsers } from "../controllers/admin.controller";
import { isAdminAuthenticated } from "@packages/middleware/isAuthenticated";

const router:Router = express.Router();

router.get("/get-all-products",isAdminAuthenticated, getAllProducts)
router.get("/get-all-events",isAdminAuthenticated, getAllEvents)
router.get("/get-all-admins",isAdminAuthenticated, getAllAdmins)
router.put("/add-new-admin",isAdminAuthenticated, addNewAdmin)
router.get("/get-all-sellers",isAdminAuthenticated, getAllSellers)
router.get("/get-all-users",isAdminAuthenticated, getAllUsers)
router.get("/get-all-customizations",isAdminAuthenticated, getAllCustomizations)


export default router;