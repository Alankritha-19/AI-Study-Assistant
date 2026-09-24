import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import route modules
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading from backend/.env, and fallback to parent directory .env
dotenv.config({ path: path.resolve(__dirname, ".env") });
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/study-items", studyRoutes);
app.use("/api/study", studyRoutes); // Backward compatibility

// Health Check Test Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "AI Study Assistant Server is healthy and running!" });
});

// Root friendly welcome
app.get("/", (req, res) => {
  res.send("AI Study Assistant API is operational.");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected internal server error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});