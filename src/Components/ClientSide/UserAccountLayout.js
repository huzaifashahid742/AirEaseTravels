import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import '../../Css_Folder/UserDashboard.css';


const UserAccountLayout = () => {
  const location = useLocation();
  const onApplyWizard =
    location.pathname.startsWith('/user/apply/') && location.pathname !== '/user/apply';

  const linkClass = (item) => ({ isActive }) =>
    `sd-account-nav-link${isActive ? ' sd-account-nav-link--active' : ''}`;

  return (
    <div className="student-dashboard sd-account-shell">
      <div className="sd-account-content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserAccountLayout;
