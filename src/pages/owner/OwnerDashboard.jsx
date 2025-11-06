import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import "./OwnerDashboard.css";

const currency = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const sampleEvents = [
  { id: 1, title: "Tech Conference 2025", date: "2025-10-15", status: "Pending", ticketsSold: 280, revenue: 210000, views: 920 },
  { id: 2, title: "Summer Music Fest", date: "2025-11-20", status: "Published", ticketsSold: 310, revenue: 372000, views: 1340 },
  { id: 3, title: "Startup Meetup", date: "2025-10-22", status: "Draft", ticketsSold: 0, revenue: 0, views: 110 },
  { id: 4, title: "Design Workshop", date: "2025-10-19", status: "Published", ticketsSold: 95, revenue: 57000, views: 420 },
  { id: 5, title: "AI Bootcamp", date: "2025-10-25", status: "Pending", ticketsSold: 140, revenue: 98000, views: 680 },
];

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(sampleEvents);
  const [toast, setToast] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  const recent = useMemo(() => {
    return [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [events]);

  const pendingList = useMemo(() => events.filter((e) => e.status === "Pending").slice(0, 6), [events]);

  const flash = (msg, tone = "info") => {
    setToast({ id: Date.now(), msg, tone });
    setTimeout(() => setToast(null), 2800);
  };

  const approve = (id) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Published" } : e)));
    flash("Event approved", "success");
  };

  const askReject = (e) => setConfirmReject(e);
  const doReject = () => {
    if (!confirmReject) return;
    setEvents((prev) => prev.map((e) => (e.id === confirmReject.id ? { ...e, status: "Rejected" } : e)));
    setConfirmReject(null);
    flash("Event rejected", "danger");
  };

  return (
    <div className="owner-dashboard">
      <div className="head-row">
        <div>
          <h1>Owner Dashboard</h1>
          <p className="subtitle">Overview of events, sales, and approvals.</p>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.tone}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss">
            <FiX />
          </button>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Recent Events</h3>
            <span className="count-badge">{recent.length}</span>
          </div>
          <div className="table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Tickets</th>
                  <th>Revenue</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id}>
                    <td className="name-cell">
                      <div className="name">{e.title}</div>
                      <small className="muted">ID #{e.id}</small>
                    </td>
                    <td>{e.date}</td>
                    <td>
                      <span className={`status-badge ${e.status.toLowerCase()}`}>{e.status}</span>
                    </td>
                    <td>{e.ticketsSold}</td>
                    <td>{currency(e.revenue)}</td>
                    <td>{e.views}</td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">
                      No events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Pending Approvals</h3>
            <span className="count-badge">{pendingList.length}</span>
          </div>
          <ul className="approvals-list">
            {pendingList.map((e) => (
              <li key={e.id}>
                <div className="appr-main">
                  <div className="title">{e.title}</div>
                  <div className="meta">
                    <FiClock /> {e.date}
                  </div>
                </div>
                <div className="appr-actions">
                  <button className="btn-approve" onClick={() => approve(e.id)}>
                    <FiCheckCircle /> Approve
                  </button>
                  <button className="btn-reject" onClick={() => askReject(e)}>
                    <FiXCircle /> Reject
                  </button>
                </div>
              </li>
            ))}
            {pendingList.length === 0 && <li className="empty">No pending requests.</li>}
          </ul>
          <button className="link-row" onClick={() => navigate("/owner/controls/requests")}>
            View all approvals <FiChevronRight />
          </button>
        </div>
      </div>

      {confirmReject && (
        <div className="modal-overlay" onClick={() => setConfirmReject(null)}>
          <div className="mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mini-head">
              <h4>Reject Event</h4>
              <button className="close-btn" onClick={() => setConfirmReject(null)}>
                <FiX />
              </button>
            </div>
            <div className="mini-body">
              <p>Reject <strong>{confirmReject.title}</strong> scheduled on {confirmReject.date}?</p>
            </div>
            <div className="mini-foot">
              <button className="btn-light" onClick={() => setConfirmReject(null)}>Cancel</button>
              <button className="btn-danger" onClick={doReject}>
                <FiXCircle /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
