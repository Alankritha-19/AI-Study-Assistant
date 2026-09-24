import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Calendar,
  Bookmark,
  Settings,
  Plus,
  Trash2,
  LogOut,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (user) {
      fetchRecentConversations();
    }
  }, [user, location.pathname]);

  const fetchRecentConversations = async () => {
    try {
      const res = await API.get("/conversations");
      setConversations(res.data.slice(0, 6)); // Top 6 recent conversations
    } catch {
      // silently ignore if not yet available
    }
  };

  const handleNewChat = () => {
    if (onClose) onClose();
    navigate("/chat");
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (location.pathname === `/chat/${id}`) {
        navigate("/chat");
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "AI Tutor Chat", path: "/chat", icon: MessageSquare },
    { label: "Study Notes", path: "/notes", icon: BookOpen },
    { label: "MCQ Quizzes", path: "/quiz", icon: HelpCircle },
    { label: "Study Plans", path: "/study-plan", icon: Calendar },
    { label: "Saved Items", path: "/saved", icon: Bookmark },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-surface/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                StudyWell
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  AI
                </span>
              </span>
              <p className="text-[11px] text-slate-400">Study Partner</p>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Primary Action */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Recent Conversations Subsection */}
          {conversations.length > 0 && (
            <div className="pt-4 mt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Recent Chats
                </span>
                <Link
                  to="/chat"
                  onClick={onClose}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-1 mt-1">
                {conversations.map((conv) => {
                  const isCurrent = location.pathname === `/chat/${conv._id}`;
                  return (
                    <div
                      key={conv._id}
                      onClick={() => {
                        if (onClose) onClose();
                        navigate(`/chat/${conv._id}`);
                      }}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                        isCurrent
                          ? "bg-slate-800 text-white font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="truncate flex-1 pr-2">
                        {conv.title || "Untitled Session"}
                      </span>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Card & Logout Footer */}
        {user && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
