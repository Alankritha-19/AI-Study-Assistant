import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Cpu,
  LogOut,
  Sparkles,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    conversations: 0,
    notes: 0,
    quizzes: 0,
    studyPlans: 0,
    totalSaved: 0,
  });

  const [backendHealth, setBackendHealth] = useState("Checking...");

  useEffect(() => {
    fetchStats();
    checkHealth();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/study-items/stats/summary");
      setStats(res.data);
    } catch {
      // ignore
    }
  };

  const checkHealth = async () => {
    try {
      const res = await API.get("/health");
      setBackendHealth(res.data?.status === "ok" ? "Operational" : "Degraded");
    } catch {
      setBackendHealth("Offline");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 mb-1">
          <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Account Preferences</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Settings & Profile
        </h2>
        <p className="text-xs text-slate-400">
          Manage your student profile, review usage telemetry, and inspect the AI system status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="md:col-span-1 bg-surface/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/25 mb-4">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>

          <h3 className="text-base font-bold text-white">{user?.name || "Student"}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>

          <div className="mt-5 w-full pt-4 border-t border-slate-800/80 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Account Role</span>
              </span>
              <span className="font-semibold text-white">Student</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span>Auth Type</span>
              </span>
              <span className="font-semibold text-white">JWT Protected</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* System & AI Telemetry */}
        <div className="md:col-span-2 space-y-6">
          {/* AI Engine Status */}
          <div className="bg-surface/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>AI Engine Architecture</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <p className="text-slate-400">Primary Generative Model</p>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Google Gemini 2.0 Flash</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <p className="text-slate-400">API Health</p>
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{backendHealth}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <p className="text-slate-400">Security Architecture</p>
                <p className="font-semibold text-white">
                  Zero Client Leak (Key in .env)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <p className="text-slate-400">Response Acceleration</p>
                <p className="font-semibold text-white">
                  In-Memory Multi-Tier Cache
                </p>
              </div>
            </div>
          </div>

          {/* Academic Lifetime Telemetry */}
          <div className="bg-surface/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Academic Telemetry Summary</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">Conversations</p>
                <h5 className="text-xl font-bold text-white mt-1">{stats.conversations}</h5>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">Saved Notes</p>
                <h5 className="text-xl font-bold text-indigo-400 mt-1">{stats.notes}</h5>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">Quizzes</p>
                <h5 className="text-xl font-bold text-purple-400 mt-1">{stats.quizzes}</h5>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">Study Plans</p>
                <h5 className="text-xl font-bold text-pink-400 mt-1">{stats.studyPlans}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
