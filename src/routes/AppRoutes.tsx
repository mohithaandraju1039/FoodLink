import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute, RoleRoute } from './ProtectedRoutes';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

import { DonorDashboard } from '../pages/donor/DonorDashboard';
import { CreateListingPage } from '../pages/donor/CreateListingPage';
import { MyDonationsPage } from '../pages/donor/MyDonationsPage';

import { ReceiverDashboard } from '../pages/receiver/ReceiverDashboard';
import { AvailableFoodPage } from '../pages/receiver/AvailableFoodPage';
import { MyClaimsPage } from '../pages/receiver/MyClaimsPage';

import { VolunteerDashboard } from '../pages/volunteer/VolunteerDashboard';
import { AvailableTasksPage } from '../pages/volunteer/AvailableTasksPage';
import { MyDeliveriesPage } from '../pages/volunteer/MyDeliveriesPage';

import { AdminDashboard } from '../pages/admin/AdminDashboard';

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, effectiveRole } = useAuth();

  // Root redirect helper
  const getRootRedirect = () => {
    if (!isAuthenticated) return '/login';
    const role = effectiveRole;
    if (role === 'ADMIN') return '/admin';
    if (role === 'DONOR') return '/donor';
    if (role === 'RECEIVER') return '/receiver';
    if (role === 'VOLUNTEER') return '/volunteer';
    return '/login';
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={getRootRedirect()} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={getRootRedirect()} replace /> : <RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Donor Portal Routes */}
        <Route element={<RoleRoute allowedRoles={['DONOR']} />}>
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/donor/create" element={<CreateListingPage />} />
          <Route path="/donor/donations" element={<MyDonationsPage />} />
        </Route>

        {/* Receiver Portal Routes */}
        <Route element={<RoleRoute allowedRoles={['RECEIVER']} />}>
          <Route path="/receiver" element={<ReceiverDashboard />} />
          <Route path="/receiver/available" element={<AvailableFoodPage />} />
          <Route path="/receiver/claims" element={<MyClaimsPage />} />
        </Route>

        {/* Volunteer Portal Routes */}
        <Route element={<RoleRoute allowedRoles={['VOLUNTEER']} />}>
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/volunteer/tasks" element={<AvailableTasksPage />} />
          <Route path="/volunteer/deliveries" element={<MyDeliveriesPage />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Fallback Root */}
      <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />
      <Route path="*" element={<Navigate to={getRootRedirect()} replace />} />
    </Routes>
  );
};
