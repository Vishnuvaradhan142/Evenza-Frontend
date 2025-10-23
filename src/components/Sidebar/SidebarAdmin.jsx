import React from "react";
import { Link } from "react-router-dom";
import '../../styles/sidebar.css';

const menuMap = {
  // Event Creation & Setup
  event: [
    { label: "Add Event", path: "event/newevent" },
    { label: "Duplicate Event", path: "event/template" },
    { label: "Submit Event", path: "management/event-submission" },
    { label: "My Events", path: "event/manage" },
    { label: "Documents Upload", path: "management/documents" } // Moved back to event category
  ],
  // Event Management (renamed from Attendee Management in topbar)
  management: [
    { label: "Event FAQs Configuration", path: "event/configuration" },
    { label: "Registration Tracking", path: "management/tracking" },
    { label: "Participant Communication", path: "management/communication" },
    { label: "Announcements", path: "management/announcements" },
    { label: "Registration Form Designer", path: "management/registration-designer" }
  ],
  control: [
    { label: "Payment Dashboard", path: "control/payment" },
    { label: "Ticket Scanner", path: "control/scanner" }
  ],
  analytics: [
    { label: "Dashboard", path: "analytics/dashboard" },
    { label: "Event Analytics", path: "analytics/performance" },
    { label: "Feedback & Ratings", path: "analytics/ratings" },
    { label: "Schedule Manager", path: "analytics/schedule" },
    { label: "All Events", path: "analytics/all-events" },
    { label: "Rejected Events", path: "analytics/rejected" }
  ],
  support: [
    { label: "Collaborator Access", path: "support/access" },
    { label: "Report Center", path: "support/center" }
  ],
  profile: [
    { label: "Profile", path: "profile" }
  ]
};

const SidebarAdmin = ({ currentCategory, expanded, onSidebarHover, onSidebarLeave }) => {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (expanded && containerRef.current) {
      // Ensure the sidebar scroll starts from top when it opens
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
        className={`sidebar admin-sidebar${expanded ? " expanded" : " collapsed"}`}
        onMouseEnter={onSidebarHover}
        onMouseLeave={onSidebarLeave}
      >
        {expanded && menuMap[currentCategory]?.map((item, i) => (
          <Link 
            to={item.path} 
            className="sidebar-item" 
            key={i}
            relative="path" // This ensures the link is relative to current route
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
};

export default SidebarAdmin;