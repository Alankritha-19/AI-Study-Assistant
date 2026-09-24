import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import API from "../services/api";
import { copyToClipboard } from "../services/exportUtils";
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Bot,
  User,
  GraduationCap,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

export default function Chat() {
  const { id: routeConvId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(routeConvId || null);
  const [activeTitle, setActiveTitle] = useState("New Study Session");
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (routeConvId) {
      loadConversation(routeConvId);
    } else {
      setActiveConvId(null);
      setActiveTitle("New Study Session");
      setMessages([]);
    }
  }, [routeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await API.get("/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadConversation = async (id) => {
    try {
      setActiveConvId(id);
      const res = await API.get(`/conversations/${id}`);
      setActiveTitle(res.data.title || "Study Session");
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load conversation history:", err);
    }
  };

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setActiveTitle("New Study Session");
    setMessages([]);
    setInputQuery("");
    navigate("/chat");
  };

  const handleDeleteConversation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await API.delete(`/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConvId === id) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery("");
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg = {
      role: "user",
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const payload = {
        conversationId: activeConvId || "new",
        message: userText,
        difficulty,
      };

      const res = await API.post("/ai/chat", payload);

      const aiReply = res.data.reply;
      const returnedConvId = res.data.conversationId;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply,
          createdAt: new Date().toISOString(),
        },
      ]);

      if (!activeConvId && returnedConvId) {
        setActiveConvId(returnedConvId);
        setActiveTitle(res.data.conversation?.title || userText.slice(0, 30));
        navigate(`/chat/${returnedConvId}`, { replace: true });
        fetchConversations();
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ " +
            (err.response?.data?.message ||
              "Something went wrong while contacting the AI Tutor. Please try again."),
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = async (text, index) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const suggestionPrompts = [
    {
      label: "Binary Trees",
      prompt: "Explain how Binary Search Trees work with a step-by-step insertion example.",
    },
    {
      label: "Recursion",
      prompt: "Explain recursion using a real-world analogy and a simple factorial function.",
    },
    {
      label: "Async / Await",
      prompt: "How does asynchronous JavaScript and the event loop work under the hood?",
    },
    {
      label: "ACID Properties",
      prompt: "Explain ACID properties in database management systems with examples.",
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-surface/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Title & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {activeTitle}
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive AI Tutor • Explanations tailored to your level
            </p>
          </div>
        </div>

        {/* Controls: Difficulty + New Chat */}
        <div className="flex items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Level:
            </span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="beginner" className="bg-slate-900 text-white">
                Beginner
              </option>
              <option value="intermediate" className="bg-slate-900 text-white">
                Intermediate
              </option>
              <option value="advanced" className="bg-slate-900 text-white">
                Advanced
              </option>
            </select>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          {/* Delete Current Chat Button */}
          {activeConvId && (
            <button
              onClick={() => handleDeleteConversation(activeConvId)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Delete conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-500/20 animate-pulse">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              AI Tutor Study Session
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
              Ask any question, request a step-by-step derivation, or explore complex programming and theoretical concepts.
            </p>

            {/* Starter Prompt Chips */}
            <div className="w-full mt-6 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Recommended Prompts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {suggestionPrompts.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputQuery(item.prompt);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-xs transition cursor-pointer group flex flex-col justify-between"
                  >
                    <span className="font-semibold text-indigo-400 group-hover:text-indigo-300">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-500/10">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/90 border border-slate-800 text-slate-200"
                  }`}
                >
                  {/* Markdown or plain text content */}
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Copy message button */}
                  {!isUser && (
                    <div className="flex justify-end mt-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => handleCopyMessage(msg.content, index)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                        title="Copy explanation"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>AI is thinking & formulating explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800/80">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask your AI Tutor anything... (e.g., Explain dynamic programming)"
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
