import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/common/LoadingScreen';

export const ProtectedRoute: React.FC = () => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Getting your finances ready…" />;
  }

  // Never treat the existence of a token in local storage or React state as proof that it is valid.
  // Both a token and a verified backend user profile from /auth/me are required.
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
