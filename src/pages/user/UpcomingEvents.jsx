import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UpcomingEvents.css";

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
  const options = { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/events/user/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  return (
    <div className="upcoming-events-page">
      <h1 className="page-title">Upcoming Events</h1>
      <p className="page-subtitle">Here are the events you’ve registered for and are coming up soon.</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="event-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <div className="event-card" key={event.event_id}>
                <img src={getPlaceholderImage(event.category)} alt={event.title} />
                <div className="event-details">
                  <span className="event-cat">{event.category}</span>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>

                  <div className="event-meta">
                    <CalendarIcon />
                    <span>{formatDate(event.start_time)}</span>
                  </div>

                  <div className="event-meta">
                    <LocationIcon />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <h3>No Upcoming Events</h3>
              <p>You haven’t registered for any upcoming events yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
