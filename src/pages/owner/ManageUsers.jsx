import React, { useState } from "react";
import { FiUserPlus, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
  ]);

  const [newUser, setNewUser] = useState({ name: "", email: "", status: "Active" });
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = newUser.name.trim() && isEmailValid(newUser.email);

  const handleAddUser = () => {
    if (!isFormValid) return;
    setUsers([...users, { id: Date.now(), ...newUser }]);
    setNewUser({ name: "", email: "", status: "Active" });
    showToast("User added successfully!", "success");
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
    setConfirmDelete(null);
    showToast("User deleted successfully!", "danger");
  };

  const showToast = (message, tone) => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="manage-users-page">
      <div className="page-header">
        <h1>Manage Users</h1>
        <p className="subtitle">Add, view, and manage platform users.</p>
      </div>

      {toast && (
        <div className={`toast ${toast.tone}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss">
            <FiX />
          </button>
        </div>
      )}

      {/* Add User Form */}
      <div className="card form-card">
        <h3>
          <FiUserPlus /> Add User
        </h3>
        <div className="form-grid">
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            {newUser.email && !isEmailValid(newUser.email) && (
              <small className="error">Invalid email address</small>
            )}
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="actions">
            <button
              className="btn-primary"
              onClick={handleAddUser}
              disabled={!isFormValid}
              title={!isFormValid ? "Fill all fields correctly" : "Add user"}
            >
              <FiCheck /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card table-card">
        <h3>Users</h3>
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name / Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="name">{user.name}</div>
                    <div className="email">{user.email}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-btn danger"
                      onClick={() => setConfirmDelete(user)}
                      aria-label={`Delete ${user.name}`}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty">
                    No users available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mini-head">
              <h4>Delete User</h4>
              <button className="close-btn" onClick={() => setConfirmDelete(null)}>
                <FiX />
              </button>
            </div>
            <div className="mini-body">
              <p>
                Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action
                cannot be undone.
              </p>
            </div>
            <div className="mini-foot">
              <button className="btn-light" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDeleteUser(confirmDelete.id)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
