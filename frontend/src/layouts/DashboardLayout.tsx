import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-pink-50/40">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userEmail={user?.email} onLogout={handleLogout} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
