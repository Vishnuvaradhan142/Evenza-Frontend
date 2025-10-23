import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import axios from "axios";
import { FiCalendar, FiBell, FiUser } from "react-icons/fi";

const categoriesList = [
  "Cultural Programs",
  "Music & Concerts",
  "Networking",
  "Sports",
  "Technology",
  "Workshops",
];

// ✅ Date formatter helper
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [joinedCount, setJoinedCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!token || !userId) {
      console.error("Token or User ID missing");
      window.location.href = "/login";
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ✅ Fetch all events
        const allEventsRes = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllEvents(allEventsRes.data || []);

        // ✅ Fetch upcoming events
        const upcomingEventsRes = await axios.get("http://localhost:5000/api/events/user/upcoming", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(upcomingEventsRes.data || []);

        // ✅ Joined count
        const joinedCountRes = await axios.get("http://localhost:5000/api/events/stats/joined", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJoinedCount(joinedCountRes.data?.joinedCount ?? 0);

        // ✅ Upcoming count
        const upcomingCountRes = await axios.get("http://localhost:5000/api/events/stats/upcoming", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingCount(upcomingCountRes.data?.upcomingCount ?? (upcomingEventsRes.data ? upcomingEventsRes.data.length : 0));

        // ✅ Notifications count
        const notifRes = await axios.get("http://localhost:5000/api/notifications/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationCount(Array.isArray(notifRes.data) ? notifRes.data.length : 0);

        // ✅ User details
        const userRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(userRes.data?.username ?? "");
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  // Show loading UI while fetching — uses `loading`
  if (loading) {
    return (
      <div className="advanced-dashboard" style={{ marginTop: "2rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      (event.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recentUpcomingEvents = upcomingEvents.slice(0, 3);

  const goTo = (url) => {
    window.location.href = url;
  };

  return (
    <div className="advanced-dashboard" style={{ marginTop: "2rem" }}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {username} 👋</h1>
          <div className="user-actions">
            <a className="icon-btn notification-btn" href="/user/community/notifications" aria-label="Notifications">
              <FiBell />
              <span className="badge">{notificationCount}</span>
            </a>
            <a className="user-avatar" href="/user/profile" aria-label="Profile">
              <FiUser />
            </a>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="stats-section">
        <h2 className="section-title">Your Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FiCalendar /></div>
            <div className="stat-content">
              <h3>{joinedCount}</h3>
              <p>Joined Events</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FiCalendar /></div>
            <div className="stat-content">
              <h3>{upcomingCount}</h3>
              <p>Upcoming</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FiBell /></div>
            <div className="stat-content">
              <h3>{notificationCount}</h3>
              <p>Notifications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Upcoming Events (with View All) */}
      {upcomingEvents.length > 0 && (
        <section className="events-section">
          <div className="section-header">
            <h2 className="section-title">Your Upcoming Events</h2>
            <button
              className="view-all-btn"
              onClick={() => goTo("/user/events/upcoming")}
            >
              View All
            </button>
          </div>

          <div className="event-scroll-container">
            {recentUpcomingEvents.map((event) => (
              <div key={event.event_id} className="event-card">
                <div className="event-image-container">
                  <img
                    src={event.image || "https://source.unsplash.com/400x250/?event"}
                    alt={event.title}
                  />
                </div>
                <div className="event-details">
                  <div className="event-meta">
                    <span>{formatDateTime(event.start_time)}</span>
                    <span>{event.category}</span>
                    <span className="status-badge upcoming">Upcoming</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories (no View All) */}
      <section className="category-section">
        <div className="section-header">
          <h2 className="section-title">Popular Categories</h2>
        </div>

        <div className="chip-list">
          {categoriesList.map((cat, idx) => (
            <button
              key={idx}
              className={`chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? "" : cat)
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Events / Discover More (with View All) */}
      <section className="events-section">
        <div className="section-header">
          <h2 className="section-title">Discover More Events</h2>
          <button
            className="view-all-btn"
            onClick={() => goTo("/user/events/browse")}
          >
            View All
          </button>
        </div>

        <div className="event-scroll-container">
          {filteredEvents.slice(0, 3).map((event) => (
            <div key={event.event_id} className="event-card">
              <div className="event-image-container">
                <img
                  src={event.image || "https://source.unsplash.com/400x250/?event"}
                  alt={event.title}
                />
              </div>
              <div className="event-details">
                <div className="event-meta">
                  <span>{formatDateTime(event.start_time)}</span>
                  <span>{event.category}</span>
                </div>
                <h3>{event.title}</h3>
                <p>{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
