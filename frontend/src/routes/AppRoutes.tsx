import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExpensesPage } from '../pages/ExpensesPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { BudgetsPage } from '../pages/BudgetsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Routes wrapped in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
