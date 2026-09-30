import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export const ProtectedRoute = () => {
  const { currentUser, studentData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, go to student login
  if (!currentUser) {
    return <Navigate to="/student/login" replace />;
  }

  // If logged in but no studentData, they are probably an Admin trying to access student routes
  if (!studentData) {
    return <Navigate to="/" replace />;
  }

  // Check if they must change password
  const isChangePasswordPage = location.pathname === '/student/change-password';
  
  if (studentData.mustChangePassword && !isChangePasswordPage) {
    return <Navigate to="/student/change-password" replace />;
  }

  if (!studentData.mustChangePassword && isChangePasswordPage) {
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
};

