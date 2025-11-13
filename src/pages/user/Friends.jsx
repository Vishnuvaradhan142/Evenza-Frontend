import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import './Friends.css';

const Friends = () => {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/friends`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setFriends(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFriends();
  }, [token]);

  const openChat = async (friend) => {
    setActiveChat(friend);
    if (!messages[friend.user_id]) {
      try {
        const res = await fetch(`${API_BASE}/friends/${friend.user_id}/messages`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(prev => ({ ...prev, [friend.user_id]: data }));
      } catch (err) {
        console.error(err);
      }
    }
    document.body.style.overflow = 'hidden';
  };

  const closeChat = () => {
    setActiveChat(null);
    document.body.style.overflow = 'auto';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const msg = { sender_id: 0, receiver_id: activeChat.user_id, message: newMessage, created_at: new Date() };
    setMessages(prev => ({
      ...prev,
      [activeChat.user_id]: [...(prev[activeChat.user_id] || []), msg]
    }));
    setNewMessage("");

    try {
      await fetch(`${API_BASE}/friends/${activeChat.user_id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: msg.message })
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const formatLastSeen = (last_seen) => {
    if (!last_seen) return "Offline";
    return new Date(last_seen).toLocaleString();
  };

  return (
    <div className="friends-page">
      <div className="friends-list-container">
        <h2>Friends</h2>
        <div className="friends-list">
          {friends.map(friend => (
            <div key={friend.user_id} className="friend-card" onClick={() => openChat(friend)}>
              <div className="friend-info">
                <span className="friend-name">{friend.username}</span>
                <span className={`status-dot ${friend.status.toLowerCase()}`}></span>
                <span className="status-text">
                  {friend.status === "Online" ? "Online" : `Last seen: ${formatLastSeen(friend.last_seen)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`chat-overlay ${activeChat ? 'active' : ''}`} onClick={closeChat}></div>

      <div className={`chat-container ${activeChat ? 'active' : ''}`}>
        <div className="chat-header">
          <button className="back-btn" onClick={closeChat}><FaArrowLeft /> Back</button>
          <h3>Chat with {activeChat?.username}</h3>
        </div>

        <div className="messages-container">
          {activeChat && messages[activeChat.user_id]?.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender_id === activeChat.user_id ? "other-message" : "my-message"}`}>
              <div className="message-content">
                <p>{msg.message}</p>
                <span className="message-time">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Friends;
