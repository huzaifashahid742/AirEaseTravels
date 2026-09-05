import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { authAPI } from '../../services/api';
import { isStaffRole } from '../../utils/roles';
import '../../Css_Folder/Auth.css';

const AuthPage = () => {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await authAPI.signin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!response?.token || !response?.data) {
        throw new Error('Invalid response from server');
      }

      login(response.data, response.token);

      if (isStaffRole(response.data)) {
        navigate('/admin/AdminPanel');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-visual-panel">
        <div className="visual-panel-overlay">
          <div className="visual-panel-content">
            <h2>AirEase Travels & Tours</h2>
            <p>Your gateway to world-class public universities and seamless premium travel experiences across Europe.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card-box">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Log in with your registered email and password.</p>
          </div>

          {error && <div className="auth-alert-error">{error}</div>}

          <form onSubmit={handleFormSubmit} className="auth-form-element">
            <div className="form-input-group">
              <label htmlFor="email">Email Address *</label>
              <input type="email" id="email" placeholder="example@airease.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-input-group">
              <label htmlFor="password">Password *</label>
              <input type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>

            <button type="submit" className="auth-primary-btn" disabled={submitting}>
              {submitting ? 'Processing...' : 'Sign In'}
            </button>
            
            <div className="auth-divider" style={{ margin: "20px 0", textAlign: "center", borderBottom: "1px solid #ddd", lineHeight: "0.1px" }}>
              <span style={{ background: "#fff", padding: "0 10px", color: "#777", fontSize: "14px" }}>OR</span>
            </div>

            <button 
              type="button"
              onClick={() => {
                const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:7000';
                window.location.href = `${backendURL}/api/auth/google`;
              }}
              className="google-auth-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px 20px",
                backgroundColor: "#fff",
                color: "#444",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                width: "100%",
                marginBottom: "15px"
              }}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google logo" 
                style={{ width: "18px", height: "18px" }}
              />
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;