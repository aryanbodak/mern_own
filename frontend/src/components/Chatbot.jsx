import React, { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "What courses are available?",
  "How do I enroll in a course?",
  "Show me AI/ML courses",
  "How do I track my progress?",
];

export default function Chatbot({ courses = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! I'm your CourseDB assistant. Ask me anything about courses, enrollment, or your progress!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, courses }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Sorry, I couldn't connect. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={`chat-fab ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chatbot"
      >
        {open ? "✕" : "💬"}
        {!open && <span className="fab-pulse" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="bot-avatar">🤖</div>
              <div>
                <div className="bot-name">CourseDB AI</div>
                <div className="bot-status">
                  <span className="status-dot" /> Online
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role}`}>
                {m.role === "bot" && <div className="msg-avatar">🤖</div>}
                <div className={`msg-bubble ${m.role}`}>
                  {m.text.split("\n").map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < m.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg-row bot">
                <div className="msg-avatar">🤖</div>
                <div className="msg-bubble bot typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-row">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Ask about courses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
