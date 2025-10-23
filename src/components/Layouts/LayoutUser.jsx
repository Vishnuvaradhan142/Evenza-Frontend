import React, { useState, useRef } from "react";
import TopbarUser from "../Topbar/TopbarUser";
import SidebarUser from "../Sidebar/SidebarUser";
import { Outlet, useLocation } from "react-router-dom";
import "../../styles/layout.css";

function LayoutUser() {
  const location = useLocation();
  const initialCategory = location.pathname.split("/")[2];
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const hoverRef = useRef({ topbar: false, sidebar: false });

  const handleTopbarHover = (category) => {
    setSelectedCategory(category);
    setSidebarExpanded(true);
    hoverRef.current.topbar = true;
  };
  const handleTopbarLeave = () => {
    hoverRef.current.topbar = false;
    setTimeout(() => {
      if (!hoverRef.current.topbar && !hoverRef.current.sidebar) {
        setSidebarExpanded(false);
      }
    }, 100);
  };

  const handleSidebarHover = () => {
    setSidebarExpanded(true);
    hoverRef.current.sidebar = true;
  };
  const handleSidebarLeave = () => {
    hoverRef.current.sidebar = false;
    setTimeout(() => {
      if (!hoverRef.current.topbar && !hoverRef.current.sidebar) {
        setSidebarExpanded(false);
      }
    }, 100);
  };

  const showSidebar = [
    "home", "events", "engagement", "community", "achievements", "profile"
  ].includes(initialCategory);

  return (
    <div className="layout">
      <div className="fixed-header">
        <div className="app-header">
          <h1 className="app-title" style={{ textAlign: "center" }}>Evenza</h1>
          <div className="app-caption" style={{ textAlign: "center" }}>
            Your Ultimate Event Management Platform
          </div>
        </div>

        <TopbarUser
          onMainCategoryHover={handleTopbarHover}
          onMainCategoryLeave={handleTopbarLeave}
          username={"Vishnu"}
        />
      </div>

      <div className="main-area">
        {showSidebar && (
          <SidebarUser
            currentCategory={selectedCategory}
            expanded={sidebarExpanded}
            onSidebarHover={handleSidebarHover}
            onSidebarLeave={handleSidebarLeave}
          />
        )}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutUser;