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

export default function MyAdminEvents() {
  const [events, setEvents] = useState([]);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);

  useEffect(() => {
    setEvents([
      {
        id: 1,
        name: "TechNova Hackathon 2025",
        date: "2025-10-18",
        location: "Innovation Hub",
        image: "https://source.unsplash.com/600x400/?hackathon,tech",
        registrations: 260,
        revenue: 18000,
        status: "Upcoming",
      },
      {
        id: 2,
        name: "Annual Cultural Extravaganza",
        date: "2025-09-28",
        location: "Main Auditorium",
        image: "https://source.unsplash.com/600x400/?concert,crowd",
        registrations: 420,
        revenue: 24000,
        status: "Ongoing",
      },
      {
        id: 3,
        name: "Sports Meet & Athletics",
        date: "2025-08-21",
        location: "College Stadium",
        image: "https://source.unsplash.com/600x400/?sports,stadium",
        registrations: 520,
        revenue: 30000,
        status: "Completed",
      },
      {
        id: 4,
        name: "Startup Pitch Fest",
        date: "2025-11-02",
        location: "Entrepreneurship Cell",
        image: "https://source.unsplash.com/600x400/?startup,presentation",
        registrations: 180,
        revenue: 20000,
        status: "Upcoming",
      },
      {
        id: 5,
        name: "Photography Masterclass",
        date: "2025-09-20",
        location: "Studio Lab",
        image: "https://source.unsplash.com/600x400/?photography,class",
        registrations: 95,
        revenue: 5000,
        status: "Ongoing",
      },
      {
        id: 6,
        name: "AI & Robotics Expo",
        date: "2025-12-01",
        location: "Tech Pavilion",
        image: "https://source.unsplash.com/600x400/?robotics,ai",
        registrations: 300,
        revenue: 35000,
        status: "Upcoming",
      },
    ]);
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

      {events.length === 0 ? (
        <div className="empty-events">No events yet. Create one to get started.</div>
      ) : (
        <div className="events-grid">
          {events.map((ev) => (
            <div className="event-card" key={ev.id}>
              <div className="event-image-wrapper">
                <img src={ev.image} alt={ev.name} className="event-image" />
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
                  <FiCalendar /> {new Date(ev.date).toDateString()}
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
              <img src={previewEvent.image} alt={previewEvent.name} className="ae-modal__image" />
              <ul className="ae-modal__list">
                <li><strong>Date:</strong> {new Date(previewEvent.date).toDateString()}</li>
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
