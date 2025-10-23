import React, { useState, useRef, useEffect } from "react";
import TopbarAdmin from "../Topbar/TopbarAdmin";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import { Outlet, useLocation } from "react-router-dom";

function LayoutAdmin() {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("analytics"); // Default to analytics
  const [headerHeight, setHeaderHeight] = useState(120);

  const hoverRef = useRef({ topbar: false, sidebar: false });
  const headerRef = useRef(null);

  useEffect(() => {
    // Get the current category from the URL path
    const pathParts = location.pathname.split("/").filter(Boolean);
    const newCategory = pathParts.length > 1 ? pathParts[1] : "analytics";
    setSelectedCategory(newCategory);
  }, [location]); // Only depend on location object which contains pathname

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

  const showSidebar = ["event", "management", "control", "analytics", "support", "profile"].includes(selectedCategory);

  // Measure header + topbar height when mounted and on window resize
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight || 120);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Reflect headerHeight to a CSS variable for global styles (e.g., sidebar hotspot)
  useEffect(() => {
    document.documentElement.style.setProperty('--admin-header-height', `${headerHeight}px`);
  }, [headerHeight]);

  return (
    <div className="layout admin-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Fixed header + topbar */}
      <div ref={headerRef} className="admin-fixed-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div className="app-header" style={{ marginBottom: 0 }}>
          <h1 className="app-title">Evenza - Admin</h1>
          <div className="app-caption">Event Admin Panel</div>
        </div>
        <TopbarAdmin
          onMainCategoryHover={handleTopbarHover}
          onMainCategoryLeave={handleTopbarLeave}
          username={"AdminUser"}
        />
      </div>
      <div className="main-content" style={{ 
        display: 'flex', 
        flex: 1, 
        marginTop: headerHeight
      }}>
        {showSidebar && (
          <SidebarAdmin
            currentCategory={selectedCategory}
            expanded={sidebarExpanded}
            onSidebarHover={handleSidebarHover}
            onSidebarLeave={handleSidebarLeave}
          />
        )}
        <div className={`page-content ${showSidebar ? "with-sidebar" : ""}`} style={{ 
          flex: 1,
          padding: 0,
          marginTop: 0,
          display: 'flex',
          minHeight: 0
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutAdmin;