import React, { useState, useEffect } from "react";
import API from "../../api";
import "./EventDetailsModal.css";

// Local mapping for category ids to user-friendly labels (used where backend returns numeric ids)
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

  // Helper to extract numeric id from multiple possible fields/nested shapes
  const extractId = (obj) => {
    if (!obj) return null;
    const candidates = [
      obj.category_id,
      obj.categoryId,
      obj.cat_id,
      obj.catId,
      obj.category && obj.category.id,
      obj.category && obj.category.category_id,
      obj.category && obj.categoryId,
      obj.category && obj.category_id,
    ];
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== "") {
        const n = Number(c);
        if (!isNaN(n)) return n;
      }
    }
    return null;
  };

  const id = extractId(ev);
  if (id !== null) {
    return categoryIdToLabel[id] || (ev.category_name || ev.category_label || ev.category || String(id));
  }

  // If `category` is an object, prefer its name/label
  if (ev.category && typeof ev.category === "object") {
    return ev.category.name || ev.category.label || ev.category.title || JSON.stringify(ev.category);
  }

  // If category is numeric or numeric string, map it
  if (typeof ev.category === "number") return categoryIdToLabel[ev.category] || String(ev.category);
  if (typeof ev.category === "string") {
    const trimmed = ev.category.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      return categoryIdToLabel[n] || trimmed;
    }
    // Known backend sometimes returns generic 'General' — prefer more specific fields if present
    return ev.category_name || ev.category_label || trimmed;
  }

  return ev.category_name || ev.category_label || "";
};

// Use central API instance (it already prefixes with /api and attaches tokens)

