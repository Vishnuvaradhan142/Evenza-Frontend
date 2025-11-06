import React from "react";
import { Link, useLocation } from "react-router-dom";
import '../../styles/sidebar.css';

const menuMap = {
  management: [
    { label: "Dashboard", path: "management/dashboard" }
  ],
  controls: [
    { label: "Admin Requests", path: "controls/requests" },
    { label: "Notifications", path: "controls/notifications" }
  ],
  oversight: [
    { label: "All Events", path: "oversight/events" },
    { label: "Public Reviews", path: "oversight/reviews" }
  ],
  profile: [
    { label: "Profile", path: "profile" }
  ]
};

const SidebarOwner = ({ currentCategory, expanded, onSidebarHover, onSidebarLeave }) => {
  const location = useLocation();
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (expanded && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [expanded]);

  return (
    <>
      <div
        className="sidebar-hotspot"
        onMouseEnter={onSidebarHover}
      />
      <div
        ref={containerRef}
        className={`sidebar owner-sidebar${expanded ? " expanded" : " collapsed"}`}
        onMouseEnter={onSidebarHover}
        onMouseLeave={onSidebarLeave}
      >
        {expanded && menuMap[currentCategory]?.map((item) => (
          <Link 
            to={item.path} 
            className={`sidebar-item ${location.pathname.includes(item.path) ? "active" : ""}`}
            key={item.path}
            relative="path" // Makes links relative to current route
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
};

export default SidebarOwner;