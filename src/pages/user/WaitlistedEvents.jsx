import React, { useEffect, useState } from "react";
import API from "../../api";
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
  try {
    return new Date(dateString).toLocaleDateString("en-US", options);
  } catch (e) {
    return "";
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return "";
  }
};

const pickStart = (ev) => {
  return ev.start_time || ev.start || ev.starts_at || ev.startDate || ev.startDateTime || ev.start_dt || ev.start_at || null;
};

const pickTitle = (ev) => {
  return ev.eventName || ev.title || ev.event_title || ev.name || ev.event || `Event ${ev.event_id || ev.registration_id || ''}`;
};

const pickCategory = (ev) => {
  return ev.category || ev.category_name || ev.cat || 'General';
};

const WaitlistedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  // Fetch waitlisted events
  useEffect(() => {
    const fetchWaitlisted = async () => {
      try {
        const res = await API.get(`/registrations/my-waitlist`);

        const data = res.data || [];
        setEvents(data);
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
      await API.delete(`/registrations/cancel/${registrationId}`);
      setEvents(events.filter((e) => e.registration_id !== registrationId));
      toast.success("Removed from waitlist");
    } catch (err) {
      console.error("Error removing waitlist:", err);
      toast.error("Failed to remove waitlist entry");
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
              <div className="event-details">
                <div className="card-header">
                  <span className="waitlist-badge">Waitlisted</span>
                </div>
                <h3>{pickTitle(event)}</h3>

                <div className="category-row">
                  <span className="event-category">{pickCategory(event)}</span>
                </div>

                <div className="event-meta">
                  <CalendarIcon />
                  <span className="date">{formatDate(pickStart(event))}</span>
                  <span className="time">{formatTime(pickStart(event))}</span>
                </div>

                <div className="waitlist-reason">
                  <WarningIcon />
                  <span>Event Full - Awaiting Availability</span>
                </div>

                <div className="waitlist-actions">
                  <button
                    className="waitlist-btn secondary"
                    onClick={() => handleRemove(event.registration_id)}
                  >
                    Remove from waitlist
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
