import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export const AdminProtectedRoute = () => {
  const { currentUser, studentData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in at all, redirect to admin login
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user is logged in but has studentData, they are a student trying to access admin
  // Redirect them to their student portal dashboard
  if (studentData) {
    return <Navigate to="/student" replace />;
  }

  // Otherwise, allow admin access
  return <Outlet />;
};
