# 🎓 AI Study Assistant — Intelligent MERN Learning Platform

An AI-powered academic assistant built on the **MERN** stack (MongoDB, Express.js, React, Node.js) and powered by **Google Gemini API**. Designed for college students and self-learners to accelerate conceptual mastery, generate revision notes, create interactive quizzes, build personalized study roadmaps, and interact with uploaded course materials.

---

## 🚀 Key Features

* 🔐 **Secure Authentication**: User registration and login using salted password hashing (`bcryptjs`) and stateless session management with **JSON Web Tokens (JWT)**.
* 💬 **AI Tutor Chat**: Multi-turn, context-aware conversational tutoring with customizable difficulty levels (*Beginner*, *Intermediate*, *Advanced*) and auto-titling.
* 📝 **High-Yield Study Notes**: Structured, exam-ready revision notes formatted in clean Markdown with key concepts, pitfalls, and cheat-sheets.
* 🎯 **MCQ Quiz Arena**: 
  * Generates multiple-choice questions with clickable radio buttons.
  * Answers and explanations stay hidden until submission.
  * Real-time automated scoring with confetti celebration for high scores.
  * Comprehensive explanations and "Try Again" functionality.
* 📅 **Personalized Study Plans**: Customizable day-by-day learning roadmaps rendered as visual timeline cards with interactive task checklists.
* 💾 **Saved Items Library**: Unified library to filter, search, review, and delete saved notes, quizzes, and roadmaps.
* 📄 **Document Q&A (Bonus)**: Upload `.txt` and `.pdf` files, extract text with server-side parsers, and ask questions strictly grounded in your study material.
* 📥 **Client-Side Export**: Download notes as `.md`, quizzes as `.txt`/`.json`, roadmaps as `.md`, or copy formatted text with one-click clipboard tools.
* 📱 **Modern SaaS UI**: Dark-mode SaaS interface built with Tailwind CSS, responsive desktop sidebar, mobile navigation drawer, and animated feedback.

---

## 🛠️ Tech Stack

### Frontend
* **React 19** with **Vite**
* **JavaScript (ES6+)**
* **Tailwind CSS v4** (Modern dark-mode SaaS UI)
* **React Router v7** (Declarative routing & protected routes)
* **Axios** (API requests with automatic JWT interceptors)
* **Lucide React** (Clean SVG icons)
* **React Markdown** (Syntax and markdown rendering)
* **Canvas Confetti** (Celebratory quiz animations)

### Backend
* **Node.js** & **Express.js** (ES Modules)
* **MongoDB** with **Mongoose ODM**
* **JWT (jsonwebtoken)** & **bcryptjs**
* **Multer** (File upload handler)
* **pdf-parse** (PDF text extraction)
* **CORS** & **Dotenv**

### AI Engine
* **Google Gemini API** (`@google/genai` SDK)
* Zero frontend API key exposure (API key strictly protected in backend `.env`)
* Automatic fallback model cascade (`gemini-2.0-flash` ➔ `gemini-1.5-flash` ➔ `gemini-2.0-flash-lite`)

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite Client                  │
│  (Dashboard, Chat, Notes, Quiz, Plan, Documents, Auth) │
└───────────────────────────┬────────────────────────────┘
                            │ Axios (JWT Bearer Token)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Backend                   │
│   AuthMiddleware • Controllers • Multer Text Extractor │
└─────────────┬────────────────────────────┬─────────────┘
              │ Mongoose                   │ @google/genai
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│      MongoDB Database     │ │    Google Gemini API     │
│ Users•Conversations•Items │ │ (gemini-2.0-flash Model) │
└───────────────────────────┘ └──────────────────────────┘
```

---

## 🗄️ Database Schemas

### 1. User (`User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now }
}
```

### 2. Conversation (`Conversation.js`)
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New Study Session" },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 3. StudyItem (`StudyItem.js`)
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["note", "quiz", "study_plan", "plan"], required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### 4. Document (`Document.js`)
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  fileType: { type: String, enum: ["txt", "pdf"], default: "txt" },
  fileSize: { type: Number, default: 0 },
  extractedText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | **Yes** |

### AI Study Generators (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Multi-turn contextual tutor conversation | **Yes** |
| `POST` | `/api/ai/notes` | Generate structured markdown study notes | **Yes** |
| `POST` | `/api/ai/quiz` | Generate 3-10 MCQs in structured JSON | **Yes** |
| `POST` | `/api/ai/study-plan` | Generate personalized day-by-day roadmap | **Yes** |

### Conversations (`/api/conversations`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations` | List user's conversations | **Yes** |
| `POST` | `/api/conversations` | Create a new conversation session | **Yes** |
| `GET` | `/api/conversations/:id` | Get message history of conversation | **Yes** |
| `DELETE` | `/api/conversations/:id`| Delete conversation | **Yes** |

