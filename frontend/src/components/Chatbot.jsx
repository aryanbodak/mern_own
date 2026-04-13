import React, { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false); // 🔥 toggle
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 Ask me about courses!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "What courses are available?",
    "Recommend me a course",
    "How to enroll?",
    "Show my progress"
  ];

  const sendMessage = async (text) => {
  if (!text.trim()) return;

  setMessages(prev => [...prev, { from: "user", text }]);
  setInput("");
  setLoading(true);

  const username = sessionStorage.getItem("username");

  try {
    // ✅ HANDLE PROGRESS LOCALLY
    if (text.toLowerCase().includes("progress")) {
      const res = await fetch(`http://localhost:5000/api/user/${username}`);
      const data = await res.json();

      const enrolled = data.enrolledCourses || [];
      const progress = data.progress || {};

      if (enrolled.length === 0) {
        setMessages(prev => [
          ...prev,
          { from: "bot", text: "You are not enrolled in any courses yet." }
        ]);
      } else {
        let reply = "📊 Your Progress:\n\n";

        enrolled.forEach(course => {
          const id = course._id;
          const title = course.title;

          const done = progress[id]?.length || 0;
          let total = 0;

          course.topics?.forEach(t => {
            total += t.subTopics?.length || 0;
          });

          const percent = total === 0 ? 0 : Math.floor((done / total) * 100);

          reply += `• ${title} → ${percent}%\n`;
        });

        setMessages(prev => [
          ...prev,
          { from: "bot", text: reply }
        ]);
      }

      setLoading(false);
      return;
    }

    // 🔹 NORMAL CHAT (AI / fallback)
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { from: "bot", text: data.reply || "No response" }
    ]);

  } catch {
    setMessages(prev => [
      ...prev,
      { from: "bot", text: "⚠️ Error fetching data." }
    ]);
  }

  setLoading(false);
};

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
      >
        💬
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="chatbot-popup">

          {/* HEADER */}
          <div className="chat-header">
            <span>Chat Assistant</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* MESSAGES */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.from}`}>
                {msg.text}
              </div>
            ))}

            {loading && <div className="chat-bubble bot">Typing...</div>}
          </div>

          {/* SUGGESTIONS */}
          {messages[messages.length - 1]?.from === "bot" && (
            <div className="suggestions">
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}