import React, { useMemo, useState } from "react";
import { FiEye, FiX } from "react-icons/fi";
import "./AdminEventsList.css";

const MOCK_REJECTED = [
  { id: "E-104", name: "Design Sprint", category: "Design", date: "2025-02-12", status: "Rejected", reason: "Incomplete documents", reviewedBy: "QA Team" },
  { id: "E-110", name: "Music Night", category: "Entertainment", date: "2025-03-02", status: "Rejected", reason: "Venue conflict", reviewedBy: "Admin" },
];

export default function RejectedEvents() {
  const [view, setView] = useState(null);

  // Default: newest first by date, no search bar
  const filtered = useMemo(() => {
    return [...MOCK_REJECTED].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  return (
    <div className="admin-events-table-page">
      <header className="aelp-header">
        <h1 className="aelp-title">Rejected Events</h1>
        <p className="aelp-desc">Events that were not approved with reasons.</p>
      </header>

      {/* Search removed as requested */}

      {/* Full-width responsive grid replacing the table */}
      {filtered.length === 0 ? (
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
                  <span className="meta"><strong>Date:</strong> {new Date(e.date).toLocaleDateString()}</span>
                  <span className="meta"><strong>Reviewed By:</strong> {e.reviewedBy}</span>
                  <span className="meta"><strong>Reason:</strong> {e.reason}</span>
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
              <div className="modal-row"><span className="muted">Date</span><span>{new Date(view.date).toLocaleDateString()}</span></div>
              <div className="modal-row"><span className="muted">Status</span><span className={`pill status ${view.status.toLowerCase()}`}>{view.status}</span></div>
              <div className="modal-row"><span className="muted">Reviewed By</span><span>{view.reviewedBy}</span></div>
              <div className="modal-row"><span className="muted">Reason</span><span>{view.reason}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
