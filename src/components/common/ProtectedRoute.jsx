import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('role');
  const location = useLocation();

  // Check if user is authenticated
  if (!token || !userId) {
    // Redirect to login (root)
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on user's actual role
    if (userRole === 'admin') {
      return <Navigate to="/admin/analytics/dashboard" replace />;
    } else if (userRole === 'owner') {
      return <Navigate to="/owner/management/dashboard" replace />;
    } else if (userRole === 'user') {
      return <Navigate to="/user/home/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;
