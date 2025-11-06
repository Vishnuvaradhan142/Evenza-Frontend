import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiCheckCircle, FiXCircle, FiMessageSquare, FiDownload } from "react-icons/fi";
import API from "../../api";
import "./PublicReviews.css";

const SAMPLE_REVIEWS = [
  { id: 1, event: "Autumn Innovators Summit", user: "Jane Doe", rating: 5, text: "Fantastic event, well organised!", status: "pending", created_at: "2025-10-11", reply: null },
  { id: 2, event: "React Conf - Mini", user: "Tom Lee", rating: 4, text: "Great talks but venue was noisy.", status: "approved", created_at: "2025-09-22", reply: "Thanks Tom — we'll improve venue acoustics." },
  { id: 3, event: "Startup Pitch Night", user: "Ali Khan", rating: 2, text: "Not enough networking time.", status: "rejected", created_at: "2025-10-06", reply: null, reject_reason: "Low quality: spam" },
  { id: 4, event: "Design Workshop", user: "Emily R.", rating: 5, text: "Hands-on and useful.", status: "pending", created_at: "2025-10-01", reply: null },
];

const LOCAL_KEY = "publicReviews";

const PublicReviews = () => {
  const [reviews, setReviews] = useState(() => {
    const s = localStorage.getItem(LOCAL_KEY);
    return s ? JSON.parse(s) : SAMPLE_REVIEWS;
  });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null); // id being moderated
  const [replyText, setReplyText] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (q && !`${r.user} ${r.text} ${r.event}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [reviews, q, filter]);

  const doApprove = async (id) => {
    // call API if available
    try {
      await API.post(`/reviews/${id}/approve`).catch(() => null);
    } catch (err) {}
    setReviews((s) => s.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
  };

  const doReject = async (id) => {
    if (!rejectReason.trim()) return alert("Please enter a reject reason");
    try { await API.post(`/reviews/${id}/reject`, { reason: rejectReason }).catch(() => null); } catch (err) {}
    setReviews((s) => s.map((r) => (r.id === id ? { ...r, status: "rejected", reject_reason: rejectReason } : r)));
    setRejectReason("");
    setActive(null);
  };

  const doReply = async (id) => {
    if (!replyText.trim()) return alert("Please enter a reply");
    try { await API.post(`/reviews/${id}/reply`, { reply: replyText }).catch(() => null); } catch (err) {}
    setReviews((s) => s.map((r) => (r.id === id ? { ...r, reply: replyText, status: r.status === 'pending' ? 'approved' : r.status } : r)));
    setReplyText("");
    setActive(null);
  };

  const exportCSV = () => {
    const header = ["id", "event", "user", "rating", "text", "status", "created_at", "reply", "reject_reason"].join(",");
    const rows = reviews.map((r) => [r.id, `"${r.event.replace(/"/g, '""') }"`, `"${r.user}"`, r.rating, `"${r.text.replace(/"/g,'""') }"`, r.status, r.created_at, `"${(r.reply||"").replace(/"/g,'""')}"`, `"${(r.reject_reason||"").replace(/"/g,'""')}"`].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `public-reviews-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pr-page">
      <header className="pr-header">
        <div>
          <h2>Public Reviews</h2>
          <p className="muted">Moderate, respond and export user reviews left on events.</p>
        </div>
        <div className="pr-actions">
          <div className="pr-search"><FiSearch /> <input placeholder="Search reviews..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn" onClick={exportCSV}><FiDownload /> Export</button>
        </div>
      </header>

      <div className="pr-list card">
        {filtered.length === 0 && <div className="empty">No reviews to moderate.</div>}
        {filtered.map((r) => (
          <div key={r.id} className={`pr-item ${r.status}`}>
            <div className="left">
              <div className="info">
                <div className="title">{r.event} <span className="muted small">by {r.user}</span></div>
                <div className="text">{r.text}</div>
                <div className="meta muted small">Rating: {r.rating} • {r.created_at} • Status: {r.status}</div>
                {r.reply && <div className="reply">Owner reply: {r.reply}</div>}
                {r.reject_reason && <div className="reject">Reject reason: {r.reject_reason}</div>}
              </div>
            </div>
            <div className="right">
              {r.status !== 'approved' && <button className="btn success" onClick={() => doApprove(r.id)} title="Approve"><FiCheckCircle /></button>}
              {r.status !== 'rejected' && <button className="btn danger" onClick={() => setActive({ action: 'reject', id: r.id })} title="Reject"><FiXCircle /></button>}
              <button className="btn" onClick={() => setActive({ action: 'reply', id: r.id, text: r.reply || '' })} title="Reply"><FiMessageSquare /></button>
            </div>
          </div>
        ))}
      </div>

      {active && active.action === 'reply' && (
        <div className="modal">
          <div className="modal-card">
            <h3>Reply to review</h3>
            <textarea rows={6} value={replyText || active.text} onChange={(e) => setReplyText(e.target.value)} />
            <div className="row">
              <button className="btn" onClick={() => setActive(null)}>Cancel</button>
              <button className="btn primary" onClick={() => doReply(active.id)}>Send Reply</button>
            </div>
          </div>
        </div>
      )}

      {active && active.action === 'reject' && (
        <div className="modal">
          <div className="modal-card">
            <h3>Reject review</h3>
            <p>Provide a reason for rejecting this review (shown to owner/audit).</p>
            <input placeholder="Reject reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <div className="row">
              <button className="btn" onClick={() => setActive(null)}>Cancel</button>
              <button className="btn danger" onClick={() => doReject(active.id)}>Reject</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicReviews;

