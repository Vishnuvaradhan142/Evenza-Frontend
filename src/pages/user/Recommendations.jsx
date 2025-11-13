import React, { useState, useEffect, useRef } from "react";
import "./Recommendations.css";

const Recommendations = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);
  const [showGreeting, setShowGreeting] = useState(true);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userMessage = {
      sender: "user",
      text: input,
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    if (showGreeting) setShowGreeting(false);

    // Call Python AI backend
    const AI_API_BASE = process.env.REACT_APP_AI_API_URL || "http://localhost:8000";
    fetch(`${AI_API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, user_id: 1 }),
    })
      .then((res) => res.json())
      .then((data) => {
        const aiMessage = {
          sender: "ai",
          text: data.ai_text || data.ai_response || "No response.",
          events: data.events || [],
          id: Date.now() + 1,
        };
        setMessages((prev) => [...prev, aiMessage]);
      })
      .catch((err) => {
        console.error("Error fetching AI response:", err);
        const aiMessage = {
          sender: "ai",
          text: "⚠ Oops! Something went wrong. Please try again.",
          events: [],
          id: Date.now() + 1,
        };
        setMessages((prev) => [...prev, aiMessage]);
      })
      .finally(() => setIsThinking(false));
  };

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  return (
    <div className="recommendations-container">
      <div className="recommendations-box">
        {showGreeting && (
          <div className="greeting">
            <h2>👋 AI Recommendation Assistant</h2>
            <p>I’ll suggest events based on your interests. Ask me anything!</p>
          </div>
        )}

        {messages.length > 0 &&
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.sender === "ai" ? (
                <div className="ai-response">
                  <p>{msg.text}</p>

                  {/* Render structured event cards */}
                  {msg.events && msg.events.length > 0 && (
                    <div className="event-cards">
                      {msg.events.map((event) => (
                        <div key={event.id} className="event-card">
                          <h3>{event.title}</h3>
                          <p>📍 {event.location}</p>
                          <p>🗓 {new Date(event.date).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="user-message-text">{msg.text}</div>
              )}
            </div>
          ))}

        {isThinking && (
          <div className="message ai">
            <div className="futuristic-typing">
              <div className="orb-container">
                <div className="orb"></div>
                <div className="orb"></div>
                <div className="orb"></div>
              </div>
              <div className="scan-line"></div>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about events..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isThinking}
        />
        <button onClick={handleSend} disabled={isThinking || !input.trim()}>
          <span className="send-icon">➤</span>
        </button>
      </div>
    </div>
  );
};

export default Recommendations;
