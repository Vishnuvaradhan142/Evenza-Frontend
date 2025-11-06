import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/topbar.css";
import BulbToggle from "../ThemeToggle/BulbToggle";

const mainCategories = [
  { label: "Event Creation & Setup", path: "event" },
  { label: "Event Management", path: "management" },
  { label: "Analytics & Insights", path: "analytics" }
];

const TopbarAdmin = ({ onMainCategoryHover, onMainCategoryLeave, username }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (path) => {
    const defaultRoutes = {
      event: "management/event-submission",
      management: "management/tracking",
      analytics: "analytics/dashboard"
    };
    navigate(`/admin/${defaultRoutes[path]}`);
  };

  // ---------------- Logout (auto set Offline + clear session) ----------------
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
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

    // Clear session
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
        {mainCategories.map((cat) => (
          <button
            key={cat.label}
            onMouseEnter={() => onMainCategoryHover && onMainCategoryHover(cat.path)}
            onMouseLeave={onMainCategoryLeave}
            onClick={() => handleCategoryClick(cat.path)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        <BulbToggle />
        <button onClick={() => navigate("/admin/profile")}>
          <span>{username || "Admin"}</span>
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default TopbarAdmin;
