# AI Study Assistant — Intelligent Learning Platform #

An AI-powered academic assistant built on the **MERN** stack (MongoDB, Express.js, React, Node.js) and powered by **Google Gemini API**. Designed for college students and self-learners to accelerate conceptual mastery, generate revision notes, create interactive quizzes, build personalized study roadmaps, and interact with uploaded course materials.

---

## Key Features

**Secure Authentication**: User registration and login using salted password hashing (`bcryptjs`) and stateless session management with **JSON Web Tokens (JWT)**.
**AI Tutor Chat**: Multi-turn, context-aware conversational tutoring with customizable difficulty levels (*Beginner*, *Intermediate*, *Advanced*) and auto-titling.
**High-Yield Study Notes**: Structured, exam-ready revision notes formatted in clean Markdown with key concepts, pitfalls, and cheat-sheets.
**MCQ Quiz Arena**: 
  * Generates multiple-choice questions with clickable radio buttons.
  * Answers and explanations stay hidden until submission.
  * Real-time automated scoring with confetti celebration for high scores.
  * Comprehensive explanations and "Try Again" functionality.
 **Personalized Study Plans**: Customizable day-by-day learning roadmaps rendered as visual timeline cards with interactive task checklists.
**Saved Items Library**: Unified library to filter, search, review, and delete saved notes, quizzes, and roadmaps
**Client-Side Export**: Download notes as `.md`, quizzes as `.txt`/`.json`, roadmaps as `.md`, or copy formatted text with one-click clipboard tools.

---

## Tech Stack

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

