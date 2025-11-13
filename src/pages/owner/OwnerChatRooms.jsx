import React, { useEffect, useRef, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import "./OwnerChatRooms.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const SCROLL_NEAR_BOTTOM_PX = 120;

// Owner Chat Rooms - Monitor all chatrooms
export default function OwnerChatRooms() {
  const [rooms, setRooms] = useState([]);
  const [admins, setAdmins] = useState([]); // List of all admins
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false);

  const messagesRef = useRef(null);
  const token = localStorage.getItem("token");
  const localUserId = Number(localStorage.getItem("user_id") || 0);

  console.log('OwnerChatRooms component mounted', { token: !!token, userId: localUserId });

  // Fetch all chatrooms (owner can see all)
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setError(null);
      try {
        if (!token) throw new Error("Not authenticated. Please log in.");

        const res = await fetch(`${API_BASE}/chatrooms/owner/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Failed to fetch chatrooms");
        }
        const data = await res.json();
        setRooms(data || []);

        // Auto-select Global or first room
        if (data && data.length > 0) {
          const toSelect = data.find((r) => Number(r.chatroom_id) === 1) || 
                          data.find((r) => Number(r.chatroom_id) === 2) || 
                          data[0];
          if (toSelect) loadMessages(toSelect);
        }
      } catch (err) {
        setError(err.message || "Unable to load chatrooms");
      } finally {
        setLoadingRooms(false);
      }
    };

    const fetchAdmins = async () => {
      setLoadingAdmins(true);
      try {
        if (!token) return;

        const res = await fetch(`${API_BASE}/profile/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdmins(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchRooms();
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadMessages = async (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setLoadingMessages(true);
    setUserScrolledUp(false);
    setNewMessagesAvailable(false);
    setError(null);

    try {
      if (!token) throw new Error("Not authenticated. Please log in.");
      
      // Check if this is a direct admin chat (pseudo room)
      if (room._pseudo === "admin") {
        const res = await fetch(`${API_BASE}/friends/${room.admin_id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Failed to load admin messages");
        }
        const data = await res.json();
        // Map friend messages shape to chat message shape
        const mapped = (data || []).map((m, idx) => ({
          message_id: idx + 1,
          chatroom_id: `admin_${room.admin_id}`,
          user_id: m.sender_id,
          message: m.message,
          created_at: m.created_at,
          username: m.sender_id === localUserId ? "You" : room.name,
        }));
        setMessages(mapped);
        setTimeout(() => scrollToBottom(false), 60);
      } else {
        // Regular chatroom
        const res = await fetch(`${API_BASE}/chatrooms/${room.chatroom_id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Failed to load messages");
        }
        const data = await res.json();
        setMessages(data || []);
        setTimeout(() => scrollToBottom(false), 60);
      }
    } catch (err) {
      setError(err.message || "Unable to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (ev) => {
    ev && ev.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;
    try {
      if (!token) throw new Error("Not authenticated. Please log in.");
      
      // Check if this is a direct admin chat
      if (selectedRoom._pseudo === "admin") {
        const res = await fetch(`${API_BASE}/friends/${selectedRoom.admin_id}/messages`, {
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
        setMessages((prev) => [
          ...prev,
          {
            message_id: (prev[prev.length - 1]?.message_id || 0) + 1,
            chatroom_id: `admin_${selectedRoom.admin_id}`,
            user_id: inserted.sender_id,
            message: inserted.message,
            created_at: inserted.created_at,
            username: "You",
          },
        ]);
        setNewMessage("");
        setTimeout(() => {
          if (!userScrolledUp) scrollToBottom(true);
        }, 50);
      } else {
        // Regular chatroom
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
        setMessages((prev) => [...prev, { ...inserted, username: "You" }]);
        setNewMessage("");
        setTimeout(() => {
          if (!userScrolledUp) scrollToBottom(true);
        }, 50);
      }
    } catch (err) {
      setError(err.message || "Failed to send message");
    }
  };

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
    <div className="owner-chat-page">
      <div className="chatroom-wrapper-fixed">
        <aside className="chatroom-sidebar">
          <div className="sidebar-header">
            <h2>Rooms</h2>
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
              {rooms.length === 0 && <li className="no-rooms">No rooms available</li>}
            </ul>
          )}

          <div className="sidebar-header" style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
            <h2>Admin Contacts</h2>
          </div>

          {loadingAdmins ? (
            <div className="sidebar-loading">Loading admins...</div>
          ) : (
            <ul className="rooms-list">
              {admins.map((admin) => (
                <li
                  key={`admin_${admin.user_id}`}
                  className={`room-item ${selectedRoom?.chatroom_id === `admin_${admin.user_id}` ? "active" : ""}`}
                  onClick={() => loadMessages({
                    chatroom_id: `admin_${admin.user_id}`,
                    name: admin.username,
                    type: "direct",
                    admin_id: admin.user_id,
                    _pseudo: "admin"
                  })}
                >
                  <div className="room-row">
                    <div className="room-name">{admin.username}</div>
                    <div className="room-type">Admin</div>
                  </div>
                </li>
              ))}
              {admins.length === 0 && <li className="no-rooms">No admins found</li>}
            </ul>
          )}
        </aside>

        <main className="chatroom-main-fixed">
          <div className="page-header">
            <h1 className="page-title">
              <FiMessageSquare className="title-icon" />
              Chat Rooms
            </h1>
            <p className="page-description">Monitor all chatrooms and participate in conversations across all events.</p>
          </div>
        {selectedRoom ? (
          <>
            <header className="chatroom-header">
              <h3>{selectedRoom.name}</h3>
              <div className="chatroom-meta">
                {selectedRoom.type}
                {selectedRoom.event_id ? ` • event ${selectedRoom.event_id}` : ""}
              </div>
            </header>

            <div className="chat-window-box">
              <div className="messages-area-fixed" ref={messagesRef}>
                {loadingMessages ? (
                  <div className="messages-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">No messages yet — start the conversation 👋</div>
                ) : (
                  messages.map((m) => {
                    const mine = Number(m.user_id) === localUserId;
                    return (
                      <div
                        key={m.message_id}
                        className={`message-row ${mine ? "my-message" : "other-message"}`}
                      >
                        <div className="message-meta">
                          <span className="message-user">{m.username || (mine ? "You" : `User ${m.user_id}`)}</span>
                          <span className="message-time">{new Date(m.created_at).toLocaleString()}</span>
                        </div>
                        <div className="message-body">{m.message}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {newMessagesAvailable && (
                <button className="new-messages-pill" onClick={() => scrollToBottom(true)}>
                  New messages — jump to bottom
                </button>
              )}

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
            <p>Select a room to begin monitoring conversations.</p>
            {error && <div className="error-box">{error}</div>}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
