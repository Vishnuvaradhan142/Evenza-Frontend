import React, { useEffect, useRef, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import "./ChatParticipants.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const SCROLL_NEAR_BOTTOM_PX = 120;

// Admin Participant Communication
// Mirrors user ChatRooms but adds a special "Contact Owner" direct channel.
export default function ChatParticipants() {
  const [rooms, setRooms] = useState([]); // {chatroom_id, name, type, event_id} plus pseudo owner room
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false);

  const messagesRef = useRef(null);
  const token = localStorage.getItem("token");
  const localUserId = Number(localStorage.getItem("user_id") || 0);

  // Determine owner user id from env or localStorage
  const envOwner = Number(process.env.REACT_APP_OWNER_USER_ID || 0);
  const lsOwner = Number(localStorage.getItem("owner_user_id") || 0);
  const ownerUserId = envOwner || lsOwner || 9; // default to 9 per request

  // Fetch chatrooms and prepend the special Owner Direct channel
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setError(null);
      try {
        if (!token) throw new Error("Not authenticated. Please log in.");

        const res = await fetch(`${API_BASE}/chatrooms/admin/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          // fallback: attempt user chatrooms endpoint to at least get Global/Help
          const fallback = await fetch(`${API_BASE}/chatrooms`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);
          if (fallback && fallback.ok) {
            const fbData = await fallback.json();
            const ownerRoom = {
              chatroom_id: "owner",
              name: "Contact Owner",
              type: "direct",
              event_id: null,
              _pseudo: "owner",
            };
            setRooms([ownerRoom, ...(fbData || [])]);
            const toSelect = ownerUserId ? ownerRoom : (fbData && fbData[0]);
            if (toSelect) loadMessages(toSelect);
            return; // handled
          }
          throw new Error(payload?.message || "Failed to fetch chatrooms");
        }
        const data = await res.json();

        // Special Owner Direct channel (pseudo room)
        const ownerRoom = {
          chatroom_id: "owner", // pseudo id
          name: "Contact Owner",
          type: "direct",
          event_id: null,
          _pseudo: "owner",
        };

        // Admin rooms returned are event rooms; prepend owner direct
        const ordered = [ownerRoom, ...(data || [])];
        setRooms(ordered);

        // Auto-select Owner Direct if owner id configured; otherwise Global/Help/first
        let toSelect = null;
        if (ownerUserId) toSelect = ownerRoom;
        if (!toSelect) toSelect = ordered.find((r) => Number(r.chatroom_id) === 1) || ordered.find((r) => Number(r.chatroom_id) === 2) || ordered[0];
        if (toSelect) loadMessages(toSelect);
      } catch (err) {
        setError(err.message || "Unable to load chatrooms");
        // Still show Contact Owner room when configured, even if fetch fails
        const ownerRoom = {
          chatroom_id: "owner",
          name: "Contact Owner",
          type: "direct",
          event_id: null,
          _pseudo: "owner",
        };
        setRooms([ownerRoom]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ownerUserId]);

  const loadMessages = async (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setLoadingMessages(true);
    setUserScrolledUp(false);
    setNewMessagesAvailable(false);
    setError(null);

    try {
      if (!token) throw new Error("Not authenticated. Please log in.");
      if (room._pseudo === "owner") {
        if (!ownerUserId) {
          throw new Error("Owner user id is not configured. Set REACT_APP_OWNER_USER_ID or localStorage 'owner_user_id'.");
        }
        const res = await fetch(`${API_BASE}/friends/${ownerUserId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Failed to load owner messages");
        }
        const data = await res.json();
        // Map friend messages shape to chat message shape
        const mapped = (data || []).map((m, idx) => ({
          message_id: idx + 1,
          chatroom_id: "owner",
          user_id: m.sender_id,
          message: m.message,
          created_at: m.created_at,
          username: m.sender_id === localUserId ? "You" : "Owner",
        }));
        setMessages(mapped);
        setTimeout(() => scrollToBottom(false), 60);
      } else {
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
      if (selectedRoom._pseudo === "owner") {
        if (!ownerUserId) throw new Error("Owner user id not configured");
        const res = await fetch(`${API_BASE}/friends/${ownerUserId}/messages`, {
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
            chatroom_id: "owner",
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
    <div className="admin-chat-page">
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

          {!ownerUserId && (
            <div className="no-rooms owner-config-note">
              Set REACT_APP_OWNER_USER_ID or localStorage 'owner_user_id' to enable Contact Owner.
            </div>
          )}
        </aside>

        <main className="chatroom-main-fixed">
          <div className="page-header">
            <h1 className="page-title">
              <FiMessageSquare className="title-icon" />
              Participant Communication
            </h1>
            <p className="page-description">Connect with participants, manage event discussions, and contact the owner directly.</p>
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
                          <span className="message-user">{m.username || (mine ? "You" : selectedRoom._pseudo === 'owner' ? 'Owner' : `User ${m.user_id}`)}</span>
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
            <p>Select a room or use Contact Owner to begin.</p>
            {error && <div className="error-box">{error}</div>}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
