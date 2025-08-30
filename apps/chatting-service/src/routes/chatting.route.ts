import isAuthenticated, { isSellerAuthenticated, isUserAuthenticated } from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import { fetchMessages, fetchSellerMessages, getSellerConversations, getUserConversations, newConversation } from "../controllers/chatting.controllers";


const router:Router = express.Router();

router.post("/create-user-conversationGroup", isAuthenticated, newConversation)
router.get("/get-user-conversations", isAuthenticated, getUserConversations)
router.get("/get-seller-conversations", isAuthenticated, isSellerAuthenticated, getSellerConversations)
router.get("/get-messages/:conversationId", isAuthenticated, fetchMessages)
router.get("/get-seller-messages/:conversationId", isAuthenticated, isSellerAuthenticated, fetchSellerMessages)

export default router;