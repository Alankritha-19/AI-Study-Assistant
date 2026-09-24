import { useState } from "react";
import confetti from "canvas-confetti";
import API from "../services/api";
import { downloadQuiz, copyToClipboard } from "../services/exportUtils";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Bookmark,
  RotateCcw,
  Download,
  Copy,
  Check,
  Award,
  AlertCircle,
} from "lucide-react";

export default function Quiz() {
  const [topic, setTopic] = useState("Binary Trees");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerateQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setErrorMessage("");
    setQuestions([]);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setSavedSuccess(false);

    try {
      const res = await API.post("/ai/quiz", {
        topic: topic.trim(),
        difficulty,
        questionCount: Number(questionCount) || 5,
      });

      const qList = res.data.questions || res.data.quiz || [];
      if (qList.length === 0) {
        throw new Error("No quiz questions were returned. Please try again.");
      }
      setQuestions(qList);
    } catch (err) {
      console.error("Quiz generation error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to generate quiz. Please check your topic and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (isSubmitted) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    if (questions.length === 0 || isSubmitted) return;

    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      const userChoice = selectedAnswers[idx];
      if (userChoice !== undefined && userChoice === q.correctAnswerIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    // Trigger celebratory confetti if score is >= 70%
    if (calculatedScore / questions.length >= 0.7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const handleSaveQuiz = async () => {
    if (questions.length === 0 || saving) return;
    setSaving(true);
    try {
      await API.post("/study-items", {
        type: "quiz",
        topic: topic.trim(),
        difficulty,
        content: questions,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    const questionsText = questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q.question}\nOptions: ${q.options.join(
            ", "
          )}\nAnswer: ${q.answer}\nExplanation: ${q.explanation}\n`
      )
      .join("\n");
    const success = await copyToClipboard(questionsText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Assessment</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            MCQ Quiz Arena
          </h2>
          <p className="text-xs text-slate-400">
            Generate multiple choice quizzes, test your knowledge, and review in-depth explanations.
          </p>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {["Binary Trees", "Operating Systems", "React Hooks", "Machine Learning"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setTopic(s);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Generator Form */}
      <div className="bg-surface/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-lg">
        <form onSubmit={handleGenerateQuiz} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Topic Input */}
            <div className="sm:col-span-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Subject or Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Binary Trees, Polymorphism, Photosynthesis"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Difficulty Selector */}
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

            {/* Question Count Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="3">3 Questions</option>
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing MCQs with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive Quiz Arena */}
      {questions.length > 0 && (
        <div className="space-y-5">
          {/* Post-Submit Score Banner */}
          {isSubmitted && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Score: {score} / {questions.length}
                    <span className="text-base text-indigo-300 font-medium ml-2">
                      ({Math.round((score / questions.length) * 100)}%)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {score / questions.length >= 0.8
                      ? "Outstanding mastery! You've got this concept down. 🔥"
                      : score / questions.length >= 0.5
                      ? "Solid understanding. Review the explanations below to refine weak areas. 👍"
                      : "Good effort! Check the detailed explanations below and try again. 📚"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResetQuiz}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={handleSaveQuiz}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{saving ? "Saving..." : "Save Quiz"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quiz Action Bar (when not submitted or submitted) */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {isSubmitted
                ? "Reviewing Completed Assessment"
                : `Progress: ${answeredCount} of ${questions.length} answered`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={() => downloadQuiz(questions, topic, false)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white flex items-center gap-1 transition"
              >
                <Download className="w-3 h-3" />
                <span>Export TXT</span>
              </button>
              <button
                onClick={() => downloadQuiz(questions, topic, true)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white flex items-center gap-1 transition"
              >
                <Download className="w-3 h-3" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((q, qIndex) => {
              const userSelection = selectedAnswers[qIndex];
              const isCorrect = userSelection === q.correctAnswerIndex;

              return (
                <div
                  key={qIndex}
                  className="bg-surface/90 border border-slate-800/80 rounded-2xl p-5 space-y-3.5 backdrop-blur-md shadow-md"
                >
                  {/* Question Title */}
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-sm sm:text-base text-white leading-snug">
                      <span className="text-indigo-400 mr-2">{qIndex + 1}.</span>
                      {q.question}
                    </h4>

                    {isSubmitted && (
                      <span className="shrink-0">
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Radio Button Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = userSelection === optIndex;
                      const isThisCorrect = optIndex === q.correctAnswerIndex;

                      let style =
                        "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900";

                      if (isSubmitted) {
                        if (isThisCorrect) {
                          style =
                            "bg-green-500/15 border-green-500/50 text-green-200 font-medium";
                        } else if (isSelected && !isThisCorrect) {
                          style =
                            "bg-red-500/15 border-red-500/50 text-red-200 font-medium";
                        }
                      } else if (isSelected) {
                        style =
                          "bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-sm";
                      }

                      return (
                        <div
                          key={optIndex}
                          onClick={() => handleSelectOption(qIndex, optIndex)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Radio Button Indicator */}
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "border-indigo-400 bg-indigo-500"
                                  : "border-slate-600 bg-transparent"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-semibold text-slate-400 mr-1">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span>{opt}</span>
                          </div>

                          {/* Post-submit Icons */}
                          {isSubmitted && (
                            <div className="shrink-0">
                              {isThisCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              )}
                              {isSelected && !isThisCorrect && (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Post-Submission Explanation */}
                  {isSubmitted && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                      <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Explanation:</span>
                      </p>
                      <p className="leading-relaxed pl-5">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Quiz Bottom Action Bar */}
          {!isSubmitted && (
            <div className="sticky bottom-4 z-20 bg-surface/95 border border-slate-800 p-4 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center justify-between">
              <span className="text-xs text-slate-300">
                {answeredCount === questions.length ? (
                  <span className="text-green-400 font-semibold">
                    ✓ All {questions.length} questions answered! Ready to submit.
                  </span>
                ) : (
                  <span>
                    Answered <strong className="text-white">{answeredCount}</strong> of{" "}
                    <strong>{questions.length}</strong>
                  </span>
                )}
              </span>

              <button
                onClick={handleSubmitQuiz}
                disabled={answeredCount === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-40 active:scale-95"
              >
                Submit Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
