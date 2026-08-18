import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { hasPermission } from '../../utils/roles';
import { useAdminSearch } from '../../Context/AdminSearchContext';
import '../../Css_Folder/Admin_Navbar.css';

const Admin_Navbar = () => {
  const { user, logout } = useAuth();
  const { query, setQuery } = useAdminSearch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/Login_Page', { replace: true });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const path = window.location.pathname;
      if (!path.includes('UniversityAdmin') && !path.includes('StudentAdmin') && !path.includes('ComparisonAdmin')) {
        navigate('/admin/UniversityAdmin');
      }
    }
  };

  const navClass = ({ isActive }) =>
    `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`;

  const navItems = [
    { to: '/admin/AdminPanel', end: true, icon: 'fa-chart-line', label: 'Dashboard', show: true },
    {
      to: '/admin/StudentAdmin',
      icon: 'fa-user-graduate',
      label: 'Students',
      show: hasPermission(user, 'applications'),
    },
    {
      to: '/admin/UniversityAdmin',
      icon: 'fa-building-columns',
      label: 'Universities',
      show: hasPermission(user, 'universities'),
    },
    {
      to: '/admin/ComparisonAdmin',
      icon: 'fa-code-compare',
      label: 'Comparison',
      show: hasPermission(user, 'universities'),
    },
    {
      to: '/admin/team',
      icon: 'fa-users-gear',
      label: 'Team',
      show: hasPermission(user, 'manageTeam'),
    },
  ].filter((item) => item.show);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__inner">
        <div className="admin-topbar__brand">
          <NavLink to="/admin/AdminPanel" className="admin-brand-text" onClick={() => setMenuOpen(false)}>
            Admin Panel
          </NavLink>
        </div>

        <button
          type="button"
          className="admin-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
        >
          <i className={menuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden />
        </button>

        {menuOpen && (
          <button
            type="button"
            className="admin-nav-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <nav
          className={`admin-topbar__nav${menuOpen ? ' admin-topbar__nav--open' : ''}`}
          aria-label="Admin navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-topbar__actions">
          <div className="admin-search-wrap">
            <i className="fa-solid fa-magnifying-glass admin-search-icon" aria-hidden />
            <input
              type="search"
              className="admin-search-input"
              placeholder="Search universities, students..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search admin data"
            />
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" aria-hidden />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Admin_Navbar;