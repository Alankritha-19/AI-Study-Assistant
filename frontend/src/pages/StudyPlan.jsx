import { useState } from "react";
import API from "../services/api";
import { downloadStudyPlan, copyToClipboard } from "../services/exportUtils";
import {
  Calendar,
  Sparkles,
  Bookmark,
  Copy,
  Download,
  Check,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ListTodo,
} from "lucide-react";

export default function StudyPlan() {
  const [topic, setTopic] = useState("Data Structures & Algorithms");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [days, setDays] = useState(7);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [plan, setPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  const handleGeneratePlan = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setErrorMessage("");
    setPlan(null);
    setCompletedTasks({});
    setSavedSuccess(false);

    try {
      const res = await API.post("/ai/study-plan", {
        topic: topic.trim(),
        difficulty,
        days: Number(days) || 7,
      });

      setPlan(res.data.plan || null);
    } catch (err) {
      console.error("Study plan error:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to generate study plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (dayIndex, taskIndex) => {
    const key = `${dayIndex}-${taskIndex}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePlan = async () => {
    if (!plan || saving) return;
    setSaving(true);
    try {
      await API.post("/study-items", {
        type: "study_plan",
        topic: topic.trim(),
        difficulty,
        content: plan,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save study plan: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!plan) return;
    let text = `# ${plan.title || topic + " Study Plan"}\n\n`;
    if (Array.isArray(plan.days)) {
      plan.days.forEach((d) => {
        text += `Day ${d.day}: ${d.topic} (${d.estimatedTime || "60 mins"})\n`;
        if (Array.isArray(d.tasks)) {
          d.tasks.forEach((t) => {
            text += `  - ${t}\n`;
          });
        }
      });
    }
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (plan) {
      downloadStudyPlan(plan, topic);
    }
  };

  const sampleTopics = [
    "Data Structures & Algorithms",
    "System Design Fundamentals",
    "Full-Stack Web Development",
    "Computer Networks",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold border border-pink-500/20 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Curriculum Roadmaps</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Personalized Study Plan
          </h2>
          <p className="text-xs text-slate-400">
            Build day-by-day learning roadmaps with realistic targets and task checklists.
          </p>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {sampleTopics.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-surface/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-lg">
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Subject
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Python for Beginners, Linear Algebra, Machine Learning"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Duration (Days)
              </label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="3">3 Days (Sprint)</option>
                <option value="5">5 Days</option>
                <option value="7">7 Days (1 Week)</option>
                <option value="14">14 Days (2 Weeks)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Curriculum...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Plan Rendered as Visual Cards / Timeline */}
      {plan && (
        <div className="space-y-5">
          {/* Action Bar */}
          <div className="p-4 bg-surface/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <h3 className="font-bold text-sm text-white">{plan.title || topic}</h3>
              <p className="text-[11px] text-slate-400">
                {plan.days?.length || days} Day Roadmap • Level: {difficulty}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>

              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{saving ? "Saving..." : "Save Plan"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Timeline of Days */}
          <div className="space-y-4">
            {Array.isArray(plan.days) &&
              plan.days.map((dayItem, dIdx) => (
                <div
                  key={dIdx}
                  className="bg-surface/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-md transition-all shadow-md"
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        D{dayItem.day}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-white">
                        {dayItem.topic}
                      </h4>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-medium text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{dayItem.estimatedTime || "60 mins"}</span>
                    </span>
                  </div>

                  {/* Task Checklist */}
                  <div className="space-y-2">
                    {Array.isArray(dayItem.tasks) &&
                      dayItem.tasks.map((task, tIdx) => {
                        const isDone = !!completedTasks[`${dIdx}-${tIdx}`];
                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleTask(dIdx, tIdx)}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                              isDone
                                ? "bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through"
                                : "bg-slate-900/60 border-slate-800/80 text-slate-200 hover:bg-slate-900"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => {}} // handled by parent onClick
                              className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="flex-1 leading-relaxed">{task}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
