import React from "react";
import { Link, useLocation } from "react-router-dom";
import '../../styles/sidebar.css';

const menuMap = {
  management: [
    { label: "Dashboard", path: "management/dashboard" },
    { label: "Site Settings", path: "management/site" },
    { label: "Design Editor", path: "management/design" },

    { label: "Event Category", path: "management/category" },
    { label: "Custom Roles Manager", path: "management/roles" }
  ],
  controls: [
    { label: "Manage Admins", path: "controls/admins" },
    { label: "Manage Users", path: "controls/users" },
    { label: "Admin Requests", path: "controls/requests" },
    { label: "Login Logs", path: "controls/login" },
    { label: "Activity Logs", path: "controls/activity" },
    { label: "Notifications", path: "controls/notifications" }
  ],
  analytics: [
    { label: "Events Analytics", path: "analytics/events" },
    { label: "Reports & Issues", path: "analytics/issues" },
    { label: "Revenue Dashboard", path: "analytics/revenue" }
  ],
  oversight: [
    { label: "All Events", path: "oversight/events" },
    { label: "Archive Events", path: "oversight/archive" },
    { label: "Public Reviews", path: "oversight/reviews" },
    { label: "Content Moderation", path: "oversight/moderation" }
  ],
  communication: [
    { label: "Email Templates", path: "communication/templates" },
    { label: "SMS Gateway", path: "communication/settings" }
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