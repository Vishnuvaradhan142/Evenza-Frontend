// MyEvents.jsx
import React, { useEffect, useState } from "react";
import EventDetailsModal from "../../components/user/EventDetailsModal";
import API from "../../api";
import "./MyEvents.css";

const MyEvents = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Image, location-format and status helpers were removed because the
  // simplified My Events card only shows title and date/time.

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
        // Use central API (attaches token)
        const res = await API.get(`/events/user/joined`);
        // Normalize common field variations so UI can rely on start_time/title
        const normalized = (Array.isArray(res.data) ? res.data : []).map((ev) => {
          const start = ev.start_time ?? ev.event_date ?? ev.eventDate ?? ev.date ?? ev.startDate ?? ev.created_at ?? null;
          const end = ev.end_time ?? ev.ends_at ?? ev.end ?? ev.event_end ?? null;
          const title = ev.title ?? ev.event_name ?? ev.name ?? "Untitled Event";
          return { ...ev, start_time: start, end_time: end, title };
        });
        setMyEvents(normalized);
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
      <header className="page-header">
        <h1 className="page-title">My Events</h1>
        <p className="page-subtitle">
          Here are all the events you have registered for.
        </p>
      </header>

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
              <div className="event-details">
                <h3>{event.title}</h3>
                <p className="event-date">
                  {event.start_time ? new Date(event.start_time).toLocaleDateString() : "TBD"} • {" "}
                  {event.start_time ? new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                  {event.end_time ? (
                    <>
                      {" "}- {" "}
                      {new Date(event.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </>
                  ) : null}
                </p>
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
