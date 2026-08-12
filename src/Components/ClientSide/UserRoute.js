import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { isStaffRole, isStudent } from '../../utils/roles';
import PageLoader from './PageLoader';

const UserRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Loading your account..." />;
  }

  if (!user) {
    return <Navigate to="/Login_Page" replace />;
  }

  /* Student-only area — admins use /admin/* (separate login destination after sign-in) */
  if (isStaffRole(user)) {
    return <Navigate to="/admin/AdminPanel" replace />;
  }

  if (!isStudent(user)) {
    return <Navigate to="/Login_Page" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
