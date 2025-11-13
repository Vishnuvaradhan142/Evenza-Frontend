import React, { useState, useMemo, useEffect } from "react";
import {
  FiX,
  FiCheck,
  FiXCircle,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiClock,
  FiUser,
} from "react-icons/fi";
import API from "../../api";
import "./AdminRequests.css";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  type,
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h4>{title}</h4>
          <button className="close-btn" onClick={onCancel}>
            <FiX />
          </button>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button
            className={type === "reject" ? "btn-reject" : "btn-approve"}
            onClick={onConfirm}
          >
            {type === "reject" ? <FiXCircle /> : <FiCheck />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, reason: "" });
  const [toast, setToast] = useState(null);
  const [reviewMessage, setReviewMessage] = useState("");

  const parseLocations = (locations) => {
    try {
      if (typeof locations === 'string') {
        return JSON.parse(locations);
      }
      return locations || [];
    } catch (e) {
      return [];
    }
  };

  const parseSessions = (sessions) => {
    try {
      if (typeof sessions === 'string') {
        return JSON.parse(sessions);
      }
      return sessions || [];
    } catch (e) {
      return [];
    }
  };

  const parseDocuments = (documents) => {
    try {
      if (typeof documents === 'string') {
        return JSON.parse(documents);
      }
      return documents || [];
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/drafts?status=submitted');
      console.log('Drafts response:', response.data);
      setRequests(response.data || []);
    } catch (err) {
      console.error('Error loading drafts:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const s = { submitted: 0 };
    requests.forEach(r => {
      if (r.status === 'submitted') s.submitted++;
    });
    return s;
  }, [requests]);

  const openDetails = (req) => {
    setSelected(req);
    setDetailOpen(true);
    setReviewMessage(""); // Reset review message
  };
  const closeDetails = () => {
    setDetailOpen(false);
    setSelected(null);
    setReviewMessage(""); // Reset review message
  };

  const askAction = (type) => {
    setConfirmDialog({ open: true, type, reason: "" });
  };
  const closeConfirm = () => setConfirmDialog({ open: false, type: null, reason: "" });

  const applyAction = async () => {
    if (!selected) return;
    
    try {
      if (confirmDialog.type === "approve") {
        const payload = {};
        if (reviewMessage.trim()) {
          payload.review_notes = reviewMessage.trim();
        }
        await API.put(`/drafts/${selected.draft_id}/approve`, payload);
        setToast({
          id: Date.now(),
          message: "Event approved successfully.",
          tone: "success",
        });
      } else {
        if (!reviewMessage.trim()) {
          setToast({
            id: Date.now(),
            message: "Review message is required for rejection.",
            tone: "danger",
          });
          setTimeout(() => setToast(null), 3000);
          return;
        }
        await API.put(`/drafts/${selected.draft_id}/reject`, {
          review_notes: reviewMessage.trim()
        });
        setToast({
          id: Date.now(),
          message: "Event rejected.",
          tone: "danger",
        });
      }
      
      closeConfirm();
      closeDetails();
      fetchDrafts(); // Refresh the list
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Error processing request:', err);
      setToast({
        id: Date.now(),
        message: err.response?.data?.message || 'Failed to process request',
        tone: "danger",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="admin-requests page-shell">
      <div className="page-head">
        <h1>Event Requests</h1>
        <p className="subtitle">Review, approve or reject submitted events.</p>
      </div>

      {toast && (
        <div className={`toast-banner ${toast.tone}`}>
          {toast.message}
          <button onClick={() => setToast(null)} aria-label="Dismiss">
            <FiX />
          </button>
        </div>
      )}

      <div className="request-stats">
        <div className="stat-box">
          <span className="label">Pending Approvals</span>
          <span className="value">{stats.submitted}</span>
        </div>
      </div>

      {loading && <div className="loading-message">Loading requests...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="table-wrap">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Title</th>
              <th>Creator</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={4} className="no-rows">No pending requests</td>
              </tr>
            )}
            {requests.map(r => {
              const locations = parseLocations(r.locations);
              const locationStr = locations && locations[0] ? 
                (locations[0].name || locations[0].address || 'No location') : 'No location';
              
              return (
                <tr key={r.draft_id} className="row-clickable" onClick={() => openDetails(r)}>
                  <td>
                    <div>{new Date(r.submitted_at).toLocaleDateString()}</div>
                    <small className="muted">{new Date(r.submitted_at).toLocaleTimeString()}</small>
                  </td>
                  <td>
                    <div className="title">{r.title}</div>
                    <div className="meta">
                      <FiMapPin size={12} /> {locationStr}
                    </div>
                  </td>
                  <td>
                    <div>{r.submitted_by_name || `User ${r.submitted_by}`}</div>
                    <small className="muted">ID: {r.submitted_by}</small>
                  </td>
                  <td>
                    <div>{r.capacity || 'N/A'}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailOpen && selected && (() => {
        const locations = parseLocations(selected.locations);
        const sessions = parseSessions(selected.sessions);
        const documents = parseDocuments(selected.documents);
        const attachments = selected.attachments || [];
        
        return (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiCalendar /> {selected.title}</h3>
              <button className="close-btn" onClick={closeDetails}><FiX /></button>
            </div>
            <div className="modal-body">
              {attachments.length > 0 && (
                <div className="banner">
                  <img src={attachments[0]} alt={selected.title} />
                </div>
              )}

              <section className="info-grid">
                <div className="info-item">
                  <FiUser />
                  <div>
                    <label>Creator</label>
                    <span>{selected.submitted_by_name || `User ${selected.submitted_by}`} (ID: {selected.submitted_by})</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiCalendar />
                  <div>
                    <label>Start Date</label>
                    <span>{new Date(selected.start_time).toLocaleDateString()} {new Date(selected.start_time).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiClock />
                  <div>
                    <label>End Date</label>
                    <span>{new Date(selected.end_time).toLocaleDateString()} {new Date(selected.end_time).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiUsers />
                  <div>
                    <label>Capacity</label>
                    <span>{selected.capacity || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div>
                    <label>Category ID</label>
                    <span className="badge">{selected.category_id || 'N/A'}</span>
                  </div>
                </div>
              </section>

              <section>
                <h4>Description</h4>
                <p className="description">{selected.description || 'No description provided'}</p>
              </section>

              {locations.length > 0 && (
                <section>
                  <h4>Locations</h4>
                  <div className="tickets">
                    {locations.map((loc, i) => (
                      <div key={i} className="ticket-chip">
                        <FiMapPin />
                        <div>
                          <strong>{loc.name || 'Unnamed Location'}</strong>
                          {loc.address && <p>{loc.address}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {sessions.length > 0 && (
                <section>
                  <h4>Sessions</h4>
                  <div className="agenda">
                    {sessions.map((s, i) => {
                      // Format time - handle both 24h format (17:00) and 12h format
                      const formatTime = (timeStr) => {
                        if (!timeStr) return 'N/A';
                        
                        // If it's already in HH:MM format (e.g., "17:00")
                        if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
                          const [hours, minutes] = timeStr.split(':').map(Number);
                          const period = hours >= 12 ? 'PM' : 'AM';
                          const displayHours = hours % 12 || 12;
                          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                        }
                        
                        // If it's a full datetime string
                        if (timeStr.includes('T') || timeStr.includes(' ')) {
                          try {
                            const date = new Date(timeStr);
                            return date.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            });
                          } catch (e) {
                            return timeStr;
                          }
                        }
                        
                        return timeStr;
                      };
                      
                      return (
                        <div key={i} className="agenda-row">
                          <div className="time">
                            {formatTime(s.start)} - {formatTime(s.end)}
                          </div>
                          <div className="details">
                            <strong>{s.title || 'Session ' + (i + 1)}</strong>
                            {s.desc && <p>{s.desc}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {documents.length > 0 && (
                <section>
                  <h4>Documents</h4>
                  <div className="tickets">
                    {documents.map((doc, i) => (
                      <div key={i} className="ticket-chip">
                        <span>{doc.name || `Document ${i + 1}`}</span>
                        <a href={doc.path} target="_blank" rel="noopener noreferrer">View</a>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="submission">
                <h4>Submission Details</h4>
                <div className="sub-grid">
                  <div>
                    <label>Submitted At</label>
                    <span>
                      {new Date(selected.submitted_at).toLocaleDateString()}{" "}
                      {new Date(selected.submitted_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    <label>Status</label>
                    <span className={`status-badge ${selected.status}`}>{selected.status}</span>
                  </div>
                  {selected.status === "rejected" && selected.review_notes && (
                    <div className="rejection-reason-view">
                      <label>Rejection Reason</label>
                      <span>{selected.review_notes}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="review-section">
                <h4>Review Message</h4>
                <textarea
                  className="review-message-textarea"
                  placeholder="Add a review message or notes (optional for approval, required for rejection)..."
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  rows={4}
                />
                <small className="muted">This message will be visible to the event creator.</small>
              </section>
            </div>
            <div className="modal-footer">
              {selected.status === "submitted" && (
                <div className="action-buttons">
                  <button 
                    className="btn-reject" 
                    onClick={() => askAction("reject")}
                    disabled={!reviewMessage.trim()}
                    title={!reviewMessage.trim() ? "Review message required for rejection" : ""}
                  >
                    <FiXCircle /> Reject
                  </button>
                  <button className="btn-approve" onClick={() => askAction("approve")}>
                    <FiCheck /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      <ConfirmDialog
        open={confirmDialog.open}
        type={confirmDialog.type}
        title={confirmDialog.type === "reject" ? "Reject Event" : "Approve Event"}
        message={
          confirmDialog.type === "reject"
            ? `Are you sure you want to reject this event? Review message: "${reviewMessage}"`
            : reviewMessage.trim() 
              ? `Approve this event with the message: "${reviewMessage}"`
              : "Approve this event and mark it as active?"
        }
        confirmLabel={confirmDialog.type === "reject" ? "Reject" : "Approve"}
        reason={confirmDialog.reason}
        setReason={(reason) => setConfirmDialog(d => ({ ...d, reason }))}
        onCancel={closeConfirm}
        onConfirm={applyAction}
      />
    </div>
  );
};

export default AdminRequests;