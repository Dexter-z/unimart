import express, { Router } from "express";

import { isAdminAuthenticated } from "@packages/middleware/isAuthenticated";

const router:Router = express.Router();



export default router;