import React, { useEffect, useState, useContext } from "react";
import API from "../../api";
import { NotificationContext } from "../../context/NotificationContext";
import "./Reviewing.css";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch (e) {
    return "Unknown";
  }
};

const Reviewing = () => {
  const [events, setEvents] = useState([]); // completed events eligible for review
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({}); // keyed by event_id => { rating, review }
  const [deleting, setDeleting] = useState({});
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const res = await API.get("/reviews"); // backend: GET /api/reviews
        if (!mounted) return;
        const data = res.data || [];
        setEvents(data);

        // initialize form state for existing reviews
        const initial = {};
        (data || []).forEach((ev) => {
          initial[ev.event_id] = { rating: ev.rating || 5, review: ev.review || "" };
        });
        setFormState(initial);
      } catch (err) {
        console.error("Failed to fetch reviewable events:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvents();
    return () => { mounted = false; };
  }, []);

  const handleChange = (eventId, field, value) => {
    setFormState((s) => ({ ...s, [eventId]: { ...(s[eventId] || {}), [field]: value } }));
  };

  const handleSubmit = async (eventId) => {
    const payload = formState[eventId];
    if (!payload || !payload.rating) {
      addNotification && addNotification({ text: "Please provide a rating before submitting", type: "alert" });
      return;
    }
    try {
      await API.post("/reviews", { event_id: eventId, rating: Number(payload.rating), review: payload.review || null });
      addNotification && addNotification({ text: "Review submitted", type: "info" });

      // Update local events list to show submitted rating
      setEvents((prev) => prev.map((ev) => (ev.event_id === eventId ? { ...ev, rating: payload.rating, review: payload.review } : ev)));
    } catch (err) {
      console.error("Failed to submit review:", err);
      addNotification && addNotification({ text: "Failed to submit review", type: "alert" });
    }
  };

  const handleDelete = async (eventId) => {
    setDeleting((d) => ({ ...d, [eventId]: true }));
    try {
      console.debug('Sending DELETE /api/reviews/' + eventId);
      const res = await API.delete(`/reviews/${eventId}`);
      console.debug('Delete response data:', res && res.data);
      addNotification && addNotification({ text: res?.data?.message || "Review deleted", type: "info" });
      // remove rating/review locally
      setEvents((prev) => prev.map((ev) => (ev.event_id === eventId ? { ...ev, rating: null, review: null } : ev)));
      setFormState((s) => ({ ...s, [eventId]: { rating: 5, review: "" } }));
    } catch (err) {
      console.error("Failed to delete review:", err, err?.response?.data);
      const msg = err?.response?.data?.message || err?.message || "Failed to delete review";
      addNotification && addNotification({ text: msg, type: "alert" });
    } finally {
      setDeleting((d) => ({ ...d, [eventId]: false }));
    }
  };

  return (
    <div className="reviewing-page">
      <h1 className="page-title">Community Reviews</h1>
      <p className="page-subtitle">Submit reviews for events you attended. Only completed events are shown here.</p>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="review-grid">
          {events.length ? (
            events.map((ev) => (
              <article className="review-card" key={ev.event_id}>
                <header>
                  <h3 className="reviewer">{ev.title || `Event ${ev.event_id}`}</h3>
                  <div className="review-meta">{formatDate(ev.end_time || ev.start_time)}</div>
                </header>

                {/* Show existing submitted rating/review if present */}
                {ev.rating ? (
                  <div className="existing-review">
                    <div className="rating-display">Your rating: {Array.from({ length: Number(ev.rating) }).map(() => '★').join('')}</div>
                    {ev.review ? <p className="comment">Your review: {ev.review}</p> : null}
                  </div>
                ) : null}

                <div className="review-form">
                  <label>
                    Rating:
                    <select value={(formState[ev.event_id] && formState[ev.event_id].rating) || 5} onChange={(e) => handleChange(ev.event_id, "rating", e.target.value)}>
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Okay</option>
                      <option value={2}>2 - Poor</option>
                      <option value={1}>1 - Terrible</option>
                    </select>
                  </label>

                  <label>
                    Review:
                    <textarea value={(formState[ev.event_id] && formState[ev.event_id].review) || ""} onChange={(e) => handleChange(ev.event_id, "review", e.target.value)} placeholder="Share your experience (optional)" />
                  </label>

                  <div className="form-actions">
                    <button type="button" className="submit-btn" onClick={() => handleSubmit(ev.event_id)}>{ev.rating ? 'Update Review' : 'Submit Review'}</button>
                    {ev.rating ? (
                      <button
                        type="button"
                        className="delete-btn icon-only"
                        onClick={async () => {
                          // confirm before deleting
                          const ok = window.confirm('Delete your review for "' + (ev.title || 'this event') + '"?');
                          if (!ok) return;
                          console.debug('User confirmed delete for event', ev.event_id);
                          await handleDelete(ev.event_id);
                        }}
                        aria-label="Delete review"
                        title="Delete review"
                        disabled={!!deleting[ev.event_id]}
                      >
                        {deleting[ev.event_id] ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.15" />
                            <path d="M4 12a8 8 0 0 0 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-reviews">
              <h3>No completed events to review</h3>
              <p>Once you attend and complete an event, it will appear here for review.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviewing;
