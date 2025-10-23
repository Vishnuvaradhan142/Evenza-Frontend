import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiTarget,
  FiPercent,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import "./AdminAnalytics.css";

export default function AdminAnalytics() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    // ----- College-themed events -----
    const names = [
      "TechFest Hackathon 2025",
      "Annual Cultural Night",
      "Intra-College Sports Meet",
      "Entrepreneurship Pitch Day",
      "Photography & Film Expo",
      "AI & Robotics Workshop",
      "Literary Club Open Mic",
      "Green Campus Sustainability Drive",
      "Music & Dance Carnival",
      "National Level Coding Contest"
    ];

    const locations = [
      "Main Auditorium", "Central Lawn", "Sports Complex", "Innovation Lab",
      "Media Hall", "Robotics Center", "Library Amphitheatre", "Eco Park",
      "Student Plaza", "Computer Science Block"
    ];

    const categories = [
      "Technology", "Cultural", "Sports", "Business",
      "Photography", "Technology", "Literature", "Environment",
      "Music & Dance", "Technology"
    ];

    const sample = names.map((name, i) => {
      const registrations = 100 + Math.floor(Math.random() * 400);
      const confirmed = Math.floor(registrations * (0.7 + Math.random() * 0.2));
      const revenue = registrations * (20 + Math.random() * 80); // college tickets cheaper
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      const growth = (Math.random() * 40 - 15).toFixed(1); // -15% to +25%
      return {
        id: i + 1,
        name,
        category: categories[i],
        location: locations[i],
        date: new Date(Date.now() + i * 86400000).toDateString(),
        registrations,
        confirmed,
        revenue,
        engagement: 30 + Math.floor(Math.random() * 250),
        conversion: (10 + Math.random() * 20).toFixed(1),
        rating,
        growth,
      };
    });

    setEvents(sample);
  }, []);

  return (
    <div className="analytics-wrapper">
      {/* Sidebar */}
      <aside className="analytics-sidebar">
        <h2 className="sidebar-title">Campus Events</h2>
        <ul className="event-list">
          {events.map((ev) => (
            <li
              key={ev.id}
              className={`event-list-item ${
                selectedEvent?.id === ev.id ? "active" : ""
              }`}
              onClick={() => setSelectedEvent(ev)}
            >
              <div className="event-list-name">{ev.name}</div>
              <div className="event-list-meta">{ev.location}</div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main analytics area */}
      <main className="analytics-main">
        {selectedEvent ? (
          <div className="event-details">
            <h2>{selectedEvent.name}</h2>
            <p className="event-meta">
              {selectedEvent.category} • {selectedEvent.location} •{" "}
              {selectedEvent.date}
            </p>

            <div className="metrics-grid">
              <Metric icon={<FiUsers />} label="Total Registrations" value={selectedEvent.registrations} />
              <Metric icon={<FiTarget />} label="Confirmed" value={selectedEvent.confirmed} />
              <Metric icon={<FiDollarSign />} label="Revenue (₹)" value={`₹${Math.floor(selectedEvent.revenue)}`} />
              <Metric icon={<FiActivity />} label="Engagement" value={selectedEvent.engagement} />
              <Metric icon={<FiPercent />} label="Conversion" value={`${selectedEvent.conversion}%`} />
              <Metric icon={<FiStar />} label="Avg Rating" value={`${selectedEvent.rating} ⭐`} />
              <Metric icon={<FiTrendingUp />} label="Growth vs Last" value={`${selectedEvent.growth}%`} />
            </div>
          </div>
        ) : (
          <div className="empty-state">Select a campus event to view analytics.</div>
        )}
      </main>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-info">
        <div className="metric-value">
          {typeof value === "number" ? (
            <CountUp end={value} duration={1} separator="," />
          ) : (
            value
          )}
        </div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  );
}
