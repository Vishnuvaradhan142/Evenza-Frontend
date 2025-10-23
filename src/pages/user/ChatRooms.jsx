import React, { useEffect, useRef, useState } from "react";
import "./ChatRooms.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const SCROLL_NEAR_BOTTOM_PX = 120; // threshold to auto-scroll

export default function ChatRooms() {
  const [rooms, setRooms] = useState([]); // array of {chatroom_id, name, type, event_id}
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]); // messages for selected room
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false);

  const messagesRef = useRef(null);
  const token = localStorage.getItem("token");
  const localUserId = Number(localStorage.getItem("user_id") || 0);

  // Fetch chatrooms on mount, then reorder: global(1), help(2), then event rooms (the backend should already filter event rooms to user's registrations)
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setError(null);
      try {
        if (!token) throw new Error("Not authenticated. Please log in.");
        const res = await fetch(`${API_BASE}/chatrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Failed to fetch chatrooms");
        }
        const data = await res.json();

        // ensure order: chatroom_id 1 (Global), 2 (Help) first, then the rest (events)
        const fixed = (data || []).filter((r) => Number(r.chatroom_id) === 1 || Number(r.chatroom_id) === 2)
          .sort((a,b) => Number(a.chatroom_id) - Number(b.chatroom_id));
        const events = (data || []).filter((r) => !fixed.some(f=>f.chatroom_id===r.chatroom_id));
        const ordered = [...fixed, ...events];
        setRooms(ordered);

        // auto-select Global if present else Help else first room
        if (ordered.length > 0) {
          const global = ordered.find(r => Number(r.chatroom_id) === 1);
          const help = ordered.find(r => Number(r.chatroom_id) === 2);
          const toSelect = global || help || ordered[0];
          loadMessages(toSelect);
        }
      } catch (err) {
        setError(err.message || "Unable to load chatrooms");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load messages for a room
  const loadMessages = async (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setLoadingMessages(true);
    setUserScrolledUp(false);
    setNewMessagesAvailable(false);
    setError(null);

    try {
      if (!token) throw new Error("Not authenticated. Please log in.");
      const res = await fetch(`${API_BASE}/chatrooms/${room.chatroom_id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to load messages");
      }
      const data = await res.json();
      setMessages(data || []);
      // scroll to bottom after small delay to let DOM render
      setTimeout(() => scrollToBottom(false), 60);
    } catch (err) {
      setError(err.message || "Unable to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async (ev) => {
    ev && ev.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      if (!token) throw new Error("Not authenticated. Please log in.");
      const res = await fetch(`${API_BASE}/chatrooms/${selectedRoom.chatroom_id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to send message");
      }
      const inserted = await res.json();
      // server returns: { message_id, chatroom_id, user_id, message, created_at }
      setMessages(prev => [...prev, { ...inserted, username: "You" }]);
      setNewMessage("");
      // scroll down if user near bottom
      setTimeout(() => {
        if (!userScrolledUp) scrollToBottom(true);
      }, 50);
    } catch (err) {
      setError(err.message || "Failed to send message");
    }
  };

  // scroll detection: mark if user scrolled up
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + SCROLL_NEAR_BOTTOM_PX;
      setUserScrolledUp(!nearBottom);
      if (nearBottom) setNewMessagesAvailable(false);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // auto-scroll when messages change (only if not scrolled up)
  useEffect(() => {
    if (!messagesRef.current) return;
    if (!userScrolledUp) {
      scrollToBottom(true);
    } else if (messages.length > 0) {
      setNewMessagesAvailable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const scrollToBottom = (smooth = false) => {
    const el = messagesRef.current;
    if (!el) return;
    if (smooth) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else el.scrollTop = el.scrollHeight;
    setNewMessagesAvailable(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatroom-wrapper-fixed">
      <aside className="chatroom-sidebar">
        <div className="sidebar-header">
          <h2>Chat Rooms</h2>
        </div>

        {loadingRooms ? (
          <div className="sidebar-loading">Loading rooms...</div>
        ) : (
          <ul className="rooms-list">
            {rooms.map((r) => (
              <li
                key={r.chatroom_id}
                className={`room-item ${selectedRoom?.chatroom_id === r.chatroom_id ? "active" : ""}`}
                onClick={() => loadMessages(r)}
              >
                <div className="room-row">
                  <div className="room-name">{r.name}</div>
                  <div className="room-type">{r.type}</div>
                </div>
              </li>
            ))}
            {rooms.length === 0 && <li className="no-rooms">No chatrooms available</li>}
          </ul>
        )}
      </aside>

      <main className="chatroom-main-fixed">
        {selectedRoom ? (
          <>
            <header className="chatroom-header">
              <h3>{selectedRoom.name}</h3>
              <div className="chatroom-meta">
                {selectedRoom.type}
                {selectedRoom.event_id ? ` • event ${selectedRoom.event_id}` : ""}
              </div>
            </header>

            {/* FIXED chat window box */}
            <div className="chat-window-box">
              <div className="messages-area-fixed" ref={messagesRef}>
                {loadingMessages ? (
                  <div className="messages-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">No messages yet — be the first to say hello 👋</div>
                ) : (
                  messages.map((m) => {
                    const mine = Number(m.user_id) === localUserId;
                    return (
                      <div
                        key={m.message_id}
                        className={`message-row ${mine ? "my-message" : "other-message"}`}
                      >
                        <div className="message-meta">
                          <span className="message-user">{m.username || `User ${m.user_id}`}</span>
                          <span className="message-time">{new Date(m.created_at).toLocaleString()}</span>
                        </div>
                        <div className="message-body">{m.message}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* New messages pill (when user scrolled up) */}
              {newMessagesAvailable && (
                <button className="new-messages-pill" onClick={() => scrollToBottom(true)}>
                  New messages — jump to bottom
                </button>
              )}

              {/* Composer pinned inside chat window */}
              <form className="message-form-fixed" onSubmit={sendMessage}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={`Message ${selectedRoom.name}...`}
                  rows={1}
                />
                <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-room-selected">
            <h3>Welcome</h3>
            <p>Select Global, Help, or one of your event rooms to start chatting.</p>
            {error && <div className="error-box">{error}</div>}
          </div>
        )}
      </main>
    </div>
  );
}
