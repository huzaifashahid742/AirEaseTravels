import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { isStaffRole } from '../../utils/roles';
import PageLoader from './PageLoader';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Verifying admin access..." />;
  }

  if (!user || !isStaffRole(user)) {
    return <Navigate to="/Login_Page" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
