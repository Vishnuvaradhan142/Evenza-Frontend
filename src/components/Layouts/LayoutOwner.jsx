import React, { useState, useRef, useEffect } from "react";
import TopbarOwner from "../Topbar/TopbarOwner";
import SidebarOwner from "../Sidebar/SidebarOwner";
import { Outlet, useLocation } from "react-router-dom";

function LayoutOwner() {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("management"); // Changed default to management
  const [headerHeight, setHeaderHeight] = useState(130);

  const hoverRef = useRef({ topbar: false, sidebar: false });
  const headerRef = useRef(null);

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const newCategory = pathParts.length > 1 ? pathParts[1] : "management";
    setSelectedCategory(newCategory);
  }, [location]);

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

  // Updated to match owner categories
  const showSidebar = ["management", "controls", "analytics", "oversight", "communication", "profile"].includes(selectedCategory);

  // Measure header + topbar height when mounted and on window resize
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight || 130);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Reflect headerHeight to a CSS variable for owner styles (e.g., sidebar hotspot)
  useEffect(() => {
    document.documentElement.style.setProperty('--owner-header-height', `${headerHeight}px`);
  }, [headerHeight]);

  return (
    <div className="layout owner-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Fixed header + topbar for Owner */}
      <div ref={headerRef} className="owner-fixed-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div className="app-header">
          <h1 className="app-title">Evenza - Owner</h1>
          <div className="app-caption">Platform Owner Panel</div>
        </div>
        <TopbarOwner
          onMainCategoryHover={handleTopbarHover}
          onMainCategoryLeave={handleTopbarLeave}
        />
      </div>
      <div className="main-content" style={{ 
        display: 'flex', 
        flex: 1, 
        marginTop: headerHeight
      }}>
        {showSidebar && (
          <SidebarOwner
            currentCategory={selectedCategory}
            expanded={sidebarExpanded}
            onSidebarHover={handleSidebarHover}
            onSidebarLeave={handleSidebarLeave}
          />
        )}
        <div className={`page-content ${showSidebar ? "with-sidebar" : ""}`} style={{ 
          flex: 1,
          padding: 0,
          marginTop: 0
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutOwner;