import React, { useEffect, useMemo, useState } from "react";
import { FiEye, FiX } from "react-icons/fi";
import "./AdminEventsList.css";
import API from "../../api";

export default function RejectedEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        // Rejected drafts submitted by this admin (token attached by API)
        const resp = await API.get("/drafts/mine", { params: { status: "rejected", limit: 50 } });
        const rows = Array.isArray(resp.data) ? resp.data : [];
        if (!alive) return;
        const mapped = rows.map((r) => ({
          id: r.draft_id,
          name: r.title,
          category: r.category_name || r.category_id || "",
          date: r.submitted_at || r.end_time || r.start_time,
          status: (r.status || "").charAt(0).toUpperCase() + (r.status || "").slice(1),
          reason: r.review_notes || "",
          raw: r,
        }));
        setItems(mapped);
      } catch (e) {
        console.error("Failed to load rejected events:", e);
        setError(e?.response?.data?.message || "Failed to load rejected events");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Default: newest first by date
  const filtered = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [items]);

  return (
    <div className="admin-events-table-page">
      <header className="aelp-header">
        <h1 className="aelp-title">Rejected Events</h1>
        <p className="aelp-desc">Events that were not approved with reasons.</p>
      </header>

      {/* Search removed as requested */}

      {/* Full-width responsive grid replacing the table */}
      {loading ? (
        <div className="empty">Loading rejected events…</div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty">No rejected events</div>
      ) : (
        <div className="aelp-grid">
          {filtered.map((e) => (
            <div className="aelp-card" key={e.id}>
              <div className="aelp-card__head">
                <span className={`pill status ${e.status.toLowerCase()}`}>{e.status}</span>
              </div>
              <div className="aelp-card__body">
                <h3 className="aelp-card__title">{e.name}</h3>
                <div className="aelp-card__meta">
                  <span className="meta"><strong>ID:</strong> {e.id}</span>
                  <span className="meta"><strong>Category:</strong> {e.category}</span>
                  <span className="meta"><strong>Date:</strong> {e.date ? new Date(e.date).toLocaleDateString() : "-"}</span>
                  <span className="meta"><strong>Reason:</strong> {e.reason || <em>Not provided</em>}</span>
                </div>
              </div>
              <div className="aelp-card__actions">
                <button className="btn" title="View details" onClick={() => setView(e)}><FiEye /> View</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {view && (
        <div className="events-modal" onClick={() => setView(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{view.name}</h3>
              <button className="modal-close" onClick={() => setView(null)} aria-label="Close"><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="modal-row"><span className="muted">Category</span><span>{view.category}</span></div>
              <div className="modal-row"><span className="muted">Date</span><span>{view.date ? new Date(view.date).toLocaleDateString() : "-"}</span></div>
              <div className="modal-row"><span className="muted">Status</span><span className={`pill status ${view.status.toLowerCase()}`}>{view.status}</span></div>
              <div className="modal-row"><span className="muted">Reason</span><span>{view.reason || <em>Not provided</em>}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
