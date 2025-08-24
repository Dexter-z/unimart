import express, { Router } from "express";
import { getAllProducts } from "../controllers/admin.controller";
import { isAdminAuthenticated } from "@packages/middleware/isAuthenticated";

const router:Router = express.Router();

router.get("/get-all-products",isAdminAuthenticated, getAllProducts)

export default router;