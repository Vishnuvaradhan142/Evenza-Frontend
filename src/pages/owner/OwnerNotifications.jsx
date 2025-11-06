import React, { useMemo, useState } from "react";
import { FiBell, FiSend, FiUsers, FiX, FiAlertTriangle } from "react-icons/fi";
import API from "../../api";
import "./OwnerNotifications.css";

const PRIORITIES = [
  { key: "low", label: "Low" },
  { key: "normal", label: "Normal" },
  { key: "high", label: "High" },
];

const OwnerNotifications = () => {
  const [form, setForm] = useState({ title: "", message: "", priority: "normal", target: "all" });
  const [admins] = useState([
    // Optional: replace with API list later
    { id: 101, name: "Alice Johnson", email: "alice@example.com" },
    { id: 102, name: "Bob Smith", email: "bob@example.com" },
  ]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const canSend = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return false;
    if (form.target === "specific" && selectedIds.size === 0) return false;
    return true;
  }, [form, selectedIds]);

  const flash = (msg, tone = "info") => {
    setToast({ id: Date.now(), msg, tone });
    setTimeout(() => setToast(null), 2800);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority,
        target: form.target, // "all" | "specific"
        user_ids: form.target === "specific" ? Array.from(selectedIds) : [],
      };
      await API.post("/notifications/admin", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      flash("Notification sent to admins", "success");
      setForm({ title: "", message: "", priority: "normal", target: "all" });
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Send notification failed", err?.response?.data || err.message);
      flash(err?.response?.data?.message || "Failed to send notification", "danger");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="owner-notifications">
      <div className="page-head">
        <h1><FiBell /> Notify Admins</h1>
        <p className="subtitle">Create and send announcements to all admins or selected admins.</p>
      </div>

      {toast && (
        <div className={`toast ${toast.tone}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss"><FiX /></button>
        </div>
      )}

      <div className="grid">
        <div className="card composer">
          <div className="card-head"><h3>Compose</h3></div>

          <div className="field">
            <label>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Short, clear headline"
              maxLength={120}
            />
          </div>

          <div className="field">
            <label>Message</label>
            <textarea
              rows={8}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Write your announcement to admins..."
            />
          </div>

          <div className="row">
            <div className="field">
              <label>Priority</label>
              <div className="pill-row">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`pill ${form.priority === p.key ? "active" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, priority: p.key }))}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Target</label>
              <div className="pill-row">
                <button
                  type="button"
                  className={`pill ${form.target === "all" ? "active" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, target: "all" }))}
                >
                  All admins
                </button>
                <button
                  type="button"
                  className={`pill ${form.target === "specific" ? "active" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, target: "specific" }))}
                >
                  Specific admins
                </button>
              </div>
            </div>
          </div>

          {form.target === "specific" && (
            <div className="info hint">
              <FiAlertTriangle /> Select recipients on the right panel.
            </div>
          )}

          <div className="actions">
            <button
              className="btn-primary"
              onClick={handleSend}
              disabled={!canSend || sending}
              title={!canSend ? "Fill all required fields" : "Send to admins"}
            >
              <FiSend /> {sending ? "Sending..." : "Send to Admins"}
            </button>
          </div>
        </div>

        <div className="card recipients">
          <div className="card-head"><h3><FiUsers /> Recipients</h3></div>
          {form.target === "all" ? (
            <div className="info">All administrators will receive this notification.</div>
          ) : (
            <ul className="list">
              {admins.map((a) => (
                <li key={a.id} className={selectedIds.has(a.id) ? "active" : ""}>
                  <label className="row-line">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                    />
                    <div>
                      <div className="name">{a.name}</div>
                      <div className="muted small">{a.email}</div>
                    </div>
                  </label>
                </li>
              ))}
              {admins.length === 0 && <li className="muted">No admins found.</li>}
            </ul>
          )}

          {form.target === "specific" && (
            <div className="selection-footer">
              <span className="muted small">{selectedIds.size} selected</span>
              <button className="btn-light" onClick={() => setSelectedIds(new Set())}>Clear</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerNotifications;
