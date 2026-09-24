import StudyItem from "../models/StudyItem.js";
import Conversation from "../models/Conversation.js";

// @route   POST /api/study-items or /api/study
// @desc    Save a note, quiz, or study plan
export const saveStudyItem = async (req, res) => {
  try {
    const { type, topic, difficulty, content } = req.body;

    if (!type || !topic || !content) {
      return res.status(400).json({ message: "Type, topic, and content are required" });
    }

    // Normalize type
    let normalizedType = type.toLowerCase();
    if (normalizedType === "plan") normalizedType = "study_plan";

    const item = await StudyItem.create({
      userId: req.user._id,
      type: normalizedType,
      topic: topic.trim(),
      difficulty: difficulty ? difficulty.toLowerCase() : "beginner",
      content,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to save study item", error: error.message });
  }
};

// @route   GET /api/study-items or /api/study
// @desc    Get all saved study items (supports ?type=note|quiz|study_plan|plan)
export const getStudyItems = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.type) {
      const qType = req.query.type.toLowerCase();
      if (qType === "plan" || qType === "study_plan") {
        filter.type = { $in: ["plan", "study_plan"] };
      } else {
        filter.type = qType;
      }
    }

    const items = await StudyItem.find(filter).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study items", error: error.message });
  }
};

// @route   GET /api/study-items/:id or /api/study/:id
// @desc    Get a single saved study item by ID
export const getStudyItemById = async (req, res) => {
  try {
    const item = await StudyItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Study item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study item", error: error.message });
  }
};

// @route   DELETE /api/study-items/:id or /api/study/:id
// @desc    Delete a saved study item
export const deleteStudyItem = async (req, res) => {
  try {
    const deleted = await StudyItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Study item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
};

// @route   GET /api/study-items/stats/summary or /api/study/stats/summary
// @desc    Get statistics for user (counts of conversations, notes, quizzes, study plans)
export const getStudyStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [convCount, notesCount, quizCount, planCount] = await Promise.all([
      Conversation.countDocuments({ userId }),
      StudyItem.countDocuments({ userId, type: "note" }),
      StudyItem.countDocuments({ userId, type: "quiz" }),
      StudyItem.countDocuments({ userId, type: { $in: ["study_plan", "plan"] } }),
    ]);

    res.status(200).json({
      conversations: convCount,
      notes: notesCount,
      quizzes: quizCount,
      studyPlans: planCount,
      totalSaved: notesCount + quizCount + planCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study stats", error: error.message });
  }
};