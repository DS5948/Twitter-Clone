import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getConversationById, getMessages, getUserConversations, sendMessage, startConversation } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/startConversation", protectRoute, startConversation)
router.post("/messages/send", protectRoute, sendMessage)
router.get("/messages/:conversationId", protectRoute, getMessages)
router.get("/conversations", protectRoute, getUserConversations)
router.get("/conversation/:conversationId", protectRoute, getConversationById)

export default router;