const EventDetailsModal = ({ event, isOpen, onClose, hideRegisterButton = false }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [showTicketSelection, setShowTicketSelection] = useState(false);
  const [error, setError] = useState(null);

    // Previously used callbacks for registration/ticket checks were refactored
    // into a single defensive effect below; no extra callbacks needed.

  useEffect(() => {
    // Defensive fetch: run when modal opens and event is present
    if (!isOpen || !event) return;

    let cancelled = false;
    const controller = new AbortController();

    const id = event?.event_id ?? event?.id;
    if (!id) return;

    (async () => {
      try {
        const regRes = await API.get(`/registrations/check/${id}`, { signal: controller.signal });
        if (!cancelled) setRegistrationStatus(regRes.data.registered ? "registered" : null);
      } catch (err) {
        // log but don't rethrow
        console.error("Error checking registration:", err);
      }

      try {
        const ticketsRes = await API.get(`/tickets/event/${id}`, { signal: controller.signal });
        if (!cancelled) setTickets(ticketsRes.data || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        if (!cancelled) setTickets([]);
      }
    })();

    return () => {
      cancelled = true;
      try { controller.abort(); } catch (e) { /* ignore */ }
    };
  }, [isOpen, event]);

  // Helpful debug: log event object when modal opens so we can inspect available category fields
  useEffect(() => {
    if (isOpen && event) {
      try {
        // eslint-disable-next-line no-console
        console.debug("EventDetailsModal - event payload:", event);
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, event]);

  const handleRegisterClick = () => {
    if (registrationStatus === "registered") {
      return;
    }

    if (tickets.length > 0) {
      setShowTicketSelection(true);
    } else {
      // Free event - register directly
      handleFreeRegistration();
    }
  };

  const handleFreeRegistration = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post(`/registrations`, {
        event_id: event.event_id || event.id,
        ticket_type: "Free",
        amount: 0,
        status: "confirmed",
      });

      if (response.data.success) {
        setRegistrationStatus("registered");
        setError(null);
        alert("Successfully registered for the event!");
      }
    } catch (err) {
      console.error("Error registering:", err);
      setError(err.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelection = async () => {
    if (!selectedTicket) {
      setError("Please select a ticket type");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await API.post(`/registrations`, {
        event_id: event.event_id || event.id,
        ticket_type: selectedTicket.ticket_type,
        amount: selectedTicket.price,
        status: "confirmed",
      });

      if (response.data.success) {
        setRegistrationStatus("registered");
        setShowTicketSelection(false);
        setError(null);
        alert("Successfully registered for the event!");
      }
    } catch (err) {
      console.error("Error registering:", err);
      setError(err.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    if (diffMs <= 0) return null;
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      return diffDays === 1 
        ? `1 day${remainingHours > 0 ? ` ${remainingHours}h` : ''}`
        : `${diffDays} days${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
    } else if (diffHours > 0) {
      const remainingMins = diffMins % 60;
      return `${diffHours}h${remainingMins > 0 ? ` ${remainingMins}m` : ''}`;
    } else {
      return `${diffMins} minutes`;
    }
  };

  const getLocation = (event) => {
    // Prefer simple fields first
    const candidates = [
      event.location,
      event.location_name,
      event.location_label,
      event.venue,
      event.place,
      event.address,
      event.city,
    ];

    for (const c of candidates) {
      if (c && typeof c === "string" && c.trim().length) return c.trim();
    }

    // Handle structured locations (array or object), including JSON-stringified values
    const raw = event.locations || event.location_details || event.location_obj;
    if (raw) {
      try {
        const loc = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(loc) && loc.length > 0) {
          const first = loc[0];
          const parts = [first.name, first.label, first.address, first.city, first.venue].filter(Boolean);
          if (parts.length) return parts.join(" — ");
          // fallback to stringify small object
          return first.name || first.address || JSON.stringify(first);
        }
        if (loc && typeof loc === 'object') {
          const parts = [loc.name, loc.label, loc.address, loc.city, loc.venue].filter(Boolean);
          if (parts.length) return parts.join(" — ");
        }
      } catch (e) {
        // ignore parse error and fall through
      }
    }

    // Last resort: check nested fields commonly used by different schemas
    if (event.location_lat && event.location_lng) return `Lat: ${event.location_lat}, Lng: ${event.location_lng}`;

    return "Location TBA";
  };

  if (!isOpen || !event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        {!showTicketSelection ? (
          <>
            <div className="modal-header">
              <div className="modal-image">
                <img
                  src={event.image_path || event.image || `https://source.unsplash.com/800x400/?${event.category || "event"}`}
                  alt={event.title}
                  onError={e => { e.target.src = `https://source.unsplash.com/800x400/?${event.category || "event"}`; }}
                />
              </div>
              <div className="modal-title-section">
                <h2>{event.title}</h2>
                <div className="modal-meta">
                  <span className="meta-item">
                    📅 {formatDate(event.start_time)}
                  </span>
                  {calculateDuration(event.start_time, event.end_time) && (
                    <span className="meta-item">
                      ⏱️ Duration: {calculateDuration(event.start_time, event.end_time)}
                    </span>
                  )}
                  <span className="meta-item">📍 {getLocation(event)}</span>
                  {determineCategory(event) && (
                    <span className="meta-item category-badge">{determineCategory(event)}</span>
                  )}
                  {event.capacity && (
                    <span className="meta-item">👥 Capacity: {event.capacity}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>About This Event</h3>
                <p className="event-description">{event.description || "No description available."}</p>
              </div>

              {(event.creator_name || event.organizer) && (
                <div className="modal-section">
                  <h3>Organizer</h3>
                  <p><strong>{event.creator_name || event.organizer}</strong></p>
                  {event.creator_email && (
                    <p style={{ fontSize: '14px', color: 'var(--c-muted, #64748b)', marginTop: '4px' }}>
                      📧 {event.creator_email}
                    </p>
                  )}
                  {event.created_at && (
                    <p style={{ fontSize: '13px', color: 'var(--c-muted, #64748b)', marginTop: '8px' }}>
                      🕒 Created on: {new Date(event.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              )}

              {event.locations && (
                <div className="modal-section">
                  <h3>Location Details</h3>
                  {(() => {
                    try {
                      const rawLoc = typeof event.locations === 'string' ? JSON.parse(event.locations) : event.locations;
                      if (Array.isArray(rawLoc) && rawLoc.length > 0) {
                        const first = rawLoc[0];
                        const parts = [first.name, first.label, first.address, first.city, first.venue].filter(Boolean);
                        return <p style={{ fontSize: 14 }}>{parts.join(' — ')}</p>;
                      }
                      if (rawLoc && typeof rawLoc === 'object') {
                        const parts = [rawLoc.name, rawLoc.label, rawLoc.address, rawLoc.city, rawLoc.venue].filter(Boolean);
                        return <p style={{ fontSize: 14 }}>{parts.join(' — ')}</p>;
                      }
                      return <p style={{ fontSize: 13 }}>{String(rawLoc)}</p>;
                    } catch (e) {
                      return <pre style={{ fontSize: 13, background: 'var(--c-surface, #f8fafc)', padding: 12, borderRadius: 8, color: 'var(--c-text, #111)' }}>{String(event.locations)}</pre>;
                    }
                  })()}
                </div>
              )}

              {event.sessions && (
                <div className="modal-section">
                  <h3>Sessions</h3>
                  {(() => {
                    try {
                      const raw = typeof event.sessions === 'string' ? JSON.parse(event.sessions) : event.sessions;
                      if (Array.isArray(raw) && raw.length > 0) {
                        return (
                          <ul style={{ paddingLeft: 18 }}>
                            {raw.map((s, idx) => (
                              <li key={idx} style={{ marginBottom: 6 }}>
                                <strong>{s.title || s.name || `Session ${idx + 1}`}</strong>
                                {s.start || s.end ? (
                                  <span style={{ marginLeft: 8, color: 'var(--c-muted, #64748b)' }}>
                                    {s.start ? s.start : ''}{s.start && s.end ? ' — ' : ''}{s.end ? s.end : ''}
                                  </span>
                                ) : null}
                                {s.desc ? <div style={{ fontSize: 13, color: 'var(--c-muted, #64748b)' }}>{s.desc}</div> : null}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return <p style={{ fontSize: 13 }}>{String(raw)}</p>;
                    } catch (e) {
                      return <pre style={{ fontSize: 13, background: 'var(--c-surface, #f8fafc)', padding: 12, borderRadius: 8, color: 'var(--c-text, #111)' }}>{String(event.sessions)}</pre>;
                    }
                  })()}
                </div>
              )}

              {event.documents && Array.isArray(event.documents) && event.documents.length > 0 && (
                <div className="modal-section">
                  <h3>Documents</h3>
                  <ul style={{ paddingLeft: 18 }}>
                    {event.documents.map((doc, i) => (
                      <li key={i}>
                        {typeof doc === 'string' ? (
                          <a href={doc} target="_blank" rel="noreferrer">{doc}</a>
                        ) : (
                          <a href={doc.url || doc.path} target="_blank" rel="noreferrer">{doc.name || doc.title || doc.path || doc.url}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tickets.length > 0 && (
                <div className="modal-section">
                  <h3>Available Tickets</h3>
                  <div className="tickets-preview">
                    {tickets.slice(0, 3).map((ticket, idx) => (
                      <div key={idx} className="ticket-preview-item">
                        <span className="ticket-name">{ticket.ticket_type}</span>
                        <span className="ticket-price">₹{ticket.price}</span>
                      </div>
                    ))}
                    {tickets.length > 3 && (
                      <p className="more-tickets">+{tickets.length - 3} more ticket types</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!hideRegisterButton && (
              <div className="modal-footer">
                {error && <div className="error-message">{error}</div>}
                <button
                  className={`register-btn ${registrationStatus === "registered" ? "registered" : ""}`}
                  onClick={handleRegisterClick}
                  disabled={loading || registrationStatus === "registered"}
                >
                  {loading
                    ? "Processing..."
                    : registrationStatus === "registered"
                    ? "✓ Already Registered"
                    : tickets.length > 0
                    ? "Register Now"
                    : "Register for Free"}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="ticket-selection-header">
              <button className="back-btn" onClick={() => setShowTicketSelection(false)}>
                ← Back
              </button>
              <h2>Select Your Ticket</h2>
            </div>

            <div className="ticket-selection-body">
              {tickets.map((ticket) => (
                <div
                  key={ticket.ticket_id}
                  className={`ticket-option ${selectedTicket?.ticket_id === ticket.ticket_id ? "selected" : ""}`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="ticket-info">
                    <h4>{ticket.ticket_type}</h4>
                    {ticket.description && <p>{ticket.description}</p>}
                    <div className="ticket-details">
                      <span>Available: {ticket.quantity_available}</span>
                    </div>
                  </div>
                  <div className="ticket-price-select">
                    <div className="ticket-price">₹{ticket.price}</div>
                    <div className={`select-radio ${selectedTicket?.ticket_id === ticket.ticket_id ? "selected" : ""}`}>
                      {selectedTicket?.ticket_id === ticket.ticket_id && "✓"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              {error && <div className="error-message">{error}</div>}
              <div className="ticket-footer-actions">
                <button className="cancel-btn" onClick={() => setShowTicketSelection(false)}>
                  Cancel
                </button>
                <button
                  className="continue-btn"
                  onClick={handleTicketSelection}
                  disabled={!selectedTicket || loading}
                >
                  {loading ? "Processing..." : `Continue - ₹${selectedTicket?.price || 0}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventDetailsModal;
