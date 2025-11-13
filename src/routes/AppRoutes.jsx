import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Common Pages
import Login from "../pages/common/Login";
import Signup from "../pages/common/Signup";
import Logout from "../pages/common/Logout";

// Components
import ProtectedRoute from "../components/common/ProtectedRoute";

// Layouts
import LayoutUser from "../components/Layouts/LayoutUser";
import LayoutAdmin from "../components/Layouts/LayoutAdmin";
import LayoutOwner from "../components/Layouts/LayoutOwner";

// USER Pages
import Dashboard from "../pages/user/Dashboard";
import Recommendations from "../pages/user/Recommendations";
import Calendar from "../pages/user/CalendarView";
import BrowseEvents from "../pages/user/BrowseEvents";
import SavedEvents from "../pages/user/SavedEvents";
import MyEvents from "../pages/user/MyEvents";
import ChatRooms from "../pages/user/ChatRooms";
// Removed: Friends
import Notifications from "../pages/user/Notifications";
import FAQs from "../pages/user/FAQs";
import Certificates from "../pages/user/BadgesCertificates";
import Profile from "../pages/user/Profile";
import UpcomingEvents from "../pages/user/UpcomingEvents";

// Admin Pages
import AddEvent from "../pages/admin/AddEvent";
import MyAdminEvents from "../pages/admin/MyAdminEvents";
import DuplicateTemplate from "../pages/admin/DuplicateTemplate";
import ScheduleManager from "../pages/admin/ScheduleManager";
import FAQsManager from "../pages/admin/FAQsManager";
import Registrations from "../pages/admin/Registrations";
// Removed: ChatParticipants
import Announcements from "../pages/admin/Announcements";
import DocumentsUpload from "../pages/admin/DocumentsUpload";
import EventSubmission from "../pages/admin/EventSubmission";
// Removed: PaymentDashboard, TicketScanner
import AdminDashboard from "../pages/admin/AdminDashboard";
import AllEventsAdmin from "../pages/admin/AllEventsAdmin";
import RejectedEvents from "../pages/admin/RejectedEvents";
// Removed: CollaboratorAccess, ReportCenter
import AdminProfile from "../pages/admin/AdminProfile";
import AdminNotifications from "../pages/admin/AdminNotifications";

// Owner Pages
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerProfile from "../pages/owner/OwnerProfile";
// Removed: SiteSettings, DesignEditor, EventCategory, RolesManager, ManageAdmins, ManageUsers, LoginLogs, ActivityLogs, EventsAnalytics, ReportsIssues, RevenueDashboard

import AdminRequests from "../pages/owner/AdminRequests";
import AllEvents from "../pages/owner/AllEvents";
import PublicReviews from "../pages/owner/PublicReviews";
import OwnerChatRooms from "../pages/owner/OwnerChatRooms";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Pages */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* USER ROUTES - Protected */}
        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRole="user">
              <LayoutUser />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home/dashboard" replace />} />
          {/* HOME */}
          <Route path="home/dashboard" element={<Dashboard />} />
            <Route path="home/recommendations" element={<Recommendations />} />
            <Route path="home/calendar" element={<Calendar />} />
          {/* EVENTS */}
          <Route path="events/browse" element={<BrowseEvents />} />
          <Route path="events/saved" element={<SavedEvents />} />
          <Route path="events/my-events" element={<MyEvents />} />
          <Route path="events/upcoming" element={<UpcomingEvents />} />
          {/* ENGAGEMENT */}
          <Route path="engagement/chat" element={<ChatRooms />} />
          {/* Removed: Friends page */}
          {/** Earn Rewards removed **/}
          {/* COMMUNITY */}
          <Route path="community/notifications" element={<Notifications />} />
          <Route path="community/faqs" element={<FAQs />} />
          {/* ACHIEVEMENTS */}
          <Route path="achievements/certificates" element={<Certificates />} />
          {/* PROFILE */}
          <Route path="profile" element={<Profile />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* ADMIN ROUTES - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <LayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="analytics/dashboard" replace />} />

          {/* collaborators route removed */}

          {/* EVENT */}
          <Route path="event">
            <Route path="newevent" element={<AddEvent />} />
            <Route path="manage" element={<MyAdminEvents />} />
            <Route path="template" element={<DuplicateTemplate />} />
            <Route path="event-submission" element={<EventSubmission />} />
            <Route path="documents" element={<DocumentsUpload />} />
          </Route>

          {/* MANAGEMENT */}
          <Route path="management">
            <Route path="tracking" element={<Registrations />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="configuration" element={<FAQsManager />} />
            {/* communication removed */}
          </Route>

            {/* CONTROL removed */}

            {/* ANALYTICS */}
            <Route path="analytics">
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="schedule" element={<ScheduleManager />} />
              <Route path="all-events" element={<AllEventsAdmin />} />
              <Route path="rejected" element={<RejectedEvents />} />
            </Route>

            {/* SUPPORT removed */}

            {/* PROFILE */}
            <Route path="profile" element={<AdminProfile />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="logout" element={<Logout />} />
        </Route>

        {/* OWNER ROUTES - Protected */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredRole="owner">
              <LayoutOwner />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="management/dashboard" replace />} />
          {/* Management */}
          <Route path="management/dashboard" element={<OwnerDashboard />} />
          {/* Removed: site, design, category, roles */}
          {/* Controls */}
          <Route path="controls/requests" element={<AdminRequests />} />
          {/* Analytics - removed */}
          {/* Oversight */}
          <Route path="oversight/events" element={<AllEvents />} />
          <Route path="oversight/reviews" element={<PublicReviews />} />
          {/* Communication */}
          <Route path="communication/chatrooms" element={<OwnerChatRooms />} />
          {/* Profile */}
          <Route path="profile" element={<OwnerProfile />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;