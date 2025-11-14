import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import axios from "axios";
import { FiCalendar, FiBell, FiUser, FiTrendingUp, FiAward, FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
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

        // ✅ Fetch all events and normalize fields to a consistent shape
        const allEventsRes = await axios.get(`${API_BASE}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("All Events:", allEventsRes.data);
        const normalizeEvent = (e) => ({
          event_id: e.event_id ?? e.id,
          title: e.title || e.event_name || e.name || e.eventTitle || "Untitled Event",
          start_time: e.start_time || e.event_date || e.start || e.date || null,
          end_time: e.end_time || e.event_end || e.end || null,
          location: e.location || e.locations || e.venue || e.place || "",
          category: e.category || e.type || "",
          image: e.image_path || e.image || e.imageUrl || e.image_url || null,
          raw: e,
        });
        setAllEvents(Array.isArray(allEventsRes.data) ? allEventsRes.data.map(normalizeEvent) : []);

        // ✅ Fetch upcoming events and normalize
        const upcomingEventsRes = await axios.get(`${API_BASE}/events/user/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Upcoming Events:", upcomingEventsRes.data);
        setUpcomingEvents(Array.isArray(upcomingEventsRes.data) ? upcomingEventsRes.data.map((e) => ({
          event_id: e.event_id ?? e.id,
          title: e.title || e.event_name || e.name || "Untitled Event",
          start_time: e.start_time || e.event_date || e.start || null,
          end_time: e.end_time || e.event_end || e.end || null,
          location: e.location || e.locations || e.venue || "",
          category: e.category || e.type || "",
          image: e.image_path || e.image || null,
          raw: e,
        })) : []);

        // ✅ Fetch saved events
        try {
          const savedEventsRes = await axios.get(`${API_BASE}/saved-events/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Saved Events:", savedEventsRes.data);
          setSavedEvents(savedEventsRes.data || []);
        } catch (err) {
          console.error("Error fetching saved events:", err);
          setSavedEvents([]);
        }

        // ✅ Joined count
        const joinedCountRes = await axios.get(`${API_BASE}/events/stats/joined`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Joined Count:", joinedCountRes.data);
        // Robust extractor: handle different key casings, nested shapes, or numeric strings
        const extractNumberFromResponse = (obj) => {
          if (obj == null) return null;
          if (typeof obj === "number") return obj;
          if (typeof obj === "string") {
            const n = Number(obj);
            return isNaN(n) ? null : n;
          }
          if (typeof obj === "object") {
            const keys = ["joinedCount", "joinedcount", "joined_count", "count", "joined"];
            for (const k of keys) {
              if (obj[k] !== undefined && obj[k] !== null && !isNaN(Number(obj[k]))) return Number(obj[k]);
            }
            // Check direct values
            for (const v of Object.values(obj)) {
              if (!isNaN(Number(v))) return Number(v);
            }
            // Handle nested arrays like rows: [{ joinedCount: '6' }]
            for (const v of Object.values(obj)) {
              if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
                for (const nested of v) {
                  for (const nv of Object.values(nested)) {
                    if (!isNaN(Number(nv))) return Number(nv);
                  }
                }
              }
            }
          }
          return null;
        };

        const joinedVal = extractNumberFromResponse(joinedCountRes.data);
        setJoinedCount(joinedVal !== null ? joinedVal : 0);

        // ✅ Upcoming count
        const upcomingCountRes = await axios.get(`${API_BASE}/events/stats/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Upcoming Count:", upcomingCountRes.data);
        const upVal = extractNumberFromResponse(upcomingCountRes.data) ?? null;
        setUpcomingCount(upVal !== null ? upVal : (upcomingEventsRes.data ? upcomingEventsRes.data.length : 0));

        // ✅ Notifications count
        const notifRes = await axios.get(`${API_BASE}/notifications/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Notifications:", notifRes.data);
        setNotificationCount(Array.isArray(notifRes.data) ? notifRes.data.length : 0);

        // ✅ User details
        const userRes = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User:", userRes.data);
        setUsername(userRes.data?.username ?? "");
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          navigate("/login");
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

  // Format location same as other pages: handle JSON-string locations
  const formatLocation = (loc) => {
    if (!loc) return "TBD";
    if (typeof loc === "string") {
      const trimmed = loc.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("["))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const first = parsed[0];
            if (first && (first.name || first.label)) return first.name || first.label;
            return String(parsed[0]);
          }
          if (parsed && (parsed.name || parsed.label)) return parsed.name || parsed.label;
        } catch (e) {
          // ignore
        }
      }
      if (trimmed.length === 0) return "TBD";
      return trimmed;
    }
    return String(loc);
  };

  const handleEventClick = (eventId) => {
    navigate(`/user/events/browse`);
  };

  return (
    <div className="advanced-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {username}! 👋</h1>
            <p className="subtitle">Here's what's happening with your events</p>
          </div>
          <div className="user-actions">
            <button 
              className="icon-btn notification-btn" 
              onClick={() => navigate("/user/community/notifications")}
              aria-label="Notifications"
            >
              <FiBell />
              {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
            </button>
            <button 
              className="user-avatar" 
              onClick={() => navigate("/user/profile")}
              aria-label="Profile"
            >
              <FiUser />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="stats-section">
        <h2 className="section-title">Your Overview</h2>
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate("/user/events/my-events")}>
            <div className="stat-icon events-icon">
              <FiCalendar />
            </div>
            <div className="stat-content">
              <h3>{joinedCount}</h3>
              <p>Joined Events</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate("/user/events/upcoming")}>
            <div className="stat-icon upcoming-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <h3>{upcomingCount}</h3>
              <p>Upcoming Events</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate("/user/events/saved")}>
            <div className="stat-icon saved-icon">
              <FiHeart />
            </div>
            <div className="stat-content">
              <h3>{savedEvents.length}</h3>
              <p>Saved Events</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate("/user/badges")}>
            <div className="stat-icon badges-icon">
              <FiAward />
            </div>
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
              onClick={() => navigate("/user/events/upcoming")}
            >
              View All →
            </button>
          </div>

          <div className="event-scroll-container">
            {recentUpcomingEvents.map((event) => (
              <div 
                key={event.event_id} 
                className="event-card"
                onClick={() => handleEventClick(event.event_id)}
              >
                <div className="event-image-container">
                  <img
                    src={event.image || "https://source.unsplash.com/400x250/?event"}
                    alt={event.title}
                  />
                  <span className="status-badge upcoming">Upcoming</span>
                </div>
                <div className="event-details">
                  <div className="event-meta">
                    <span className="meta-date">
                      <FiCalendar size={14} />
                      {formatDateTime(event.start_time)}
                    </span>
                    <span className="meta-category">{event.category}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p className="event-location">{formatLocation(event.location)}</p>
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
            onClick={() => navigate("/user/events/browse")}
          >
            View All →
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No Events Available</h3>
            <p>There are currently no events to display. Check back later or browse all events!</p>
            <button 
              className="view-all-btn" 
              onClick={() => navigate("/user/events/browse")}
              style={{ marginTop: "1rem" }}
            >
              Browse All Events
            </button>
          </div>
        ) : (
          <div className="event-scroll-container">
            {filteredEvents.slice(0, 6).map((event) => (
              <div 
                key={event.event_id} 
                className="event-card"
                onClick={() => handleEventClick(event.event_id)}
              >
                <div className="event-image-container">
                  <img
                    src={event.image || "https://source.unsplash.com/400x250/?event"}
                    alt={event.title}
                  />
                </div>
                <div className="event-details">
                  <div className="event-meta">
                    <span className="meta-date">
                      <FiCalendar size={14} />
                      {formatDateTime(event.start_time)}
                    </span>
                    <span className="meta-category">{event.category}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p className="event-location">{formatLocation(event.location)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
