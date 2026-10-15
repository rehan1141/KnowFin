import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/common/LoadingScreen';

export const ProtectedRoute: React.FC = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingScreen
        message="Securing your workspace..."
        submessage="Validating credentials and preparing your ledger"
      />
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
