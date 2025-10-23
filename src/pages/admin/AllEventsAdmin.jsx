import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiEye, FiSend, FiX } from "react-icons/fi";
import "./AdminEventsList.css";

const MOCK_EVENTS = [
  { id: "E-101", name: "Tech Conference 2025", category: "Technology", date: "2025-03-15", status: "Approved", createdBy: "Priya" },
  { id: "E-102", name: "Art Exhibition Opening", category: "Arts & Culture", date: "2025-04-10", status: "Pending", createdBy: "Manoj" },
  { id: "E-103", name: "Business Workshop Series", category: "Business", date: "2025-05-20", status: "Draft", createdBy: "Aisha" },
  { id: "E-104", name: "Design Sprint", category: "Design", date: "2025-02-12", status: "Rejected", createdBy: "Rahul" },
  { id: "E-105", name: "TechFest Hackathon", category: "Technology", date: "2025-01-25", status: "Approved", createdBy: "Karan" },
];

export default function AllEventsAdmin() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = MOCK_EVENTS.filter((e) =>
      [e.name, e.category, e.createdBy, e.id].some((f) => f.toLowerCase().includes(q))
    );
    // Default sort: newest first by date
    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    return rows;
  }, [query]);

  // Sorting controls removed; using fixed date-desc order in the memo above.

  return (
    <div className="admin-events-table-page">
      <header className="aelp-header">
        <h1 className="aelp-title">All Events</h1>
        <p className="aelp-desc">Browse and manage events across all statuses.</p>
      </header>

      <div className="aelp-toolbar">
        <div className="aelp-search">
          <FiSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, owner or ID"
          />
        </div>
        {/* status filter removed as requested */}
        <div className="aelp-actions">
          <Link to="/admin/management/event-submission" className="btn primary">
            <FiSend /> Go to Event Submission
          </Link>
        </div>
      </div>

      {/* Full-width responsive grid replacing the table */}
      {filtered.length === 0 ? (
        <div className="empty">No events found</div>
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
                  <span className="meta"><strong>Category:</strong> {e.category}</span>
                  <span className="meta"><strong>Date:</strong> {new Date(e.date).toLocaleDateString()}</span>
                  <span className="meta"><strong>Owner:</strong> {e.createdBy}</span>
                </div>
              </div>
              <div className="aelp-card__actions">
                <button className="btn" title="View details" onClick={() => setView(e)}><FiEye /> View</button>
                <Link to="/admin/management/event-submission" className="btn primary" title="Submit"><FiSend /> Submit</Link>
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
              <div className="modal-row"><span className="muted">Created By</span><span>{view.createdBy}</span></div>
            </div>
            <div className="modal-actions">
              <Link to="/admin/management/event-submission" className="btn primary"><FiSend /> Go to Event Submission</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
