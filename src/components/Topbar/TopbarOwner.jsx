import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/topbar.css";
import BulbToggle from "../ThemeToggle/BulbToggle";

const mainCategories = [
  { label: "Platform Management", path: "management" },
  { label: "Controls", path: "controls" },
  { label: "Analytics", path: "analytics" },
  { label: "Event Oversight", path: "oversight" },
  { label: "Communication Settings", path: "communication" }
];

const TopbarOwner = ({ onMainCategoryHover, onMainCategoryLeave }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (path) => {
    const defaultRoutes = {
      management: "management/dashboard",
      controls: "controls/admins",
      analytics: "analytics/events",
      oversight: "oversight/events",
      communication: "communication/templates"
    };
    navigate(`/owner/${defaultRoutes[path]}`);
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
        {mainCategories.map((cat) => (
          <button
            key={cat.path}
            onMouseEnter={() =>
              onMainCategoryHover && onMainCategoryHover(cat.path)
            }
            onMouseLeave={onMainCategoryLeave}
            onClick={() => handleCategoryClick(cat.path)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        <BulbToggle />
        <button onClick={() => navigate("/owner/profile")}>
          <span>Owner</span>
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default TopbarOwner;
