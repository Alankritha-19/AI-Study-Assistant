import { useState } from "react";
import ReactMarkdown from "react-markdown";
import API from "../services/api";
import { downloadMarkdown, copyToClipboard } from "../services/exportUtils";
import {
  BookOpen,
  Sparkles,
  Bookmark,
  Copy,
  Download,
  Check,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function Notes() {
  const [topic, setTopic] = useState("Binary Trees");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerateNotes = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setErrorMessage("");
    setNotes("");
    setSavedSuccess(false);

    try {
      const res = await API.post("/ai/notes", {
        topic: topic.trim(),
        difficulty,
      });

      setNotes(res.data.result || "");
    } catch (err) {
      console.error("Notes error:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to generate notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notes || saving) return;
    setSaving(true);
    try {
      await API.post("/study-items", {
        type: "note",
        topic: topic.trim(),
        difficulty,
        content: notes,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save notes: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(notes);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadMarkdown(notes, topic);
  };

  const sampleTopics = [
    "Binary Trees",
    "Dynamic Programming",
    "REST vs GraphQL",
    "Operating System Deadlocks",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>High-Yield Revision</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Study Notes Generator
          </h2>
          <p className="text-xs text-slate-400">
            Create structured, exam-oriented revision notes formatted in clean markdown.
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
        <form onSubmit={handleGenerateNotes} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Study Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Binary Trees, Machine Learning, Thermodynamics"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Difficulty Level
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
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Study Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Notes</span>
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="h-96 bg-surface/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h4 className="text-base font-bold text-white">
            Structuring High-Yield Notes with Gemini
          </h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Synthesizing overview, core principles, worked examples, and exam tips...
          </p>
        </div>
      )}

      {/* Notes Display */}
      {notes && !loading && (
        <div className="bg-surface/90 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          {/* Action Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white">
                {topic} • {difficulty}
              </span>
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
                onClick={handleSaveNotes}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-300" />
                    <span>Saved to Library!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{saving ? "Saving..." : "Save Notes"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rendered Markdown Body */}
          <div className="p-6 sm:p-8 prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
            <ReactMarkdown>{notes}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
