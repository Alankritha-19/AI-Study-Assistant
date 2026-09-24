import express from "express";
import {
  saveStudyItem,
  getStudyItems,
  getStudyItemById,
  deleteStudyItem,
  getStudyStats,
} from "../controllers/studyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // Require auth for all saved materials

// Stats summary route must be above /:id
router.get("/stats/summary", getStudyStats);

router.route("/")
  .post(saveStudyItem)
  .get(getStudyItems);

router.route("/:id")
  .get(getStudyItemById)
  .delete(deleteStudyItem);

export default router;