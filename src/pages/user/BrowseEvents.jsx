// BrowseEvents.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./BrowseEvents.css";
import EventDetailsModal from "../../components/user/EventDetailsModal";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch events from backend
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE}/events`, { signal: controller.signal })
      .then((res) => {
        setEvents(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // Build category list
  const categories = useMemo(() => {
    const s = new Set();
    events.forEach((ev) => {
      if (ev.category) s.add(ev.category);
      if (Array.isArray(ev.tags)) ev.tags.forEach((t) => s.add(t));
    });
    return ["", ...Array.from(s).sort()];
  }, [events]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let result = [...events];
    const term = (searchTerm || "").trim().toLowerCase();

    // Search
    if (term) {
      result = result.filter((ev) => {
        const title = (ev.title || "").toLowerCase();
        const description = (ev.description || "").toLowerCase();
        return title.includes(term) || description.includes(term);
      });
    }

    // Category filter
    if (category) {
      result = result.filter((ev) => {
        if (Array.isArray(ev.tags) && ev.tags.length) return ev.tags.includes(category);
        if (ev.category) return ev.category === category;
        return false;
      });
    }

    // Date filter (✅ FIX: use start_time instead of date)
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter((ev) => {
        if (!ev.start_time) return false;
        const eventDate = new Date(ev.start_time);

        switch (dateFilter) {
          case "today":
            return eventDate.toDateString() === now.toDateString();
          case "week":
            const weekFromNow = new Date(now);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate >= now && eventDate <= weekFromNow;
          case "month":
            const monthFromNow = new Date(now);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return eventDate >= now && eventDate <= monthFromNow;
          case "upcoming":
            return eventDate >= now;
          case "past":
            return eventDate < now;
          default:
            return true;
        }
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.start_time || 0) - new Date(b.start_time || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "popularity":
          return (b.attendees_count || 0) - (a.attendees_count || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [events, searchTerm, category, dateFilter, sortBy]);

  // Helpers
  const getImageForEvent = useCallback((ev) => {
    if (ev.image_path) return ev.image_path;
    if (ev.image) return ev.image;
    const keyword = encodeURIComponent(ev.category || ev.title || "event");
    return `https://source.unsplash.com/600x400/?${keyword}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Date TBA";
    const options = { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  const handleRegister = useCallback((eventId, e) => {
    if (e) e.stopPropagation();
      const event = events.find(ev => (ev.event_id || ev.id) === eventId);
      if (event) {
        setSelectedEvent(event);
        setIsModalOpen(true);
      }
    }, [events]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCategory("");
    setDateFilter("all");
    setSortBy("date");
  }, []);

  if (error) {
    return (
      <div className="browse-events">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>{error}</h3>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-events de-container">
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      
      <div className="de-inner">
        <div className="browse-header de-header">
          <div className="header-content">
            <div className="header-title-container">
              <h1 className="header-title de-title">Discover Events</h1>
              <div className="title-underline"></div>
            </div>

            {/* Grid/List toggle */}
            <div className="view-toggle" aria-hidden>
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <span className="icon-grid">◼◼<br />◼◼</span>
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <span className="icon-list">≡<br />≡</span>
              </button>
            </div>
          </div>
          <p className="header-subtitle de-subtitle">
            Find and register for events that match your interests
          </p>
        </div>

        {/* Controls / Filters */}
        <div className="filters-container de-controls">
          <div className="de-search search-container">
            <span className="de-search-icon search-icon">🔍</span>
            <input
              aria-label="Search events"
              className="search-input de-input"
              placeholder="Search events by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group de-chips">
            <select
              aria-label="Filter by category"
              className="filter-select de-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by date"
              className="filter-select de-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Events</option>
            </select>

            <select
              aria-label="Sort by"
              className="filter-select de-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="popularity">Sort by Popularity</option>
            </select>

            <button
              className="clear-filters-btn de-cta"
              onClick={clearFilters}
              disabled={!searchTerm && !category && dateFilter === "all"}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="results-info" style={{ margin: "16px 0" }}>
          <p>
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
            {(searchTerm || category || dateFilter !== "all") && " with current filters"}
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state de-empty">
            <div className="empty-icon">📅</div>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters to find more events.</p>
            <button className="clear-filters-btn de-cta" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`events-container ${viewMode}-view de-grid`}>
            {filteredEvents.map((ev) => {
              const id = ev.event_id ?? ev.id;

              return (
                <article
                  className="event-card de-card"
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRegister(id)}
                >
                  <div className="event-media de-media">
                    <img
                      src={getImageForEvent(ev)}
                      alt={ev.title || "Event"}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(ev.category || ev.title || "event")}`;
                      }}
                    />
                    {ev.attendees_count > 0 && (
                      <div className="event-popularity de-badge hot">
                        <span className="popularity-icon">👥</span>
                        <span>{ev.attendees_count} attending</span>
                      </div>
                    )}

                    <button
                      className={`de-wish`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // quick local toggle (non-persistent)
                        e.currentTarget.classList.toggle("active");
                      }}
                      aria-label="Save event"
                    >
                      ♥
                    </button>
                  </div>

                  <div className="event-info de-body">
                    <h3 className="event-title de-title-sm">{ev.title}</h3>
                    
                    <div className="event-details-info">
                      <div className="event-date de-meta item">
                        <span className="detail-icon">📅</span>
                        {formatDate(ev.start_time)}
                      </div>
                    </div>
                  </div>

                  <div className="de-footer">
                    <div className="de-price">{ev.price ? `₹${ev.price}` : "Free"}</div>
                    <button
                      className="de-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(id, e);
                      }}
                    >
                      View details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseEvents;
