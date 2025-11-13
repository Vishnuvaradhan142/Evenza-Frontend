import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import API from "../../api";
import "./OwnerDashboard.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  const flash = useCallback((msg, tone = "info") => {
    setToast({ id: Date.now(), msg, tone });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const response = await API.get('/events');
      const allEvents = response.data || [];
      
      // Filter upcoming events and sort by start_time
      const now = new Date();
      const upcoming = allEvents
        .filter(event => new Date(event.start_time) > now)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, 5);
      
      setUpcomingEvents(upcoming);
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
      flash("Failed to load upcoming events", "danger");
    } finally {
      setEventsLoading(false);
    }
  }, [flash]);

  const fetchPendingDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/drafts?status=submitted');
      setPendingDrafts(response.data || []);
    } catch (err) {
      console.error("Error fetching pending drafts:", err);
      flash("Failed to load pending approvals", "danger");
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    fetchUpcomingEvents();
    fetchPendingDrafts();
  }, [fetchUpcomingEvents, fetchPendingDrafts]);

  const pendingList = useMemo(() => pendingDrafts.slice(0, 6), [pendingDrafts]);

  const approve = async (id) => {
    try {
      await API.put(`/drafts/${id}/approve`);
      flash("Event approved successfully", "success");
      fetchPendingDrafts(); // Refresh the list
    } catch (err) {
      console.error("Error approving event:", err);
      flash(err.response?.data?.message || "Failed to approve event", "danger");
    }
  };

  const askReject = (e) => setConfirmReject(e);
  const doReject = async () => {
    if (!confirmReject) return;
    try {
      await API.put(`/drafts/${confirmReject.draft_id}/reject`, {
        review_notes: "Rejected from dashboard"
      });
      setConfirmReject(null);
      flash("Event rejected successfully", "danger");
      fetchPendingDrafts(); // Refresh the list
    } catch (err) {
      console.error("Error rejecting event:", err);
      flash(err.response?.data?.message || "Failed to reject event", "danger");
      setConfirmReject(null);
    }
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
            <h3>Upcoming Events</h3>
            <span className="count-badge">{upcomingEvents.length}</span>
          </div>
          <div className="table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Creator</th>
                </tr>
              </thead>
              <tbody>
                {eventsLoading ? (
                  <tr>
                    <td colSpan={3} className="empty">
                      Loading events...
                    </td>
                  </tr>
                ) : upcomingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty">
                      No upcoming events.
                    </td>
                  </tr>
                ) : (
                  upcomingEvents.map((e) => (
                    <tr key={e.event_id}>
                      <td className="name-cell">
                        <div className="name">{e.title}</div>
                        <small className="muted">ID #{e.event_id}</small>
                      </td>
                      <td>{new Date(e.start_time).toLocaleDateString()}</td>
                      <td>{e.creator_name || `User ${e.created_by}`}</td>
                    </tr>
                  ))
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
            {loading ? (
              <li className="empty">Loading pending approvals...</li>
            ) : pendingList.length === 0 ? (
              <li className="empty">No pending requests.</li>
            ) : (
              pendingList.map((e) => (
                <li key={e.draft_id}>
                  <div className="appr-main">
                    <div className="title">{e.title}</div>
                    <div className="meta">
                      <FiClock /> {new Date(e.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="appr-actions">
                    <button className="btn-approve" onClick={() => approve(e.draft_id)}>
                      <FiCheckCircle /> Approve
                    </button>
                    <button className="btn-reject" onClick={() => askReject(e)}>
                      <FiXCircle /> Reject
                    </button>
                  </div>
                </li>
              ))
            )}
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
              <p>Reject <strong>{confirmReject.title}</strong> submitted on {new Date(confirmReject.submitted_at).toLocaleDateString()}?</p>
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
