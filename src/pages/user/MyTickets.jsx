// src/pages/user/MyTickets.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyTickets.css";

// Simple inline icons
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const TicketIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
    <path d="M13 5v2"></path>
    <path d="M13 17v2"></path>
    <path d="M13 11v2"></path>
  </svg>
);

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tickets/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(res.data || []);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (timeStr) =>
    new Date(timeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return <div className="my-tickets-page"><p>Loading tickets...</p></div>;
  }

  return (
    <div className="my-tickets-page">
      <h1 className="page-title">My Tickets</h1>
      <p className="page-subtitle">
        Here are your tickets for upcoming events
      </p>

      <div className="tickets-grid">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div className="ticket-card" key={ticket.ticket_id}>
              <div className="ticket-info">
                <h3>{ticket.eventName}</h3>

                <div className="ticket-meta">
                  <CalendarIcon />
                  <span>
                    {formatDate(ticket.start_time)} • {formatTime(ticket.start_time)} - {formatTime(ticket.end_time)}
                  </span>
                </div>

                <div className="ticket-meta">
                  <MapPinIcon />
                  <span>{ticket.location}</span>
                </div>

                <span className="ticket-type">
                  <TicketIcon /> {ticket.status}
                </span>
              </div>

              <div className="ticket-footer">
                <span className="ticket-id">{ticket.ticket_code}</span>
                <div className="ticket-qr">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticket_code}`}
                    alt={`QR code for ${ticket.eventName}`}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-tickets">
            <h3>No Tickets Found</h3>
            <p>You don’t have any upcoming tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
