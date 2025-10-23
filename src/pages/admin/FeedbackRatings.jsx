import React, { useState, useEffect, useMemo } from "react";
import {
  FiStar,
  FiUser,
  FiCalendar,
  FiMessageSquare,
  FiTrendingUp,
  FiTrendingDown,
  FiFilter,
  FiSearch,
  FiEye,
  FiThumbsUp,
  FiBarChart2, // Changed from FiBarChart3 to FiBarChart2
  FiRefreshCw
} from "react-icons/fi";
import "./FeedbackRatings.css";

const RATING_COLORS = {
  1: "#ef4444", // red
  2: "#f97316", // orange  
  3: "#eab308", // yellow
  4: "#22c55e", // green
  5: "#16a34a", // dark green
};

const FeedbackRatings = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRating, setFilterRating] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // list or cards

  // Generate dummy feedback data
  const generateDummyData = () => {
    const events = [
      "Tech Conference 2024", "Music Festival", "Art Workshop", 
      "Business Summit", "Food Fair", "Gaming Tournament",
      "Fashion Show", "Book Club Meeting", "Fitness Bootcamp"
    ];
    
    const users = [
      "Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson",
      "Emma Brown", "Frank Miller", "Grace Lee", "Henry Taylor"
    ];

    const comments = [
      "Amazing event! Great organization and speakers.",
      "The venue was perfect and the food was excellent.",
      "Could have been better organized, but overall good.",
      "Not what I expected. The schedule was confusing.",
      "Fantastic experience! Will definitely attend next time.",
      "Good content but the audio quality was poor.",
      "Well organized event with great networking opportunities.",
      "The event exceeded my expectations in every way.",
      "Some technical issues but the content was valuable.",
      "Perfect event! Everything was on time and well planned."
    ];

    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      event_name: events[Math.floor(Math.random() * events.length)],
      event_id: Math.floor(Math.random() * 20) + 1,
      user_name: users[Math.floor(Math.random() * users.length)],
      user_id: Math.floor(Math.random() * 100) + 1,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: Math.random() > 0.3 ? comments[Math.floor(Math.random() * comments.length)] : "",
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      helpful_votes: Math.floor(Math.random() * 15),
      verified_attendee: Math.random() > 0.2,
      response_needed: Math.random() > 0.8,
      admin_response: Math.random() > 0.7 ? "Thank you for your feedback!" : null,
    }));
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFeedbacks(generateDummyData());
      setLoading(false);
    }, 500);
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setFeedbacks(generateDummyData());
      setLoading(false);
    }, 300);
  };

  // Filter and sort feedbacks
  const processedFeedbacks = useMemo(() => {
    let filtered = feedbacks.filter(feedback => {
      const matchesRating = filterRating === "all" || feedback.rating === parseInt(filterRating);
      const matchesEvent = filterEvent === "all" || feedback.event_name === filterEvent;
      const matchesSearch = !searchTerm || 
        feedback.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesRating && matchesEvent && matchesSearch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "most_helpful":
          return b.helpful_votes - a.helpful_votes;
        default:
          return 0;
      }
    });

    return filtered;
  }, [feedbacks, filterRating, filterEvent, searchTerm, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (feedbacks.length === 0) return {};

    const totalRatings = feedbacks.length;
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings;
    const ratingDistribution = feedbacks.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, {});

    const needsResponse = feedbacks.filter(f => f.response_needed && !f.admin_response).length;
    const withComments = feedbacks.filter(f => f.comment.trim()).length;

    return {
      totalRatings,
      averageRating,
      ratingDistribution,
      needsResponse,
      withComments,
      responseRate: ((totalRatings - needsResponse) / totalRatings * 100).toFixed(1)
    };
  }, [feedbacks]);

  const uniqueEvents = [...new Set(feedbacks.map(f => f.event_name))].sort();

  const StarRating = ({ rating, size = "sm" }) => {
    const starSize = size === "lg" ? "w-6 h-6" : "w-4 h-4";
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className={`ml-2 font-medium ${size === "lg" ? "text-lg" : "text-sm"}`}>
          {rating}
        </span>
      </div>
    );
  };

  return (
    <div className="feedback-ratings-container">
      {/* Header */}
      <div className="fr-header">
        <div>
          <h1 className="fr-title">Feedback & Ratings</h1>
          <p className="fr-subtitle">Monitor and manage event feedback and ratings</p>
        </div>
        <div className="fr-header-actions">
          <button className="btn ghost" onClick={refreshData} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button className="btn ghost" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Filters
          </button>
          <div className="view-toggle">
            <button 
              className={`btn tiny ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
            <button 
              className={`btn tiny ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="fr-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiBarChart2 /> {/* Changed from FiBarChart3 to FiBarChart2 */}
          </div>
          <div>
            <span className="stat-label">Total Ratings</span>
            <span className="stat-value">{stats.totalRatings || 0}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon rating">
            <FiStar />
          </div>
          <div>
            <span className="stat-label">Average Rating</span>
            <span className="stat-value">{stats.averageRating?.toFixed(1) || "0.0"}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon comments">
            <FiMessageSquare />
          </div>
          <div>
            <span className="stat-label">With Comments</span>
            <span className="stat-value">{stats.withComments || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon response">
            <FiTrendingUp />
          </div>
          <div>
            <span className="stat-label">Response Rate</span>
            <span className="stat-value">{stats.responseRate || "0"}%</span>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon needs-response">
            <FiTrendingDown />
          </div>
          <div>
            <span className="stat-label">Needs Response</span>
            <span className="stat-value">{stats.needsResponse || 0}</span>
          </div>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      {stats.ratingDistribution && (
        <div className="rating-distribution">
          <h3 className="chart-title">Rating Distribution</h3>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar-row">
                <span className="rating-label">{rating} ⭐</span>
                <div className="rating-bar-container">
                  <div 
                    className="rating-bar"
                    style={{
                      width: `${((stats.ratingDistribution[rating] || 0) / stats.totalRatings) * 100}%`,
                      backgroundColor: RATING_COLORS[rating]
                    }}
                  />
                </div>
                <span className="rating-count">{stats.ratingDistribution[rating] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="fr-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Rating</label>
              <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Event</label>
              <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
                <option value="all">All Events</option>
                {uniqueEvents.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="most_helpful">Most Helpful</option>
              </select>
            </div>

            <div className="filter-group search-group">
              <label>Search</label>
              <div className="search-wrapper">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search events, users, comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="fr-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading feedback...</p>
          </div>
        ) : processedFeedbacks.length === 0 ? (
          <div className="empty-state">
            <FiMessageSquare className="empty-icon" />
            <h3>No Feedback Found</h3>
            <p>No feedback matches your current filters.</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="feedback-table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Helpful</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedFeedbacks.map(feedback => (
                  <tr key={feedback.id} className={feedback.response_needed && !feedback.admin_response ? "needs-response" : ""}>
                    <td className="event-cell">
                      <span className="event-name">{feedback.event_name}</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-info">
                        <span className="user-name">{feedback.user_name}</span>
                        {feedback.verified_attendee && (
                          <span className="verified-badge">✓</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StarRating rating={feedback.rating} />
                    </td>
                    <td className="comment-cell">
                      <span className="comment-preview">
                        {feedback.comment || <em>No comment</em>}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </td>
                    <td className="helpful-cell">
                      <div className="helpful-votes">
                        <FiThumbsUp className="helpful-icon" />
                        {feedback.helpful_votes}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn tiny"
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="feedback-cards-grid">
            {processedFeedbacks.map(feedback => (
              <div key={feedback.id} className={`feedback-card ${feedback.response_needed && !feedback.admin_response ? "needs-response" : ""}`}>
                <div className="card-header">
                  <div className="event-info">
                    <h4 className="event-name">{feedback.event_name}</h4>
                    <div className="user-info">
                      <FiUser className="user-icon" />
                      <span>{feedback.user_name}</span>
                      {feedback.verified_attendee && (
                        <span className="verified-badge">✓</span>
                      )}
                    </div>
                  </div>
                  <StarRating rating={feedback.rating} size="lg" />
                </div>
                
                {feedback.comment && (
                  <div className="card-comment">
                    <p>{feedback.comment}</p>
                  </div>
                )}
                
                <div className="card-footer">
                  <div className="card-meta">
                    <span className="date">
                      <FiCalendar />
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </span>
                    <span className="helpful">
                      <FiThumbsUp />
                      {feedback.helpful_votes} helpful
                    </span>
                  </div>
                  <button 
                    className="btn tiny"
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <FiEye /> View Details
                  </button>
                </div>
                
                {feedback.response_needed && !feedback.admin_response && (
                  <div className="response-alert">
                    <FiTrendingDown />
                    Needs Admin Response
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback Details</h2>
              <button className="close-btn" onClick={() => setSelectedFeedback(null)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="feedback-details">
                <div className="detail-row">
                  <span className="detail-label">Event:</span>
                  <span className="detail-value">{selectedFeedback.event_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User:</span>
                  <span className="detail-value">
                    {selectedFeedback.user_name}
                    {selectedFeedback.verified_attendee && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Rating:</span>
                  <StarRating rating={selectedFeedback.rating} size="lg" />
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedFeedback.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Helpful Votes:</span>
                  <span className="detail-value">{selectedFeedback.helpful_votes}</span>
                </div>
              </div>
              
              {selectedFeedback.comment && (
                <div className="comment-section">
                  <h4>Comment:</h4>
                  <div className="comment-text">{selectedFeedback.comment}</div>
                </div>
              )}
              
              {selectedFeedback.admin_response && (
                <div className="admin-response">
                  <h4>Admin Response:</h4>
                  <div className="response-text">{selectedFeedback.admin_response}</div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {selectedFeedback.response_needed && !selectedFeedback.admin_response && (
                <button className="btn primary">
                  Add Response
                </button>
              )}
              <button className="btn secondary" onClick={() => setSelectedFeedback(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="results-info">
        <span>Showing {processedFeedbacks.length} of {feedbacks.length} feedback entries</span>
      </div>
    </div>
  );
};

export default FeedbackRatings;
