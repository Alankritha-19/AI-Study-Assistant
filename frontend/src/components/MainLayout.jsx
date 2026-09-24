import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { Menu, Sparkles, User, ShieldCheck } from "lucide-react";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/chat")) return "AI Tutor Chat";
    if (path.startsWith("/notes")) return "Study Notes Generator";
    if (path.startsWith("/quiz")) return "MCQ Quiz Arena";
    if (path.startsWith("/study-plan")) return "Study Roadmap";
    if (path.startsWith("/saved")) return "Saved Items Library";
    if (path.startsWith("/settings")) return "Settings & Profile";
    return "AI Study Assistant";
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-surface/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{getPageTitle()}</span>
              </h1>
            </div>
          </div>

          {/* Right Header Badges & User Status */}
          <div className="flex items-center gap-3">
            {/* AI Engine Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini Flash</span>
            </div>

            {/* User Profile Pill */}
            {user && (
              <Link
                to="/settings"
                className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-slate-800/60 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-semibold text-indigo-300">
                  {user.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium text-slate-300 group-hover:text-white hidden md:inline truncate max-w-[120px]">
                  {user.name}
                </span>
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
