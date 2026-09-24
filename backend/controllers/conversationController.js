import Conversation from "../models/Conversation.js";

// @route   POST /api/conversations
// @desc    Create a new conversation session
export const createConversation = async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title || "New Study Session",
      messages: [],
    });
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Failed to create conversation", error: error.message });
  }
};

// @route   GET /api/conversations
// @desc    Get all conversations for the logged-in user
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
  }
};

// @route   GET /api/conversations/:id
// @desc    Get a single conversation with its message history
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversation", error: error.message });
  }
};

// @route   POST /api/conversations/:id/messages
// @desc    Append user and assistant messages to a conversation
export const addMessageToConversation = async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ message: "Role and content are required" });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Add message
    conversation.messages.push({ role, content });

    // Auto-update conversation title from the first message if still default
    if (conversation.title === "New Study Session" && role === "user") {
      conversation.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
    }

    await conversation.save();
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Failed to append message", error: error.message });
  }
};

// @route   DELETE /api/conversations/:id
// @desc    Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    const deleted = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete conversation", error: error.message });
  }
};