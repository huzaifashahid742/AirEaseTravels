import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { hasPermission } from '../../utils/roles';
import PageLoader from './PageLoader';

const AdminPermissionRoute = ({ permission }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Loading..." />;

  if (!hasPermission(user, permission)) {
    return <Navigate to="/admin/AdminPanel" replace />;
  }

  return <Outlet />;
};

export default AdminPermissionRoute;
