import React, { useEffect, useState, useContext } from "react";
import API from "../../api";
import { NotificationContext } from "../../context/NotificationContext";
import EventDetailsModal from "../../components/user/EventDetailsModal";
import "./SavedEvents.css";

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

// Category mapping (same as EventDetailsModal)
const categoryIdToLabel = {
  1: "Technology",
  2: "Cultural Programs",
  3: "Sports",
  4: "Workshops",
  5: "Music & Concerts",
  6: "Networking",
};

const determineCategory = (ev) => {
  if (!ev) return "";
  if (ev.category_id !== undefined && ev.category_id !== null) {
    const id = Number(ev.category_id);
    return categoryIdToLabel[id] || (ev.category_name || ev.category_label || ev.category || String(id));
  }
  if (typeof ev.category === "number") {
    return categoryIdToLabel[ev.category] || String(ev.category);
  }
  if (typeof ev.category === "string") {
    const trimmed = ev.category.trim();
    if (/^\d+$/.test(trimmed)) {
      const id = Number(trimmed);
      return categoryIdToLabel[id] || trimmed;
    }
    return trimmed;
  }
  return "";
};

const SavedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    let mounted = true;
    const fetchSavedEvents = async () => {
      try {
        const res = await API.get(`/saved-events/my`);
        if (!mounted) return;
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching saved events:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSavedEvents();
    return () => { mounted = false; };
  }, []);

  const toggleSaved = async (eventId, e) => {
    if (e) e.stopPropagation();
    try {
      await API.delete(`/saved-events/remove/${eventId}`);
      setEvents((prev) => prev.filter((ev) => Number(ev.event_id || ev.id) !== Number(eventId)));
      if (addNotification) addNotification({ text: "Removed from saved events", type: "info" });
      else alert("Removed from saved events");
    } catch (err) {
      console.error("Error removing saved event:", err);
      if (addNotification) addNotification({ text: "Failed to remove saved event", type: "alert" });
      else alert("Failed to remove saved event");
    }
  };

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="saved-events-page">
      <h1 className="page-title">Saved Events</h1>
      <p className="page-subtitle">These are events you have saved to attend later</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="event-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                className="event-card"
                key={event.saved_id || event.event_id || event.id}
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
                <div className="event-media">
                  <img
                    src={getPlaceholderImage(determineCategory(event))}
                    alt={event.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/600x400/cccccc/969696?text=${encodeURIComponent(
                        event.title
                      )}`;
                    }}
                  />

                  <button
                    type="button"
                    className={`de-wish active`}
                    onClick={(e) => { e.stopPropagation(); toggleSaved(event.event_id || event.id, e); }}
                    aria-label="Unsave event"
                  >
                    ♥
                  </button>
                </div>

                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p className="event-date">{formatDateTime(event.start_time)}</p>
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

      {isModalOpen && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={closeModal}
          hideRegisterButton={false}
        />
      )}
    </div>
  );
};

export default SavedEvents;
