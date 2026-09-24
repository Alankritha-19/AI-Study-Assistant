import express from "express";
import {
  createConversation,
  getConversations,
  getConversationById,
  addMessageToConversation,
  deleteConversation,
} from "../controllers/conversationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All conversation routes require authentication

router.route("/")
  .post(createConversation)
  .get(getConversations);

router.route("/:id")
  .get(getConversationById)
  .delete(deleteConversation);

router.post("/:id/messages", addMessageToConversation);

export default router;