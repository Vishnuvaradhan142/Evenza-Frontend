import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/topbar.css";
import BulbToggle from "../ThemeToggle/BulbToggle";

const TopbarOwner = () => {
  const navigate = useNavigate();

  // ---------------- Logout (auto set Offline + clear session) ----------------
  const handleLogout = async () => {
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Error logging out:", err);
      }
    }

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");

    navigate("/login");
  };

  return (
    <div className="topbar">
      <div className="topbar-left" />

      <nav className="topbar-nav">
        <button onClick={() => navigate("/owner/management/dashboard")}>
          Dashboard
        </button>
        <button onClick={() => navigate("/owner/controls/requests")}>
          Admin Requests
        </button>
        <button onClick={() => navigate("/owner/oversight/events")}>
          All Events
        </button>
        <button onClick={() => navigate("/owner/oversight/reviews")}>
          Public Reviews
        </button>
        <button onClick={() => navigate("/owner/communication/chatrooms")}>
          ChatRooms
        </button>
      </nav>

      <div className="topbar-right">
        <BulbToggle />
        <button onClick={() => navigate("/owner/profile")}>
          <span>Profile</span>
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default TopbarOwner;
