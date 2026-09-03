import React, { useEffect, useState } from 'react';
import '../../Css_Folder/Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { resolveSearchDestination } from '../../utils/resolveSearchDestination';
import UserProfileMenu from './UserProfileMenu';

const Navbar = ({ onContactClick }) => {
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
    <>
      <header className="Header_Section">
        <nav className="Header">
          <div className="Left_Nav">
            <Link to="/" onClick={closeMenu}>
              <img src="/Images_Folder/Logo_transparent.png" alt="AirEase Logo" />
            </Link>
          </div>

          <button
            type="button"
            className="navbar-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
          >
            <i className={menuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden />
          </button>

          {menuOpen && (
            <button
              type="button"
              className="navbar-backdrop"
              aria-label="Close menu"
              onClick={closeMenu}
            />
          )}

          <div className={`navbar-mobile-panel${menuOpen ? ' is-open' : ''}`}>
            <div className="Middle_Nav">
              <ul className="Unordered_List">
                <li>
                  <Link to="/Programs_List" onClick={closeMenu}>
                    Programs
                  </Link>
                </li>
                <li>
                  <Link to="/Universities_List" onClick={closeMenu}>
                    Universities
                  </Link>
                </li>
                <li>
                  <Link to="/University_Comparisons" onClick={closeMenu}>
                    Country Comparisons
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="nav-contact-btn"
                    onClick={() => {
                      closeMenu();
                      onContactClick?.();
                    }}
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            <div className="Right_Nav navbar-right-cluster">
              {!loading &&
                (user ? (
                  <UserProfileMenu />
                ) : (
                  <Link to="/Login_Page" className="btn open-Login" onClick={closeMenu}>
                    Login
                  </Link>
                ))}
            </div>
          </div>
        </nav>
      </header>
      <hr style={{ margin: 0, padding: 0 }} />
    </>
  );
};

export default Navbar;
