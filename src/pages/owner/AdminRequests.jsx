import React, { useState, useMemo } from "react";
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
import "./AdminRequests.css";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  type,
  reason,
  setReason,
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
          {type === "reject" && (
            <div className="reject-reason-block">
              <label htmlFor="reject-reason">Reason (required)</label>
              <textarea
                id="reject-reason"
                className="reject-reason-textarea"
                placeholder="Provide a clear reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>
        <div className="confirm-footer">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className={type === "reject" ? "btn-reject" : "btn-approve"}
            onClick={onConfirm}
            disabled={type === "reject" && !reason.trim()}
            title={type === "reject" && !reason.trim() ? "Reason required" : ""}
          >
            {type === "reject" ? <FiXCircle /> : <FiCheck />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      status: "pending",
      submittedAt: "2025-10-06T09:15:00Z",
      banner: "https://via.placeholder.com/640x280.png?text=Tech+Conference+2025",
      title: "Tech Conference 2025",
      capacity: 500,
      date: "2025-10-15",
      startTime: "10:00 AM",
      endTime: "6:00 PM",
      category: "Technology",
      description: "Conference exploring the latest innovations in AI & ML.",
      location: "Hyderabad Convention Center",
      ticketTypes: [
        { type: "General", cost: "₹500" },
        { type: "VIP", cost: "₹1500" },
      ],
      agenda: [
        { sessionTitle: "AI in Healthcare", start: "10:30 AM", end: "12:00 PM", description: "Applications of AI in healthcare." },
        { sessionTitle: "ML Workshop", start: "1:30 PM", end: "3:00 PM", description: "Hands-on for beginners." },
      ],
      creator: { id: "USR123", name: "Alice Johnson", email: "alice@example.com" },
    },
    {
      id: 2,
      status: "pending",
      submittedAt: "2025-10-07T11:45:00Z",
      banner: "https://via.placeholder.com/640x280.png?text=Summer+Music+Fest",
      title: "Summer Music Fest",
      capacity: 300,
      date: "2025-11-20",
      startTime: "4:00 PM",
      endTime: "11:00 PM",
      category: "Entertainment",
      description: "Music festival with live performances.",
      location: "Goa Beach Arena",
      ticketTypes: [
        { type: "General", cost: "₹800" },
        { type: "VIP", cost: "₹2500" },
        { type: "VVIP", cost: "₹5000" },
      ],
      agenda: [
        { sessionTitle: "Opening Act", start: "4:30 PM", end: "5:30 PM", description: "Local bands." },
        { sessionTitle: "Main Performance", start: "7:00 PM", end: "10:00 PM", description: "Headline artists." },
      ],
      creator: { id: "USR456", name: "Bob Smith", email: "bob@example.com" },
    },
  ]);

  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, reason: "" });
  const [toast, setToast] = useState(null);

  const stats = useMemo(() => {
    const s = { pending: 0, approved: 0, rejected: 0 };
    requests.forEach(r => s[r.status]++);
    return s;
  }, [requests]);

  const openDetails = (req) => {
    setSelected(req);
    setDetailOpen(true);
  };
  const closeDetails = () => {
    setDetailOpen(false);
    setSelected(null);
  };

  const askAction = (type) => {
    setConfirmDialog({ open: true, type, reason: "" });
  };
  const closeConfirm = () => setConfirmDialog({ open: false, type: null, reason: "" });

  const applyAction = () => {
    if (!selected) return;
    setRequests(prev =>
      prev.map(r =>
        r.id === selected.id
          ? {
              ...r,
              status: confirmDialog.type === "approve" ? "approved" : "rejected",
              rejectionReason: confirmDialog.type === "reject" ? confirmDialog.reason.trim() : r.rejectionReason,
            }
          : r
      )
    );
    closeConfirm();
    closeDetails();
    setToast({
      id: Date.now(),
      message:
        confirmDialog.type === "approve"
          ? "Event approved successfully."
          : "Event rejected.",
      tone: confirmDialog.type === "approve" ? "success" : "danger",
    });
    setTimeout(() => setToast(null), 3000);
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
          <span className="label">Pending</span>
          <span className="value">{stats.pending}</span>
        </div>
        <div className="stat-box approved">
          <span className="label">Approved</span>
          <span className="value">{stats.approved}</span>
        </div>
        <div className="stat-box rejected">
          <span className="label">Rejected</span>
          <span className="value">{stats.rejected}</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Title</th>
              <th>Creator</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="no-rows">No requests</td>
              </tr>
            )}
            {requests.map(r => (
              <tr key={r.id} className="row-clickable" onClick={() => openDetails(r)}>
                <td>
                  <div>{new Date(r.submittedAt).toLocaleDateString()}</div>
                  <small className="muted">{new Date(r.submittedAt).toLocaleTimeString()}</small>
                </td>
                <td>
                  <div className="title">{r.title}</div>
                  <div className="meta">
                    <FiMapPin size={12} /> {r.location}
                  </div>
                </td>
                <td>
                  <div>{r.creator.name}</div>
                  <small className="muted">{r.creator.id}</small>
                </td>
                <td>
                  <span className="badge">{r.category}</span>
                </td>
                <td>
                  <span className={`status-badge ${r.status}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailOpen && selected && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiCalendar /> {selected.title}</h3>
              <button className="close-btn" onClick={closeDetails}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="banner">
                <img src={selected.banner} alt={selected.title} />
              </div>

              <section className="info-grid">
                <div className="info-item">
                  <FiUser />
                  <div>
                    <label>Creator</label>
                    <span>{selected.creator.name} ({selected.creator.id})</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiCalendar />
                  <div>
                    <label>Date</label>
                    <span>{selected.date}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiClock />
                  <div>
                    <label>Time</label>
                    <span>{selected.startTime} - {selected.endTime}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiMapPin />
                  <div>
                    <label>Location</label>
                    <span>{selected.location}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiUsers />
                  <div>
                    <label>Capacity</label>
                    <span>{selected.capacity}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div>
                    <label>Category</label>
                    <span className="badge">{selected.category}</span>
                  </div>
                </div>
              </section>

              <section>
                <h4>Description</h4>
                <p className="description">{selected.description}</p>
              </section>

              <section>
                <h4>Ticket Types</h4>
                <div className="tickets">
                  {selected.ticketTypes.map((t, i) => (
                    <div key={i} className="ticket-chip">
                      <span>{t.type}</span>
                      <strong>{t.cost}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4>Agenda</h4>
                <div className="agenda">
                  {selected.agenda.map((s, i) => (
                    <div key={i} className="agenda-row">
                      <div className="time">{s.start} - {s.end}</div>
                      <div className="details">
                        <strong>{s.sessionTitle}</strong>
                        <p>{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="submission">
                <h4>Submission</h4>
                <div className="sub-grid">
                  <div>
                    <label>Submitted</label>
                    <span>
                      {new Date(selected.submittedAt).toLocaleDateString()}{" "}
                      {new Date(selected.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    <label>Email</label>
                    <span>{selected.creator.email}</span>
                  </div>
                  <div>
                    <label>Status</label>
                    <span className={`status-badge ${selected.status}`}>{selected.status}</span>
                  </div>
                  {selected.status === "rejected" && selected.rejectionReason && (
                    <div className="rejection-reason-view">
                      <label>Reason</label>
                      <span>{selected.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeDetails}>Close</button>
              {selected.status === "pending" && (
                <div className="action-buttons">
                  <button className="btn-reject" onClick={() => askAction("reject")}><FiXCircle /> Reject</button>
                  <button className="btn-approve" onClick={() => askAction("approve")}><FiCheck /> Approve</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        type={confirmDialog.type}
        title={confirmDialog.type === "reject" ? "Reject Event" : "Approve Event"}
        message={
          confirmDialog.type === "reject"
            ? "Provide a reason and confirm rejection."
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