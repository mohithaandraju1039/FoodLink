import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Spinner } from '../components/common/Spinner';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, effectiveRole, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  // Admin can access all portals in Admin or View-as mode
  if (user?.role === 'ADMIN') {
    return <Outlet />;
  }

  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
