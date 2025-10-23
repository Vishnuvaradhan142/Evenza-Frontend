import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SavedEvents.css";

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

const BookmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

// Category → placeholder image
const getPlaceholderImage = (category) => {
  const baseUrl = "https://via.placeholder.com/600x400";
  const colors = {
    Technology: "4a00e0/ffffff",
    Music: "ff6a00/ffffff",
    Sports: "00b09b/ffffff",
    Art: "8e2de2/ffffff",
    Business: "00c6ff/ffffff",
    Food: "ff4b2b/ffffff",
  };
  return `${baseUrl}/${colors[category] || "cccccc/333333"}?text=${encodeURIComponent(
    category || "Event"
  )}`;
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const SavedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/saved-events/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching saved events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedEvents();
  }, []);

  const removeEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/saved-events/remove/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((event) => event.event_id !== eventId));
    } catch (err) {
      console.error("Error removing event:", err);
    }
  };

  return (
    <div className="saved-events-page">
      <h1 className="page-title">Saved Events</h1>
      <p className="page-subtitle">
        These are events you have saved to attend later
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="event-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <div className="event-card" key={event.saved_id}>
                <img
                  src={getPlaceholderImage(event.category)}
                  alt={event.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/600x400/cccccc/969696?text=${encodeURIComponent(
                      event.title
                    )}`;
                  }}
                />
                <div className="event-details">
                  <span className="event-cat">{event.category}</span>
                  <h3>{event.title}</h3>

                  <div className="event-meta">
                    <CalendarIcon />
                    <span>
                      {formatDate(event.start_time)} – {formatDate(event.end_time)}
                    </span>
                  </div>

                  <div className="event-meta">
                    <LocationIcon />
                    <span>{event.location}</span>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeEvent(event.event_id)}
                  >
                    <BookmarkIcon />
                    <span>Remove from Saved</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3>No Saved Events</h3>
              <p>Save events to see them here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedEvents;
