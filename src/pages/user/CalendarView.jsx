// CalendarView.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; // module-scope stable value

// 👉 Local-date helper (NO UTC conversion)
function toLocalDayISO(input) {
  if (!input) return null;

  // If backend sends 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss', trust the date part
  if (typeof input === "string") {
    const m = input.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }

  // Otherwise, build YYYY-MM-DD from local time components
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function CalendarView() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      console.warn("No auth token found, redirecting to /login");
      window.location.href = "/login";
      return;
    }

    const controller = new AbortController();

    const fetchJoinedEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/events/user/joined`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        // Normalize events: local-day string at _dayISO
        const normalized = (Array.isArray(res.data) ? res.data : []).map((ev) => {
          const dt = ev.start_time ?? ev.date ?? ev.startDate ?? ev.created_at;
          return { ...ev, _dayISO: toLocalDayISO(dt) };
        });

        setEvents(normalized);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Failed to fetch joined events:", err);
        setError("Could not load your joined events.");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedEvents();
    return () => controller.abort();
  }, [token]); // API_BASE is stable at module scope

  const eventsForDay = (day) => {
    const dayStr = toLocalDayISO(day);
    return events.filter((e) => e._dayISO === dayStr);
  };

  if (loading) {
    return (
      <div className="calendar-view">
        <div className="calendar-header">
          <h1>Event Calendar</h1>
          <p>Loading your joined events…</p>
        </div>
        <div style={{ textAlign: "center", padding: 24 }}>
          <div className="loading-spinner" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h1>Event Calendar</h1>
        <div className="title-underline"></div>
        <p>Events you're participating in</p>
      </div>

      {error && (
        <div className="error-message" role="alert" style={{ maxWidth: 980, margin: "0 auto 1rem" }}>
          {error}
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-wrapper">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={({ date: tileDate, view }) => {
              if (view !== "month") return null;
              const dailyEvents = eventsForDay(tileDate);
              return dailyEvents.length > 0 ? (
                <div className="event-dots" aria-hidden>
                  {dailyEvents.map((_, i) => (
                    <div key={i} className="event-dot" />
                  ))}
                </div>
              ) : null;
            }}
            tileClassName={({ date: tileDate }) => {
              const dayStr = toLocalDayISO(tileDate);
              const todayStr = toLocalDayISO(new Date());
              return dayStr === todayStr ? "today-tile" : "";
            }}
          />
        </div>

        <div className="event-list">
          <div className="event-list-header">
            <h2>
              <FiCalendar /> Events on{" "}
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
            <span className="events-count">{eventsForDay(date).length} events</span>
          </div>

          {eventsForDay(date).length > 0 ? (
            <ul className="events-container">
              {eventsForDay(date).map((event) => (
                <li key={event.event_id ?? event.id} className="event-item">
                  <div className="event-content">
                    <h3>{event.title ?? event.name}</h3>
                    <div className="event-meta">
                      {event.start_time && (
                        <span>
                          <FiClock />{" "}
                          {new Date(event.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      {event.location && (
                        <span>
                          <FiMapPin /> {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && <p className="event-description">{event.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-events">
              <p>No events you're participating in on this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
