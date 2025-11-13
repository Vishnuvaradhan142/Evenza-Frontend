// MyEvents.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import EventDetailsModal from "../../components/user/EventDetailsModal";
import "./MyEvents.css";

const API_BASE = "http://localhost:5000/api/events"; // adjust to your backend

const MyEvents = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get image for event
  const getImageForEvent = useCallback((ev) => {
    if (ev.image_path) return ev.image_path;
    if (ev.image) return ev.image;
    const keyword = encodeURIComponent(ev.category || ev.title || "event");
    return `https://source.unsplash.com/600x400/?${keyword}`;
  }, []);

  // Get event status based on start and end times
  const getEventStatus = useCallback((event) => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    if (now < startTime) {
      return { label: "Upcoming", className: "status-upcoming" };
    } else if (now >= startTime && now <= endTime) {
      return { label: "Ongoing", className: "status-ongoing" };
    } else {
      return { label: "Completed", className: "status-completed" };
    }
  }, []);

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

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
              onClick={() => handleCardClick(event)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(event);
                }
              }}
            >
              <img
                src={getImageForEvent(event)}
                alt={event.title}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  const keyword = encodeURIComponent(event.category || event.title || "event");
                  e.target.src = `https://source.unsplash.com/600x400/?${keyword}`;
                }}
              />
              <div className="event-details">
                <div className="event-header">
                  <span className="event-cat">{event.category}</span>
                  <span className={`event-status ${getEventStatus(event).className}`}>
                    {getEventStatus(event).label}
                  </span>
                </div>
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

      {isModalOpen && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={closeModal}
          hideRegisterButton={true}
        />
      )}
    </div>
  );
};

export default MyEvents;
