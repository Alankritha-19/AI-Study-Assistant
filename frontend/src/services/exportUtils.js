// Client-side export utilities using standard browser APIs (no extra libraries needed)

export const downloadFile = (content, filename, type = "text/plain") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadMarkdown = (content, topic = "study-notes") => {
  const sanitized = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  downloadFile(content, `${sanitized}-notes.md`, "text/markdown;charset=utf-8");
};

export const downloadQuiz = (quizData, topic = "quiz", asJson = false) => {
  const sanitized = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (asJson) {
    downloadFile(
      JSON.stringify(quizData, null, 2),
      `${sanitized}-quiz.json`,
      "application/json;charset=utf-8"
    );
  } else {
    // Human-readable text format
    const questions = Array.isArray(quizData) ? quizData : quizData.questions || [];
    let text = `# ${topic} - Practice Quiz\n\n`;
    questions.forEach((q, i) => {
      text += `Question ${i + 1}: ${q.question}\n`;
      q.options.forEach((opt, idx) => {
        text += `  ${String.fromCharCode(65 + idx)}) ${opt}\n`;
      });
      text += `Answer: ${q.answer || q.options[q.correctAnswerIndex]}\n`;
      text += `Explanation: ${q.explanation}\n\n`;
    });
    downloadFile(text, `${sanitized}-quiz.txt`, "text/plain;charset=utf-8");
  }
};

export const downloadStudyPlan = (planData, topic = "study-plan") => {
  const sanitized = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (typeof planData === "string") {
    downloadFile(planData, `${sanitized}-plan.md`, "text/markdown;charset=utf-8");
  } else {
    let text = `# ${planData.title || topic + " Study Plan"}\n\n`;
    if (Array.isArray(planData.days)) {
      planData.days.forEach((d) => {
        text += `## Day ${d.day}: ${d.topic} (${d.estimatedTime || "60 mins"})\n`;
        if (Array.isArray(d.tasks)) {
          d.tasks.forEach((t) => {
            text += `- [ ] ${t}\n`;
          });
        }
        text += `\n`;
      });
    }
    downloadFile(text, `${sanitized}-plan.md`, "text/markdown;charset=utf-8");
  }
};

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
