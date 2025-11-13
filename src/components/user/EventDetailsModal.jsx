import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventDetailsModal.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const EventDetailsModal = ({ event, isOpen, onClose, hideRegisterButton = false }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [showTicketSelection, setShowTicketSelection] = useState(false);
  const [error, setError] = useState(null);

    const checkRegistrationStatus = React.useCallback(async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE}/registrations/check/${event.event_id || event.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRegistrationStatus(response.data.registered ? "registered" : null);
      } catch (err) {
        console.error("Error checking registration:", err);
      }
    }, [event]);

    const fetchTickets = React.useCallback(async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE}/tickets/event/${event.event_id || event.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTickets(response.data || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setTickets([]);
      }
    }, [event]);

  useEffect(() => {
    if (isOpen && event) {
      checkRegistrationStatus();
      fetchTickets();
    }
  }, [isOpen, event, checkRegistrationStatus, fetchTickets]);

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
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/registrations`,
        {
          event_id: event.event_id || event.id,
          ticket_type: "Free",
          amount: 0,
          status: "confirmed",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/registrations`,
        {
          event_id: event.event_id || event.id,
          ticket_type: selectedTicket.ticket_type,
          amount: selectedTicket.price,
          status: "confirmed",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    if (event.location) return event.location;
    if (event.locations) {
      try {
        const loc = typeof event.locations === "string" 
          ? JSON.parse(event.locations) 
          : event.locations;
        if (Array.isArray(loc)) {
          return loc[0]?.address || loc[0]?.city || loc[0]?.name || "Location TBA";
        }
        return loc.address || loc.city || loc.name || "Location TBA";
      } catch {
        return "Location TBA";
      }
    }
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
                  {event.category && (
                    <span className="meta-item category-badge">{event.category}</span>
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
                  <pre style={{ fontSize: 13, background: 'var(--c-surface, #f8fafc)', padding: 12, borderRadius: 8, color: 'var(--c-text, #111)' }}>
                    {typeof event.locations === 'string' ? event.locations : JSON.stringify(event.locations, null, 2)}
                  </pre>
                </div>
              )}

              {event.sessions && (
                <div className="modal-section">
                  <h3>Sessions</h3>
                  <pre style={{ fontSize: 13, background: 'var(--c-surface, #f8fafc)', padding: 12, borderRadius: 8, color: 'var(--c-text, #111)' }}>
                    {typeof event.sessions === 'string' ? event.sessions : JSON.stringify(event.sessions, null, 2)}
                  </pre>
                </div>
              )}

              {event.documents && (
                <div className="modal-section">
                  <h3>Documents</h3>
                  <pre style={{ fontSize: 13, background: 'var(--c-surface, #f8fafc)', padding: 12, borderRadius: 8, color: 'var(--c-text, #111)' }}>
                    {typeof event.documents === 'string' ? event.documents : JSON.stringify(event.documents, null, 2)}
                  </pre>
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
