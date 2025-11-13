import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react"; // updated import
import "./Profile.css";

const Profile = () => {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
  const userId = localStorage.getItem("user_id");
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({ contact_phone: "", bio: "", oldPassword: "", newPassword: "", avatar: null });
  const [passwordError, setPasswordError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile/${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId, loadProfile]);

  const handleEdit = (field) => {
    setEditField(field);
    setPasswordError("");
    if (field === "contact") setFormData({ ...formData, contact_phone: profile.contact_phone || "" });
    else if (field === "bio") setFormData({ ...formData, bio: profile.bio || "" });
    else if (field === "avatar") setFormData({ ...formData, avatar: null });
    else setFormData({ ...formData, oldPassword: "", newPassword: "" });
  };

  const handleSave = async (field) => {
    try {
      if (field === "password") {
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!regex.test(formData.newPassword)) {
          setPasswordError("Password must be at least 8 characters, include 1 uppercase letter and 1 symbol");
          return;
        }
        await axios.put(`${API_BASE}/profile/${userId}/password`, {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        });
      } else if (field === "contact") {
        await axios.put(`${API_BASE}/profile/${userId}/contact`, {
          contact_phone: formData.contact_phone,
        });
      } else if (field === "bio") {
        await axios.put(`${API_BASE}/profile/${userId}/bio`, {
          bio: formData.bio,
        });
      } else if (field === "avatar") {
        if (!formData.avatar) return alert("Please select an image");
        const data = new FormData();
        data.append("avatar", formData.avatar);
        await axios.put(`${API_BASE}/profile/${userId}/avatar`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert(`${field} updated successfully`);
      setEditField(null);
      setPasswordError("");
      setAvatarPreview(null);
      loadProfile();
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, avatar: file });
    setAvatarPreview(URL.createObjectURL(file));
  };

  if (!profile) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-card">
        <div className="profile-main">
          <div className="avatar-container">
            <img
              src={avatarPreview || (profile.avatar ? `${profile.avatar}?t=${Date.now()}` : "/default-avatar.png")}
              alt="avatar"
              className="profile-avatar"
            />
            <button className="edit-avatar-btn" onClick={() => handleEdit("avatar")}>Edit</button>
          </div>

          <div className="profile-info">
            <h3>{profile.username}</h3>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
            <strong>Events Registered:</strong>
            <span>{profile.stats?.eventsAttended ?? 0}</span>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
            <strong>Reviews Written:</strong>
            <span>{profile.stats?.reviewsWritten ?? 0}</span>
          </motion.div>
        </div>

        {/* Badges */}
        <div className="profile-badges">
          <strong>Badges:</strong>
          <div className="badges-container">
            {profile.badges.length > 0 ? profile.badges.map((b) => (
              <motion.div
                key={b.badge_id}
                className="badge"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={b.description}
              >
                {b.title}
              </motion.div>
            )) : <span>No badges yet</span>}
          </div>
        </div>

        {/* Editable Sections */}
        <div className="editable-sections">
          <div className="section">
            <strong>Contact:</strong> {profile.contact_phone || "Not set"}
            <button onClick={() => handleEdit("contact")}>Edit</button>
          </div>

          <div className="section">
            <strong>Bio:</strong> {profile.bio || "No bio available"}
            <button onClick={() => handleEdit("bio")}>Edit</button>
          </div>

          <div className="section">
            <strong>Password:</strong> ********
            <button onClick={() => handleEdit("password")}>Change</button>
          </div>
        </div>

        {/* QR Code */}
        <div className="profile-qr" style={{ textAlign: "center", marginTop: "20px" }}>
          <strong>Share Profile:</strong>
          <div style={{ display: "inline-block", marginTop: "10px" }}>
            <QRCodeCanvas value={`${FRONTEND_URL}/profile/${userId}`} size={150} />
          </div>
        </div>
      </div>

      {/* Modal for Editing */}
      <AnimatePresence>
        {editField && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3>Edit {editField === "contact" ? "Contact" : editField === "bio" ? "Bio" : editField === "password" ? "Password" : "Avatar"}</h3>

              {editField === "contact" && (
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              )}

              {editField === "bio" && (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              )}

              {editField === "password" && (
                <>
                  <input
                    type="password"
                    placeholder="Old Password"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                  {passwordError && <p className="error-msg">{passwordError}</p>}
                </>
              )}

              {editField === "avatar" && (
                <>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  {avatarPreview && <img src={avatarPreview} alt="Preview" className="avatar-preview" />}
                </>
              )}

              <div className="modal-buttons">
                <button onClick={() => handleSave(editField)}>Save</button>
                <button onClick={() => { setEditField(null); setAvatarPreview(null); }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
