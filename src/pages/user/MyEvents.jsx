// MyEvents.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyEvents.css";

const API_BASE = "http://localhost:5000/api/events"; // adjust to your backend

const MyEvents = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch joined events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token"); // assuming token stored on login
        const res = await axios.get(`${API_BASE}/user/joined`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyEvents(res.data);
      } catch (err) {
        console.error("Error fetching joined events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return <div className="loading">Loading your events...</div>;
  }

  const handleCardClick = (eventId) => {
    window.location.href = `/events/${eventId}`;
  };

  return (
    <div className="my-events-page">
      <h1 className="page-title">My Events</h1>
      <p className="page-subtitle">
        Here are all the events you have registered for.
      </p>

      <div className="event-grid">
        {myEvents.length > 0 ? (
          myEvents.map((event) => (
            <div
              className="event-card"
              key={event.event_id}
              onClick={() => handleCardClick(event.event_id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(event.event_id);
                }
              }}
            >
              {/* Placeholder image since backend doesn’t return one */}
              <img
                src="https://source.unsplash.com/random/400x200?event"
                alt={event.title}
                loading="lazy"
              />
              <div className="event-details">
                <span className="event-cat">{event.category}</span>
                <h3>{event.title}</h3>
                <p className="event-date">
                  {new Date(event.start_time).toLocaleDateString()} •{" "}
                  {new Date(event.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(event.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="event-location">{event.location}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events">You have not registered for any events yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
