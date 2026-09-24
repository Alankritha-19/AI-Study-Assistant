import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import API from "../services/api";
import {
  downloadMarkdown,
  downloadQuiz,
  downloadStudyPlan,
  copyToClipboard,
} from "../services/exportUtils";
import {
  Bookmark,
  BookOpen,
  HelpCircle,
  Calendar,
  Layers,
  Clock,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";

export default function SavedItems() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = filter === "all" ? "/study-items" : `/study-items?type=${filter}`;
      const res = await API.get(endpoint);
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this saved item?")) return;
    try {
      await API.delete(`/study-items/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
      if (selectedItem?._id === id) setSelectedItem(null);
    } catch {
      alert("Failed to delete item.");
    }
  };

  const handleExportItem = (e, item) => {
    e.stopPropagation();
    if (item.type === "note") {
      downloadMarkdown(item.content, item.topic);
    } else if (item.type === "quiz") {
      downloadQuiz(item.content, item.topic, false);
    } else {
      downloadStudyPlan(item.content, item.topic);
    }
  };

  const handleCopyContent = async (content) => {
    let text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredItems = items.filter((item) =>
    item.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Personal Knowledge Base</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Saved Study Items
          </h2>
          <p className="text-xs text-slate-400">
            Access, review, and export your curated study notes, quizzes, and revision roadmaps.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic..."
            className="w-full bg-surface/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        {[
          { id: "all", label: "All Items", icon: Layers },
          { id: "note", label: "Notes", icon: BookOpen },
          { id: "quiz", label: "Quizzes", icon: HelpCircle },
          { id: "study_plan", label: "Study Plans", icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
          Loading your study library...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-800/80 rounded-2xl p-6">
          <BookOpen className="w-10 h-10 mb-2 opacity-40 text-indigo-400" />
          <p className="text-sm font-semibold text-slate-300">
            No saved materials found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? `No items match "${searchQuery}"`
              : "Generate notes, quizzes, or roadmaps and save them to build your library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            let icon = BookOpen;
            let badgeBg = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            if (item.type === "quiz") {
              icon = HelpCircle;
              badgeBg = "bg-purple-500/10 text-purple-400 border-purple-500/20";
            } else if (item.type === "study_plan" || item.type === "plan") {
              icon = Calendar;
              badgeBg = "bg-pink-500/10 text-pink-400 border-pink-500/20";
            }
            const Icon = icon;

            return (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className="bg-surface/80 border border-slate-800/80 hover:border-indigo-500/40 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeBg} flex items-center gap-1`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.type.replace("_", " ")}</span>
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleExportItem(e, item)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        title="Download export"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => deleteItem(e, item._id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {item.topic}
                  </h3>

                  <div className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {typeof item.content === "string"
                      ? item.content.slice(0, 160) + "..."
                      : Array.isArray(item.content)
                      ? `${item.content.length} Quiz Questions with solutions`
                      : item.content?.title || "Structured study plan"}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="capitalize font-medium text-slate-400">
                    Level: {item.difficulty}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {selectedItem.topic}
                </h3>
                <p className="text-xs text-indigo-400 uppercase font-semibold">
                  {selectedItem.type.replace("_", " ")} • {selectedItem.difficulty}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContent(selectedItem.content)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={(e) => handleExportItem(e, selectedItem)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-w-none text-xs sm:text-sm leading-relaxed">
              {typeof selectedItem.content === "string" ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
                </div>
              ) : Array.isArray(selectedItem.content) ? (
                // Quiz Questions List
                <div className="space-y-4">
                  {selectedItem.content.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <h4 className="font-semibold text-white">
                        {idx + 1}. {q.question}
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                        {q.options?.map((opt, oIdx) => (
                          <li
                            key={oIdx}
                            className={
                              oIdx === q.correctAnswerIndex
                                ? "text-green-400 font-semibold"
                                : ""
                            }
                          >
                            {opt} {oIdx === q.correctAnswerIndex && "✓ (Correct)"}
                          </li>
                        ))}
                      </ul>
                      {q.explanation && (
                        <p className="text-xs text-indigo-300 pt-1 border-t border-slate-800">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : selectedItem.content?.days ? (
                // Study Plan Days
                <div className="space-y-3">
                  {selectedItem.content.days.map((d, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">
                          Day {d.day}: {d.topic}
                        </h4>
                        <span className="text-[11px] text-pink-400 font-medium">
                          {d.estimatedTime || "60 mins"}
                        </span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                        {d.tasks?.map((t, tIdx) => (
                          <li key={tIdx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-xs text-slate-300">
                  {JSON.stringify(selectedItem.content, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
