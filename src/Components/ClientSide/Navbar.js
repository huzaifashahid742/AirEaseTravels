import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { resolveSearchDestination } from '../../utils/resolveSearchDestination';
import UserProfileMenu from './UserProfileMenu';
import '../../Css_Folder/Navbar.css';

const Navbar = ({ onContactClick, phoneNumber = "0317 111 8338" }) => {
  const [navbarSearch, setNavbarSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    setNavbarSearch('');
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const goToSearchResults = async (term) => {
    const trimmed = term.trim();
    if (!trimmed || searching) return;

    setSearching(true);
    try {
      const targetPath = await resolveSearchDestination(trimmed);
      setNavbarSearch('');
      setMenuOpen(false);
      navigate(targetPath, {
        state: { searchQuery: trimmed, fromNavbar: true },
      });
    } catch {
      setNavbarSearch('');
      navigate('/Programs_List', {
        state: { searchQuery: trimmed, fromNavbar: true },
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToSearchResults(navbarSearch);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="airease-user">
      <header className="Header_Section">
        <nav className="Header">
          <div className="Left_Nav">
            <Link to="/" onClick={closeMenu}>
              <img src="/Images_Folder/Logo_transparent.png" alt="AirEase Logo" />
            </Link>
          </div>

          <div className="Middle_Nav desktop-only">
            <ul className="Unordered_List">
              <li>
                <Link to="/Programs_List">Programs</Link>
              </li>
              <li>
                <Link to="/Universities_List">Universities</Link>
              </li>
              <li>
                <Link to="/University_Comparisons">Country Comparisons</Link>
              </li>
              <li>
                <button type="button" className="nav-contact-btn-desktop" onClick={onContactClick}>
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          <div className="Right_Nav desktop-only">
            {!loading &&
              (user ? (
                <UserProfileMenu />
              ) : (
                <Link to="/Login_Page" className="btn open-Login">
                  Login
                </Link>
              ))}
          </div>

          <button
            type="button"
            className="navbar-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          >
            <i className={menuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Backdrop Overlay */}
      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Close menu backdrop"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`navbar-mobile-panel${menuOpen ? ' is-open' : ''}`}>
        <div className="mobile-panel-header">
          <img src="/Images_Folder/Logo_transparent.png" alt="Logo" className="mobile-logo-img" />
          <button type="button" className="mobile-close-btn" onClick={closeMenu} aria-label="Close menu">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <ul className="mobile-nav-list">
          <li>
            <Link to="/University_Comparisons" className="mobile-nav-link" onClick={closeMenu}>
              <span className="link-left">
                <i className="fa-solid fa-globe nav-icon" />
                <span>Country Comparisons</span>
              </span>
              <i className="fa-solid fa-chevron-right nav-arrow" />
            </Link>
          </li>
          <li>
            <Link to="/Universities_List" className="mobile-nav-link" onClick={closeMenu}>
              <span className="link-left">
                <i className="fa-solid fa-building-columns nav-icon" />
                <span>Universities</span>
              </span>
              <i className="fa-solid fa-chevron-right nav-arrow" />
            </Link>
          </li>
          <li>
            <Link to="/Programs_List" className="mobile-nav-link" onClick={closeMenu}>
              <span className="link-left">
                <i className="fa-solid fa-graduation-cap nav-icon" />
                <span>Programs</span>
              </span>
              <i className="fa-solid fa-chevron-right nav-arrow" />
            </Link>
          </li>
        </ul>

        <hr className="mobile-nav-divider" />

        <ul className="mobile-nav-list">
          {!loading && user ? (
            <li>
              <div className="mobile-user-wrapper">
                <UserProfileMenu />
              </div>
            </li>
          ) : (
            <li>
              <Link to="/Login_Page" className="mobile-nav-link" onClick={closeMenu}>
                <span className="link-left">
                  <i className="fa-solid fa-user nav-icon" />
                  <span>Login / Register</span>
                </span>
              </Link>
            </li>
          )}
        </ul>

        <div className="mobile-drawer-footer">
          <button
            type="button"
            className="mobile-contact-btn"
            onClick={() => {
              closeMenu();
              onContactClick?.();
            }}
          >
            CONTACT US
          </button>
          <a href='03259422154' className="mobile-phone-badge">
            <span className="phone-icon-box">
              <i className="fa-solid fa-phone" />
            </span>
            <span className="phone-number-text">0325-9422154</span>
          </a>
        </div>
        
      </aside>
    </div>
  );
};

export default Navbar;