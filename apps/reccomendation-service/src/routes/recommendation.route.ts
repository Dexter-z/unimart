import express, { Router } from "express";

import isAuthenticated, { isAdminAuthenticated, isUserAuthenticated } from "@packages/middleware/isAuthenticated";
import { getRecommendedProducts } from "../controllers/recommendation.controller";

const router:Router = express.Router();

router.get("/get-recommendation-products", isUserAuthenticated, getRecommendedProducts)

export default router;