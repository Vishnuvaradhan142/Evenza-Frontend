import React, { useState, useMemo } from "react";
import { FiUserPlus, FiTrash2, FiShield, FiX, FiCheck, FiSearch } from "react-icons/fi";
import "./ManageAdmins.css";

const ROLES = ["Super Admin", "Moderator", "Support"];

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Super Admin" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Moderator" },
  ]);
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return admins;
    return admins.filter(a =>
      [a.name, a.email, a.role].some(v => v.toLowerCase().includes(q))
    );
  }, [search, admins]);

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const formValid = form.name.trim() && isEmail(form.email) && form.role;

  const addAdmin = () => {
    if (!formValid) return;
    setAdmins(prev => [...prev, { id: Date.now(), ...form }]);
    setForm({ name: "", email: "", role: "" });
    flash("Admin added", "success");
  };

  const deleteAdmin = (id) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
    setConfirmDelete(null);
    flash("Admin removed", "danger");
  };

  const flash = (msg, tone) => {
    setToast({ id: Date.now(), msg, tone });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="manage-admins-page">
      <div className="page-header">
        <div>
          <h1>Manage Admins</h1>
          <p className="subtitle">Add, search and maintain platform administrators.</p>
        </div>
        <div className="search-box">
          <FiSearch />
            <input
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.tone}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss"><FiX /></button>
        </div>
      )}

      <div className="card form-card">
        <h3><FiUserPlus /> Add Admin</h3>
        <div className="form-grid">
          <div className="field">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
              type="email"
            />
            {form.email && !isEmail(form.email) && (
              <small className="error">Invalid email</small>
            )}
          </div>
          <div className="field">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="actions">
            <button
              className="btn-primary"
              onClick={addAdmin}
              disabled={!formValid}
              title={!formValid ? "Fill all fields correctly" : "Add admin"}
            >
              <FiCheck /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-head-inline">
          <h3><FiShield /> Administrators</h3>
          <span className="count-badge">{admins.length}</span>
        </div>
        <div className="table-wrapper">
          <table className="admins-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name / Email</th>
                <th>Role</th>
                <th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="name">{a.name}</div>
                    <div className="email">{a.email}</div>
                  </td>
                  <td>
                    <span className={`role-badge ${a.role.replace(/\s+/g,'-').toLowerCase()}`}>
                      {a.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-btn danger"
                      onClick={() => setConfirmDelete(a)}
                      aria-label={`Delete ${a.name}`}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    {admins.length === 0 ? "No admins yet." : "No matches."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mini-head">
              <h4>Remove Admin</h4>
              <button className="close-btn" onClick={() => setConfirmDelete(null)}>
                <FiX />
              </button>
            </div>
            <div className="mini-body">
              <p>
                Remove <strong>{confirmDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="mini-foot">
              <button className="btn-light" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteAdmin(confirmDelete.id)}>
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
