import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("⚠️ Neither MONGO_URI nor MONGODB_URI is defined in environment variables.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB connection error: ${error.message}`);
    console.error("👉 Note for MongoDB Atlas: Ensure your current IP is whitelisted under Network Access in Atlas (choose 'Allow Access From Anywhere' / 0.0.0.0/0 for demos).");
    console.error("👉 Alternatively, install and start a local MongoDB instance (mongodb://localhost:27017/ai_study_assistant).");
  }
};

export default connectDB;