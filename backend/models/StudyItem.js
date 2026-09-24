import mongoose from "mongoose";

const studyItemSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
  type: {
    type: String,
    enum: ["note", "quiz", "study_plan", "plan"],
    required: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "Beginner", "Intermediate", "Advanced"],
    default: "beginner",
  },
    content:{
        type:mongoose.Schema.Types.Mixed,
        required:true,
    },
},
{timestamps:true},
);

const StudyItem=mongoose.model("StudyItem",studyItemSchema);
export default StudyItem;