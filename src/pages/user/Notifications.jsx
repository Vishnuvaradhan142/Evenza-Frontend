// Notifications.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./Notifications.css";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const token = localStorage.getItem("token");

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hr ago`;

    return notificationTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notifications/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Open a notification: show modal and mark as read IF unread.
   * Uses optimistic UI update.
   */
  const openNotification = async (notif) => {
    // show details immediately
    setSelectedNotif(notif);

    // if already read (1 / "1" / truthy) -> do nothing
    // we treat numeric '0' and string '0' as unread.
    if (Number(notif.is_read)) return;

    // optimistic update: mark in UI immediately
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notif.notification_id ? { ...n, is_read: 1 } : n
      )
    );

    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notif.notification_id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // server success — nothing more to do (UI already updated)
    } catch (err) {
      // revert UI if API failed
      console.error("Error marking notification as read:", err);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notif.notification_id ? { ...n, is_read: 0 } : n
        )
      );
    }
  };

  // Clear all notifications (you already had this; preserved)
  const clearNotifications = async () => {
    try {
      await axios.delete("http://localhost:5000/api/notifications/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2 className="page-title">Notifications</h2>
        {notifications.length > 0 && (
          <button className="clear-btn" onClick={clearNotifications}>
            <span>🗑️</span> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="no-notifs">No notifications yet. You're all caught up!</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notif) => (
            <li
              key={notif.notification_id}
              tabIndex={0}
              role="button"
              aria-pressed={!!Number(notif.is_read)}
              className={`notification-item ${Number(notif.is_read) ? "read" : "unread"} fade-in`}
              onClick={() => openNotification(notif)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openNotification(notif);
                }
              }}
            >
              <span className={`icon ${notif.type || "in-app"}`}></span>
              <div className="text">
                <p>{notif.title}</p>
                {/* optional excerpt if your API provides short text */}
                {notif.message && <div className="excerpt">{notif.message}</div>}
                <small>{formatTime(notif.created_at)}</small>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedNotif && (
        <div className="notif-modal-overlay" onClick={() => setSelectedNotif(null)}>
          <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedNotif.title}</h3>
            {selectedNotif.event_title && <h4>📌 {selectedNotif.event_title}</h4>}
            <p>{selectedNotif.message}</p>
            <small>{formatTime(selectedNotif.created_at)}</small>
            <div className="notif-actions">
              <button
                className="close-btn"
                onClick={() => setSelectedNotif(null)}
                autoFocus
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
