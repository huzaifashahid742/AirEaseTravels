import React from 'react';
import { Link } from 'react-router-dom';
import '../../Css_Folder/UserDashboard.css';

const UserPlaceholderPage = ({ title, description }) => (
  <div className="user-dashboard-page">
    <div className="user-dashboard-card">
      <h1>{title}</h1>
      <p>{description}</p>
      <Link to="/user/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default UserPlaceholderPage;
