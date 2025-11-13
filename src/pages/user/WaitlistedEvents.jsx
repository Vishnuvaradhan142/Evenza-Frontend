import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./WaitlistedEvents.css";

// Icons
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const WaitlistedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store notified state
  const [notified, setNotified] = useState({});

  // Fetch waitlisted events
  useEffect(() => {
    const fetchWaitlisted = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/my-waitlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents(res.data);

        // Set notified state for events already notified
        const notifiedMap = {};
        res.data.forEach((event) => {
          if (event.already_notified) {
            notifiedMap[event.registration_id] = true;
          }
        });
        setNotified(notifiedMap);
      } catch (err) {
        console.error("Error fetching waitlisted events:", err);
        toast.error("Failed to load waitlisted events");
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlisted();
  }, []);

  // Remove waitlist
  const handleRemove = async (registrationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/cancel/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(events.filter((e) => e.registration_id !== registrationId));
      toast.success("Removed from waitlist");
    } catch (err) {
      console.error("Error removing waitlist:", err);
      toast.error("Failed to remove waitlist entry");
    }
  };

  // Notify Me
  const handleNotify = async (registrationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/notify/${registrationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.already_notified) {
        setNotified({ ...notified, [registrationId]: true });
        toast.info(res.data.message || "Already notified");
      } else {
        toast.success(res.data.message || "Notification created");
      }
    } catch (err) {
      console.error("Error requesting notification:", err);
      toast.error("Failed to request notification");
    }
  };

  if (loading) {
    return <div className="loading">Loading waitlisted events...</div>;
  }

  return (
    <div className="waitlisted-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="page-title">Waitlisted Events</h1>
      <p className="page-subtitle">
        These are the events you're currently waitlisted for
      </p>

      <div className="waitlisted-grid">
        {events.length > 0 ? (
          events.map((event) => (
            <div className="waitlisted-card" key={event.registration_id}>
              <img
                src={`https://source.unsplash.com/random/600x400?${encodeURIComponent(
                  event.category || "event"
                )}`}
                alt={event.eventName}
                className="event-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/600x400/cccccc/969696?text=${encodeURIComponent(
                    event.eventName
                  )}`;
                }}
              />
              <div className="event-details">
                <span className="event-category">{event.category || "General"}</span>
                <h3>{event.eventName}</h3>

                <div className="event-meta">
                  <CalendarIcon />
                  <span>{formatDate(event.start_time)}</span>
                </div>

                <div className="event-meta">
                  <LocationIcon />
                  <span>{event.location}</span>
                </div>

                <div className="waitlist-reason">
                  <WarningIcon />
                  <span>Event Full - Awaiting Availability</span>
                </div>

                <div className="waitlist-actions">
                  <button
                    className="waitlist-btn primary"
                    onClick={() => handleNotify(event.registration_id)}
                    disabled={notified[event.registration_id]}
                  >
                    {notified[event.registration_id] ? "Notified" : "Notify Me"}
                  </button>
                  <button
                    className="waitlist-btn secondary"
                    onClick={() => handleRemove(event.registration_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>No Waitlisted Events</h3>
            <p>You're not currently waitlisted for any events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitlistedEvents;
