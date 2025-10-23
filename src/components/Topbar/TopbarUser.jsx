import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/topbar.css";
import BulbToggle from "../ThemeToggle/BulbToggle";

const mainCategories = [
  { label: "Home"},
  { label: "Events"},
  { label: "Engagement"},
  { label: "Community"},
  { label: "Achievements"}
];

const TopbarUser = ({ onMainCategoryHover, onMainCategoryLeave }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem("username") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleProfileClick = () => {
    if (username) navigate("/user/profile");
    else navigate("/login");
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

    setUsername("");
    navigate("/login");
  };

  return (
    <div className="topbar">
      <div className="topbar-left" />

      <nav className="topbar-nav">
        {mainCategories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate(cat.path)}
            onMouseEnter={() =>
              onMainCategoryHover && onMainCategoryHover(cat.label.toLowerCase())
            }
            onMouseLeave={onMainCategoryLeave}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        <BulbToggle />
        <button onClick={handleProfileClick}>
          {username ? <span>{username}</span> : <span>Login</span>}
        </button>
        {username && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </div>
  );
};

export default TopbarUser;
