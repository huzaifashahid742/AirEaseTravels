import React from 'react';
import '../../Css_Folder/Footer.css';
import { Link } from 'react-router-dom';
import { isStaffRole, isStudent } from '../../utils/roles';
import { useAuth } from '../../Context/AuthContext';

const Footer = ({ oncontactclick, onContactClick }) => {
  const { user } = useAuth();
  const contactHandler = oncontactclick || onContactClick;

  const openContact = (e) => {
    e.preventDefault();
    if (contactHandler) contactHandler();
  };

  return (
    <footer className="Footer">
      <div className="Footer_Section">
        <div className="Footer_Left">
          <div className="Footer_Logo">
            <Link to="/" aria-label="AirEase home">
              <img src="/Images_Folder/Logo_transparent.png" alt="AirEase Travels & Tours" />
            </Link>
          </div>
          <p className="Footer_Tagline">
            Your trusted partner for European university admissions and student travel support.
          </p>
        </div>

        <div className="Footer_Links">
          <h2>Explore</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/Programs_List">Programs</Link></li>
            <li><Link to="/Universities_List">Universities</Link></li>
            <li><Link to="/University_Comparisons">University Comparisons</Link></li>
            <li><Link to="/Search">Search</Link></li>
          </ul>
        </div>

        <div className="Footer_Programs">
          <h2>Programs</h2>
          <ul>
            <li><Link to="/Programs_List?degree=Bachelor">Undergraduate (Bachelor)</Link></li>
            <li><Link to="/Programs_List?degree=Master">Master's Programs</Link></li>
            <li><Link to="/Programs_List?language=English">English-Taught</Link></li>
            <li><Link to="/Programs_List?degree=Diploma">Foundation & Diploma</Link></li>
          </ul>
        </div>

        <div className="Footer_Links Footer_Links--secondary">
          <h2>Company</h2>
          <ul>
            <li><Link to="/#why-airease">Why AirEase</Link></li>
            <li><Link to="/#how-it-works">How It Works</Link></li>
            <li>
              <button type="button" className="footer-text-btn" onClick={openContact}>
                Contact Us
              </button>
            </li>
            {isStaffRole(user) ? (
              <li><Link to="/admin/AdminPanel">Admin Panel</Link></li>
            ) : user && isStudent(user) ? (
              <li><Link to="/user/dashboard">My Dashboard</Link></li>
            ) : (
              <li><Link to="/Login_Page">Login / Register</Link></li>
            )}
          </ul>
        </div>

        <div className="Footer_Contact">
          <h2>Contact</h2>
          <ul className="Footer_Contact_List">
            <li>
              <i className="fa-solid fa-location-dot" aria-hidden />
              <span>Lahore, Pakistan · Serving students worldwide</span>
            </li>
            <li>
              <a href="https://wa.me/message/Y2LJ2VUONSEOF1" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-whatsapp" aria-hidden />
                WhatsApp
              </a>
            </li>
            <li>
              <a href="tel:+923259422154">
                <i className="fa-solid fa-phone" aria-hidden />
                +92 325 9422154
              </a>
            </li>
            <li>
              <a href="mailto:aireasetravels5@gmail.com">
                <i className="fa-solid fa-envelope" aria-hidden />
                aireasetravels5@gmail.com
              </a>
            </li>
          </ul>
          <div className="Footer_Social">
            <a
              href="https://wa.me/message/Y2LJ2VUONSEOF1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <i className="fa-brands fa-whatsapp" />
            </a>
            <a
              href="mailto:aireasetravels5@gmail.com"
              aria-label="Email"
            >
              <i className="fa-solid fa-envelope" />
            </a>
            <a href="tel:+923259422154" aria-label="Phone">
              <i className="fa-solid fa-phone" />
            </a>
          </div>
        </div>
      </div>

      <div className="Footer_Bottom">
        <ul>
          <li><Link to="/#why-airease">About</Link></li>
          <li>
            <button type="button" className="footer-text-btn footer-text-btn--inline" onClick={openContact}>
              Support
            </button>
          </li>
          <li><span>© {new Date().getFullYear()} AirEase Travels &amp; Tours. All rights reserved.</span></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
