import React, { useEffect, useState } from "react";
import API from "../../api";
import "./UpcomingEvents.css";



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

const formatDateTime = (dateString) => {
  if (!dateString) return "Date TBA";
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString(undefined, options);
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchUpcomingEvents = async () => {
      try {
        const res = await API.get(`/events/user/upcoming`);
        if (!mounted) return;
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUpcomingEvents();
    return () => { mounted = false; };
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
              <div
                className="event-card"
                key={event.event_id || event.id}
                onClick={() => { /* keep clickable for modal in future */ }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              >
                <div className="event-media">
                  <img
                    src={getPlaceholderImage(event.category)}
                    alt={event.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/600x400/cccccc/969696?text=${encodeURIComponent(event.title)}`; }}
                  />
                  <button type="button" className="de-wish" aria-label="Wish">♥</button>
                </div>

                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p className="event-date">{formatDateTime(event.start_time)}</p>
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
