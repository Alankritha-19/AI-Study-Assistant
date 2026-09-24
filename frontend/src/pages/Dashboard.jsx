import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Calendar,
  Bookmark,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    conversations: 0,
    notes: 0,
    quizzes: 0,
    studyPlans: 0,
  });

  const [recentChats, setRecentChats] = useState([]);
  const [recentSaved, setRecentSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch statistics
      try {
        const statsRes = await API.get("/study-items/stats/summary");
        setStats(statsRes.data);
      } catch {
        // fallback if stats route is unavailable
      }

      // 2. Fetch recent conversations
      try {
        const chatsRes = await API.get("/conversations");
        setRecentChats(chatsRes.data.slice(0, 4));
      } catch {
        // fallback
      }

      // 3. Fetch recently saved study materials
      try {
        const savedRes = await API.get("/study-items");
        setRecentSaved(savedRes.data.slice(0, 4));
      } catch {
        // fallback
      }
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Explain a Topic",
      tagline: "Understand any concept with AI",
      description: "Chat with your AI Tutor to break down complex theories, equations, or code.",
      path: "/chat",
      icon: MessageSquare,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20",
      accent: "text-blue-400",
    },
    {
      title: "Generate Notes",
      tagline: "Create concise revision notes",
      description: "Produce exam-ready summaries, key concepts, formulas, and cheatsheets.",
      path: "/notes",
      icon: BookOpen,
      color: "from-indigo-500 to-purple-600",
      shadow: "shadow-indigo-500/20",
      accent: "text-indigo-400",
    },
    {
      title: "Create Quiz",
      tagline: "Test your knowledge with MCQs",
      description: "Generate interactive multiple-choice questions with instant scoring.",
      path: "/quiz",
      icon: HelpCircle,
      color: "from-purple-500 to-pink-600",
      shadow: "shadow-purple-500/20",
      accent: "text-purple-400",
    },
    {
      title: "Study Plan",
      tagline: "Build a personalized roadmap",
      description: "Get structured day-by-day learning schedules tailored to your exams.",
      path: "/study-plan",
      icon: Calendar,
      color: "from-pink-500 to-rose-600",
      shadow: "shadow-pink-500/20",
      accent: "text-pink-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Academic Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || "Student"}! 👋
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            What would you like to master today? Generate high-yield study notes, challenge yourself with interactive quizzes, or chat directly with your AI tutor.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => navigate("/quiz")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Quick Quiz: Binary Trees</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/notes")}
              className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
            >
              <span>Draft Revision Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Conversations",
            val: stats.conversations,
            icon: MessageSquare,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Notes Saved",
            val: stats.notes,
            icon: BookOpen,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Quizzes Taken",
            val: stats.quizzes,
            icon: HelpCircle,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            label: "Study Plans",
            val: stats.studyPlans,
            icon: Calendar,
            color: "text-pink-400",
            bg: "bg-pink-500/10",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-surface/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {loading ? "..." : item.val}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Quick Actions</h3>
          <span className="text-xs text-slate-400">Select an AI tool to begin</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                className="group bg-surface/70 hover:bg-surface border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white mb-4 ${action.shadow} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white group-hover:text-indigo-300 transition">
                    {action.title}
                  </h4>
                  <p className={`text-xs font-semibold mt-0.5 ${action.accent}`}>
                    "{action.tagline}"
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-white transition">
                  <span>Start Now</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Recent Conversations & Recently Saved */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="bg-surface/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Recent Conversations</h3>
              </div>
              <Link
                to="/chat"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentChats.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No active study chats yet.</p>
                <button
                  onClick={() => navigate("/chat")}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 hover:bg-indigo-600/30 transition"
                >
                  Start your first conversation
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="min-w-0 pr-3">
                      <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate">
                        {chat.title || "Untitled Session"}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform shrink-0">
                      Open →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently Saved Study Materials */}
        <div className="bg-surface/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Recently Saved Materials</h3>
              </div>
              <Link
                to="/saved"
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
              >
                <span>Browse Library</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentSaved.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No saved study items yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Generate notes or quizzes and save them to your library.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSaved.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate("/saved")}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {item.type}
                        </span>
                        <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 transition truncate">
                          {item.topic}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Level: {item.difficulty}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-purple-400 font-medium group-hover:translate-x-0.5 transition-transform shrink-0">
                      View →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}