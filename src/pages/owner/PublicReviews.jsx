import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiStar } from "react-icons/fi";
import API from "../../api";
import "./PublicReviews.css";

const PublicReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching all reviews for owner");
      const response = await API.get('/reviews/admin');
      console.log("Reviews response:", response.data);
      setReviews(response.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.response?.data?.message || err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!q) return reviews;
    return reviews.filter((r) => {
      const searchText = `${r.user_display_name} ${r.review} ${r.event_title}`.toLowerCase();
      return searchText.includes(q.toLowerCase());
    });
  }, [reviews, q]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={i < rating ? "star filled" : "star"}
        style={{ color: i < rating ? "#ffc107" : "#ddd" }}
      />
    ));
  };

  return (
    <div className="pr-page">
      <header className="pr-header">
        <div>
          <h2>Public Reviews</h2>
          <p className="muted">View all user reviews for your events.</p>
        </div>
        <div className="pr-actions">
          <div className="pr-search">
            <FiSearch /> 
            <input 
              placeholder="Search reviews..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <div className="pr-list card">
        {loading && <div className="empty">Loading reviews...</div>}
        {error && <div className="empty" style={{color: '#ef4444'}}>{error}</div>}
        {!loading && !error && filtered.length === 0 && <div className="empty">No reviews found.</div>}
        {!loading && !error && filtered.map((r) => (
          <div key={r.review_id} className="pr-item">
            <div className="review-content">
              <div className="review-header">
                <div className="event-title">{r.event_title}</div>
              </div>
              <div className="review-meta">
                <span className="user-name">{r.user_display_name}</span>
                <span className="separator">•</span>
                <span className="review-date">
                  {new Date(r.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="rating-stars">{renderStars(r.rating)}</div>
              {r.review && <div className="review-text">{r.review}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicReviews;