### Saved Items Library (`/api/study-items`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/study-items` | Get all saved materials (filter with `?type=`) | **Yes** |
| `POST` | `/api/study-items` | Save note, quiz, or study plan | **Yes** |
| `GET` | `/api/study-items/:id` | Fetch specific study item | **Yes** |
| `DELETE`| `/api/study-items/:id`| Delete saved item | **Yes** |
| `GET` | `/api/study-items/stats/summary` | Get aggregated academic statistics | **Yes** |

### Documents (`/api/documents`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/upload`| Upload `.txt` or `.pdf` file and extract text | **Yes** |
| `GET` | `/api/documents` | List uploaded user documents | **Yes** |
| `POST` | `/api/documents/ask` | Ask AI questions grounded in uploaded document | **Yes** |
| `DELETE`| `/api/documents/:id` | Delete uploaded document | **Yes** |

---

## ⚙️ Environment Variables

Create a `.env` file inside `backend/` (or copy `.env.example`):

```env
# Backend Server Port
PORT=5000

# MongoDB URI (Atlas or Local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/study_assistant?retryWrites=true&w=majority

# JWT Secret for Token Signing
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# AI Model Preference (Defaults to gemini-2.0-flash)
GEMINI_MODEL=gemini-2.0-flash
```

---

## 🏃 Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ai_study_assistant.git
cd ai_study_assistant
```

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your backend/.env with your GEMINI_API_KEY and MONGO_URI
npm run dev
```
Backend will start on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 🌐 MongoDB Atlas IP Whitelisting (Important for Demos)

If using MongoDB Atlas:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Under **Security**, click **Network Access**.
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`) and confirm.
*(This prevents IP blocking during college campus Wi-Fi or mobile hotspot presentations).*

---

## ⏱️ Recommended 60-Second Viva / Demo Flow

Follow this exact flow for a high-impact project demonstration:

1. **Sign In**: Log into your student account or create a new one on the sleek registration screen.
2. **Dashboard Overview**: Showcase the personalized welcome message, academic statistics counters, and recent activity feed.
3. **Generate Quiz**:
   * Click **"Create Quiz"** on the dashboard.
   * Enter Topic: `Binary Trees` and select `Intermediate`.
   * Click **Generate Quiz** (demonstrates Gemini JSON schema generation).
   * Answer the MCQs using the clickable radio buttons (notice answers are hidden until submission).
   * Click **"Submit Quiz"** ➔ Watch score calculation, celebratory confetti, and in-depth explanations.
   * Click **"Save Quiz"** to add it to your library.
4. **Generate Study Notes**:
   * Navigate to **"Study Notes"** via the sidebar.
   * Enter `Binary Trees` and click **"Generate Notes"**.
   * Review structured Markdown headings, cheat-sheet recap, and exam tips.
   * Click **"Save Notes"** and **"Download .md"** to show instant client-side export.
5. **AI Tutor Chat**:
   * Open **"AI Tutor Chat"** from the sidebar.
   * Ask: *"Explain how AVL trees self-balance."*
   * Observe response formatted with code blocks, analogies, and difficulty adaptation.
6. **Saved Items Verification**:
   * Click **"Saved Items"** in the sidebar.
   * Show both the saved `Binary Trees` quiz and study notes in your library.
   * Open the review modal and show the search filter in action.

---

## 🚀 Deployment Instructions

### Deploy Backend on Render
1. Create a **Web Service** on [Render](https://render.com).
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add Environment Variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.

### Deploy Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Add Environment Variable:
   * `VITE_API_URL`: `https://your-render-backend.onrender.com/api`
5. Deploy!

---

## 📷 Screenshots

| Dashboard | Quiz Arena |
|:---:|:---:|
| *(Modern dark SaaS overview with metrics)* | *(Interactive MCQs with scoring & confetti)* |

| AI Tutor Chat | Study Notes |
|:---:|:---:|
| *(Conversation-aware tutoring)* | *(High-yield markdown revision notes)* |

---

## 📜 Git Commit History Suggestions

```bash
git commit -m "initial MERN project setup"
git commit -m "add authentication and user models"
git commit -m "add conversation based AI chat"
git commit -m "add notes quiz and study plan generation"
git commit -m "add saved study items"
git commit -m "add responsive dashboard UI"
git commit -m "add document upload and export"
git commit -m "add deployment configuration and README"
```

---

## 📄 License
This project is open-source and created for academic demonstration purposes.
