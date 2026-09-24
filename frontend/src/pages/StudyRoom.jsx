import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import confetti from "canvas-confetti";
import API from "../services/api";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Calendar,
  Send,
  Plus,
  Trash2,
  Bookmark,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

export default function StudyRoom() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mode Selection: 'chat' | 'notes' | 'quiz' | 'plan'
  const [mode, setMode] = useState("chat");
  const [difficulty, setDifficulty] = useState("Beginner");

  // Mode Specific Outputs
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await API.get("/conversations");
      setConversations(res.data);
      if (res.data.length > 0 && !activeConvId) {
        loadConversation(res.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await API.post("/conversations", { title: "New Study Session" });
      setConversations([res.data, ...conversations]);
      setActiveConvId(res.data._id);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const loadConversation = async (id) => {
    try {
      setActiveConvId(id);
      const res = await API.get(`/conversations/${id}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const deleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/conversations/${id}`);
      const filtered = conversations.filter((c) => c._id !== id);
      setConversations(filtered);
      if (activeConvId === id) {
        if (filtered.length > 0) loadConversation(filtered[0]._id);
        else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const query = inputQuery.trim();
    setInputQuery("");
    setLoading(true);

    try {
      if (mode === "chat") {
        let targetConvId = activeConvId;
        if (!targetConvId) {
          const res = await API.post("/conversations", { title: query.slice(0, 25) });
          setConversations((prev) => [res.data, ...prev]);
          targetConvId = res.data._id;
          setActiveConvId(targetConvId);
        }

        const userMsg = { role: "user", content: query };
        setMessages((prev) => [...prev, userMsg]);

        await API.post(`/conversations/${targetConvId}/messages`, userMsg);

        const aiRes = await API.post("/ai/explain", {
          topic: query,
          difficulty,
          prompt: query,
        });

        const reply = aiRes.data.result;
        const assistantMsg = { role: "assistant", content: reply };

        setMessages((prev) => [...prev, assistantMsg]);
        await API.post(`/conversations/${targetConvId}/messages`, assistantMsg);
        fetchConversations();
      } else if (mode === "notes") {
        setGeneratedNotes("");
        const res = await API.post("/ai/notes", { topic: query, difficulty });
        setGeneratedNotes(res.data.result);
      } else if (mode === "quiz") {
        setQuizData([]);
        setSelectedAnswers({});
        setQuizScore(null);
        const res = await API.post("/ai/quiz", { topic: query, difficulty, count: 5 });
        setQuizData(res.data.quiz);
      } else if (mode === "plan") {
        setGeneratedPlan("");
        const res = await API.post("/ai/plan", { topic: query, difficulty, days: 7 });
        setGeneratedPlan(res.data.result);
      }
    } catch (err) {
      console.error("AI Request Error:", err);
      if (mode === "chat") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${err.response?.data?.message || "Unable to connect to AI."}`,
          },
        ]);
      } else {
        alert(err.response?.data?.message || "Unable to generate content. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuizOption = (qIndex, oIndex) => {
    if (selectedAnswers[qIndex] !== undefined) return;
    const nextAnswers = { ...selectedAnswers, [qIndex]: oIndex };
    setSelectedAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === quizData.length) {
      let score = 0;
      quizData.forEach((q, idx) => {
        if (nextAnswers[idx] === q.correctAnswerIndex) score += 1;
      });
      setQuizScore(score);
      if (score >= quizData.length * 0.7) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const saveCurrentItem = async (type, topic, content) => {
    setSaving(true);
    try {
      await API.post("/study", { type, topic, difficulty, content });
      alert("Saved to your dashboard library!");
    } catch (err) {
      alert("Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-4">
      {/* Collapsible Left History Sidebar */}
      <aside className="w-72 bg-surface/70 border border-slate-800 rounded-2xl flex-col p-4 backdrop-blur-md hidden md:flex">
        <button
          onClick={createNewConversation}
          className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-indigo-400 border border-indigo-500/20 font-medium text-sm flex items-center justify-center gap-2 mb-4 transition"
        >
          <Plus className="w-4 h-4"/>
          <span>New Session</span>
        </button>

        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
          Recent Sessions
        </h3>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => loadConversation(conv._id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm transition ${
                activeConvId === conv._id
                  ? "bg-slate-800 text-white font-medium border border-slate-700"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => deleteConversation(e, conv._id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 rounded-md transition"
              >
                <Trash2 className="w-3.5 h-3.5"/>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Study Arena */}
      <div className="flex-1 flex flex-col bg-surface/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {[
              { id: "chat", label: "Tutor Chat", icon: Sparkles },
              { id: "notes", label: "Smart Notes", icon: BookOpen },
              { id: "quiz", label: "Quiz Arena", icon: HelpCircle },
              { id: "plan", label: "Roadmap", icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMode(tab.id);
                    setInputQuery("");
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    mode === tab.id
                      ? "bg-primary text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5"/>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mode === "chat" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-3">
                    <Sparkles className="w-8 h-8 text-indigo-400"/>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    What would you like to master today?
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Ask questions, break down complex topics, or request worked examples.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 max-w-md justify-center">
                    {[
                      "Explain Recursion simply",
                      "How does async/await work?",
                      "Summarize Newton's 3 Laws",
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setInputQuery(prompt)}
                        className="text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-300 transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-200"
                      }`}
                    >
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400"/>
                    <span>Analyzing & explaining...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {mode === "notes" && (
            <div className="max-w-3xl mx-auto space-y-4">
              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 text-sm gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
                  <span>Synthesizing concise study notes...</span>
                </div>
              ) : generatedNotes ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative">
                  <div className="flex justify-end gap-2 mb-4 border-b border-slate-800 pb-3">
                    <button
                      onClick={() => copyToClipboard(generatedNotes)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5"/>}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => saveCurrentItem("note", "Notes", generatedNotes)}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-indigo-600 text-xs text-white flex items-center gap-1.5 transition"
                    >
                      <Bookmark className="w-3.5 h-3.5"/>
                      <span>{saving ? "Saving..." : "Save Note"}</span>
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{generatedNotes}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 text-sm">
                  <BookOpen className="w-10 h-10 text-indigo-400 mb-2 opacity-80"/>
                  <span>Enter a topic below to generate high-yield revision notes.</span>
                </div>
              )}
            </div>
          )}

          {mode === "quiz" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 text-sm gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
                  <span>Generating interactive quiz questions...</span>
                </div>
              ) : quizData.length > 0 ? (
                <>
                  {quizScore !== null && (
                    <div className="p-4 rounded-xl bg-linear-to-r from-primary/20 to-accent/20 border border-indigo-500/30 text-center">
                      <h4 className="text-lg font-bold text-white">
                        Score: {quizScore} / {quizData.length}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        {quizScore >= 4 ? "Mastery achieved! 🔥" : "Review notes and try again."}
                      </p>
                    </div>
                  )}
                  {quizData.map((q, qIndex) => {
                    const hasAnswered = selectedAnswers[qIndex] !== undefined;
                    return (
                      <div
                        key={qIndex}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                      >
                        <h4 className="font-semibold text-slate-100 text-sm">
                          {qIndex + 1}. {q.question}
                        </h4>
                        <div className="space-y-2">
                          {q.options.map((opt, oIndex) => {
                            let btnStyle =
                              "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60";
                            if (hasAnswered) {
                              if (oIndex === q.correctAnswerIndex) {
                                btnStyle = "bg-green-500/20 text-green-300 border-green-500/40";
                              } else if (selectedAnswers[qIndex] === oIndex) {
                                btnStyle = "bg-red-500/20 text-red-300 border-red-500/40";
                              }
                            }
                            return (
                              <button
                                key={oIndex}
                                onClick={() => handleSelectQuizOption(qIndex, oIndex)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {hasAnswered && oIndex === q.correctAnswerIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-green-400"/>
                                )}
                                {hasAnswered &&
                                  selectedAnswers[qIndex] === oIndex &&
                                  oIndex !== q.correctAnswerIndex && (
                                    <XCircle className="w-4 h-4 text-red-400"/>
                                  )}
                              </button>
                            );
                          })}
                        </div>
                        {hasAnswered && (
                          <p className="text-xs text-slate-400 border-t border-slate-800 pt-2.5 mt-2">
                            <strong className="text-indigo-400">Explanation: </strong>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 text-sm">
                  <HelpCircle className="w-10 h-10 text-indigo-400 mb-2 opacity-80"/>
                  <span>Enter a topic below to generate a 5-question multiple choice quiz.</span>
                </div>
              )}
            </div>
          )}

          {mode === "plan" && (
            <div className="max-w-3xl mx-auto space-y-4">
              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 text-sm gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
                  <span>Drafting tailored study roadmap...</span>
                </div>
              ) : generatedPlan ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
                  <div className="flex justify-end gap-2 mb-4 border-b border-slate-800 pb-3">
                    <button
                      disabled={saving}
                      onClick={() => saveCurrentItem("plan", "Plan", generatedPlan)}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-indigo-600 text-xs text-white flex items-center gap-1.5 transition"
                    >
                      <Bookmark className="w-3.5 h-3.5"/>
                      <span>{saving ? "Saving..." : "Save Roadmap"}</span>
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{generatedPlan}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 text-sm">
                  <Calendar className="w-10 h-10 text-indigo-400 mb-2 opacity-80"/>
                  <span>Enter a target subject to generate a structured 7-day study plan.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                mode === "chat"
                  ? "Ask your tutor anything..."
                  : mode === "notes"
                  ? "Enter topic for revision notes (e.g., Photosynthesis)..."
                  : mode === "quiz"
                  ? "Enter topic for quiz (e.g., Python OOP)..."
                  : "Enter topic for 7-day roadmap..."
              }
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-indigo-600 text-white text-sm font-medium transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin"/>
              ) : (
                <>
                  <span>Generate</span>
                  <Send className="w-3.5 h-3.5"/>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}