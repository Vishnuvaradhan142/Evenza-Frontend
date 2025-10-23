import React from "react";
import { Link } from "react-router-dom";
import '../../styles/sidebar.css';

const menuMap = {
  home: [
    { label: "Dashboard", path: "/user/home/dashboard" },
    { label: "AI Recommendations", path: "/user/home/recommendations" },
    { label: "Calendar View", path: "/user/home/calendar" }
  ],
  events: [
    { label: "Browse Events", path: "/user/events/browse" },
    { label: "My Events", path: "/user/events/my-events" },
    { label: "My Tickets", path: "/user/events/my-tickets" },
    { label: "Saved Events", path: "/user/events/saved" },
    { label: "Upcoming Events", path: "/user/events/upcoming" },
    { label: "Waitlisted Events", path: "/user/events/waitlisted" }
  ],
  engagement: [
    { label: "Chat Rooms", path: "/user/engagement/chat" },
    { label: "Friends", path: "/user/engagement/friends" }
  ],
  community: [
    { label: "Notifications", path: "/user/community/notifications" },
    { label: "FAQs", path: "/user/community/faqs" }
  ],
  achievements: [
    { label: "Badges & Certificates", path: "/user/achievements/certificates" }
  ],
  profile: [
    { label: "Profile", path: "/user/profile" }
  ]
};

const SidebarUser = ({ currentCategory, expanded, onSidebarHover, onSidebarLeave }) => {
  return (
    <>
      <div
        className="sidebar-hotspot"
        onMouseEnter={onSidebarHover}
      />
      <div
        className={`sidebar user-sidebar${expanded ? " expanded" : " collapsed"}`}
        onMouseEnter={onSidebarHover}
        onMouseLeave={onSidebarLeave}
      >
        {expanded && menuMap[currentCategory]?.map((item, i) => (
          <Link to={item.path} className="sidebar-item" key={i}>
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
};

export default SidebarUser;
