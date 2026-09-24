import express from "express";
import {
  chatWithAI,
  generateExplanation,
  generateNotes,
  generateQuiz,
  generateStudyPlan,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected AI routes (users must be logged in to query the AI)
router.post("/chat", protect, chatWithAI);
router.post("/explain", protect, generateExplanation);
router.post("/notes", protect, generateNotes);
router.post("/quiz", protect, generateQuiz);
router.post("/study-plan", protect, generateStudyPlan);
router.post("/plan", protect, generateStudyPlan);

export default router;