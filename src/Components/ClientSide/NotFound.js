import React from 'react';
import { Link } from 'react-router-dom';
import '../../Css_Folder/NotFound.css';

const NotFound = () => (
  <div className="not-found-page">
    <div className="not-found-card">
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary">
          Home
        </Link>
        <Link to="/Programs_List" className="btn btn-outline-primary">
          Browse programs
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
