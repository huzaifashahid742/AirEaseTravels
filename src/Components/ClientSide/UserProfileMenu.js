import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { isStaffRole } from '../../utils/roles';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const UserProfileMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/', { replace: true });
  };

  if (!user) return null;

  const isAdmin = isStaffRole(user);

  // Helper function to dynamically resolve profile photo URL
  const getProfilePhotoUrl = () => {
    const dbPhoto = user?.profile?.profilePhoto || user?.avatar;
    if (dbPhoto) {
      if (dbPhoto.startsWith('http')) return dbPhoto;
      
      const apiEnvUrl = process.env.REACT_APP_API_URL || 'http://localhost:7000/api';
      const serverRootUrl = apiEnvUrl.replace(/\/api\/?$/, '');
      
      return `${serverRootUrl}${dbPhoto}`;
    }
    return '';
  };

  const photoUrl = getProfilePhotoUrl();

  /** Students only — no admin links on the public site */
  const studentMenuItems = [
    { label: 'My Profile', to: '/user/profile', icon: 'fa-user' }, 
    { label: 'My Dashboard', to: '/user/dashboard', icon: 'fa-gauge-high' },
    { label: 'My Applications', to: '/user/applications', icon: 'fa-file-lines' },
  ];

  const adminMenuItems = [
    { label: 'Admin Panel', to: '/admin/AdminPanel', icon: 'fa-shield-halved' },
  ];

  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  return (
    <div className="user-profile-menu" ref={menuRef}>
      <button
        type="button"
        className="user-avatar-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="user-avatar-img" />
        ) : (
          <span className="user-avatar-initials">{getInitials(user.name)}</span>
        )}
      </button>

      <div className={`user-profile-dropdown ${open ? 'is-open' : ''}`} role="menu">
        <div className="user-profile-dropdown-header">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="user-avatar-img user-avatar-img-lg" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <span className="user-avatar-initials user-avatar-initials-lg">
              {getInitials(user.name)}
            </span>
          )}
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
            {isAdmin && <small className="d-block text-muted">Administrator</small>}
          </div>
        </div>
        <ul className="user-profile-dropdown-list">
          {menuItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="user-profile-dropdown-link"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" className="user-profile-logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfileMenu;
