import React, { useEffect, useState } from "react";
// No page navigation for view/edit; use in-place modals
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import "./MyAdminEvents.css";
import API from "../../api";

export default function MyAdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewEvent, setPreviewEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const BACKEND_ORIGIN = "http://localhost:5000";
  const DEFAULT_IMAGE = `${BACKEND_ORIGIN}/uploads/events/default-event.png`;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const resp = await API.get("/events/mine");
        const rows = Array.isArray(resp.data) ? resp.data : [];
        const now = new Date();
        const mapped = rows.map((r) => {
          const start = r.start_time ? new Date(r.start_time) : null;
          const end = r.end_time ? new Date(r.end_time) : null;
          let status = "Upcoming";
          if (start && end) {
            if (now < start) status = "Upcoming";
            else if (now >= start && now <= end) status = "Ongoing";
            else status = "Completed";
          } else if (end) {
            status = now <= new Date(end) ? "Ongoing" : "Completed";
          }
          const rawImage = r.image_path || r.image || "/uploads/events/default-event.png";
          const img = String(rawImage || "");
          const imageAbs = img.startsWith("http://") || img.startsWith("https://")
            ? img
            : `${BACKEND_ORIGIN}${img}`;
          return {
            id: r.event_id,
            name: r.title,
            date: r.start_time || r.end_time,
            location: r.location || "-",
            image: imageAbs,
            registrations: r.registrations || 0,
            revenue: r.revenue || 0,
            status,
          };
        });
        if (!alive) return;
        setEvents(mapped);
      } catch (e) {
        console.error("Failed to load events:", e);
        setError(e?.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const statusColors = {
    Upcoming: "#f59e0b",
    Ongoing: "#3b82f6",
    Completed: "#10b981",
    Cancelled: "#ef4444",
  };

  const handleView = (ev) => setPreviewEvent(ev);
  const handleEdit = (ev) => setEditEvent(ev);

  const handleDelete = (id) => {
    // Simple client-side delete demo; replace with API call if needed
    const ok = window.confirm("Delete this event?");
    if (!ok) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="admin-events-wrapper">
      <div className="admin-events-header" style={{ textAlign: 'center' }}>
        <h2 className="admin-events-title page-title"><FiCalendar /> My Events</h2>
        <p className="admin-events-sub">All college events you manage</p>
      </div>

      {loading ? (
        <div className="empty-events">Loading your events…</div>
      ) : error ? (
        <div className="empty-events">{error}</div>
      ) : events.length === 0 ? (
        <div className="empty-events">No events yet. Create one to get started.</div>
      ) : (
        <div className="events-grid">
          {events.map((ev) => (
            <div className="event-card" key={ev.id}>
              <div className="event-image-wrapper">
                <img
                  src={ev.image}
                  alt={ev.name}
                  className="event-image"
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_IMAGE) {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }
                  }}
                />
                <span
                  className="event-status"
                  style={{ backgroundColor: statusColors[ev.status] }}
                >
                  {ev.status}
                </span>
              </div>
              <div className="event-body">
                <h3 className="event-name">{ev.name}</h3>
                <div className="event-info">
                  <FiCalendar /> {ev.date ? new Date(ev.date).toDateString() : "-"}
                </div>
                <div className="event-info">
                  <FiMapPin /> {ev.location}
                </div>
                <div className="event-stats">
                  <span>
                    <FiUsers /> {ev.registrations}
                  </span>
                  <span>
                    <FiDollarSign /> ₹{ev.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="event-actions">
                  <button type="button" className="btn view" onClick={() => handleView(ev)} aria-label={`View ${ev.name}`}>
                    <FiEye /> View
                  </button>
                  {(["Upcoming", "Ongoing"].includes(ev.status)) && (
                    <button type="button" className="btn edit" onClick={() => handleEdit(ev)} aria-label={`Edit ${ev.name}`}>
                      <FiEdit2 /> Edit
                    </button>
                  )}
                  <button type="button" className="btn delete" onClick={() => handleDelete(ev.id)} aria-label={`Delete ${ev.name}`}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {previewEvent && (
        <div className="ae-modal" role="dialog" aria-modal="true">
          <div className="ae-modal__backdrop" onClick={() => setPreviewEvent(null)} />
          <div className="ae-modal__panel">
            <div className="ae-modal__header">
              <h3>Preview: {previewEvent.name}</h3>
              <button className="ae-modal__close" onClick={() => setPreviewEvent(null)} aria-label="Close preview">✕</button>
            </div>
            <div className="ae-modal__body">
              <img
                src={previewEvent.image}
                alt={previewEvent.name}
                className="ae-modal__image"
                onError={(e) => {
                  if (e.currentTarget.src !== DEFAULT_IMAGE) {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }
                }}
              />
              <ul className="ae-modal__list">
                <li><strong>Date:</strong> {previewEvent.date ? new Date(previewEvent.date).toDateString() : "-"}</li>
                <li><strong>Location:</strong> {previewEvent.location}</li>
                <li><strong>Registrations:</strong> {previewEvent.registrations}</li>
                <li><strong>Revenue:</strong> ₹{previewEvent.revenue.toLocaleString()}</li>
                <li><strong>Status:</strong> {previewEvent.status}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEvent && (
        <div className="ae-modal" role="dialog" aria-modal="true">
          <div className="ae-modal__backdrop" onClick={() => setEditEvent(null)} />
          <div className="ae-modal__panel">
            <div className="ae-modal__header">
              <h3>Edit Event</h3>
              <button className="ae-modal__close" onClick={() => setEditEvent(null)} aria-label="Close edit">✕</button>
            </div>
            <div className="ae-modal__body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // apply minimal updates
                  setEvents((prev) => prev.map((ev) => (ev.id === editEvent.id ? editEvent : ev)));
                  setEditEvent(null);
                }}
                className="ae-form"
              >
                <label>
                  Name
                  <input value={editEvent.name} onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })} />
                </label>
                <label>
                  Date
                  <input type="date" value={editEvent.date} onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })} />
                </label>
                <label>
                  Location
                  <input value={editEvent.location} onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })} />
                </label>
                <div className="ae-form__actions">
                  <button type="button" className="btn" onClick={() => setEditEvent(null)}>Cancel</button>
                  <button type="submit" className="btn edit">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
