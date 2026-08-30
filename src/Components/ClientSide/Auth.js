import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { authAPI } from '../../services/api';
import { isStaffRole } from '../../utils/roles';
import '../../Css_Folder/Auth.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    occupation: '',
    currentEducation: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    currentAge: '',
    gender: '',
    nationality: '',
    countryOfResidence: '',
    passportNumber: '',
    profilePhoto: null, // Added file state
    currentAddress: '',
    password: '',
  });

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === 'profilePhoto') {
      setFormData({ ...formData, profilePhoto: files[0] });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.passportNumber) {
        setError('Please fill in all mandatory fields.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setSubmitting(true);

    try {
      let response;

      if (isLogin) {
        response = await authAPI.signin({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });
      } else {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        // Use multipart/form-data payload for file upload support
        const data = new FormData();
        data.append('name', fullName);
        data.append('firstName', formData.firstName.trim());
        // data.append('middleName', formData.middleName ? formData.middleName.trim() : '');
        data.append('lastName', formData.lastName.trim());
        data.append('occupation', formData.occupation ? formData.occupation.trim() : '');
        data.append('currentEducation', formData.currentEducation ? formData.currentEducation.trim() : '');
        data.append('email', formData.email.trim().toLowerCase());
        data.append('phone', formData.phone.trim());
        data.append('dateOfBirth', formData.dateOfBirth);
        data.append('currentAge', formData.currentAge ? Number(formData.currentAge) : '');
        data.append('gender', formData.gender);
        data.append('nationality', formData.nationality.trim());
        data.append('countryOfResidence', formData.countryOfResidence.trim());
        data.append('passportNumber', formData.passportNumber.trim());
        
        if (formData.profilePhoto) {
          data.append('profilePhoto', formData.profilePhoto);
        }

        data.append('currentAddress', formData.currentAddress.trim());
        data.append('password', formData.password);

        response = await authAPI.signup(data);
      }

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
        <div className={`auth-card-box ${!isLogin ? 'wide-card' : ''}`}>
          <div className="auth-header">
            <h1>{isLogin ? 'Welcome Back' : 'Student Registration'}</h1>
            <p>
              {isLogin
                ? 'Log in with your registered email and password.'
                : 'Fill out your student profile details to apply to programs.'}
            </p>
          </div>

          {error && <div className="auth-alert-error">{error}</div>}

          <form onSubmit={handleFormSubmit} className="auth-form-element">
            {!isLogin && (
              <div className="registration-grid-container">
                <div className="form-input-group">
                  <label htmlFor="firstName">First name *</label>
                  <input type="text" id="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                </div>

                {/* <div className="form-input-group">
                  <label htmlFor="middleName">Middle name</label>
                  <input type="text" id="middleName" placeholder="Middle" value={formData.middleName} onChange={handleChange} />
                </div> */}

                <div className="form-input-group">
                  <label htmlFor="lastName">Last name *</label>
                  <input type="text" id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                </div>

                <div className="form-input-group">
                  <label htmlFor="occupation">Occupation</label>
                  <input type="text" id="occupation" placeholder="e.g. Student" value={formData.occupation} onChange={handleChange} />
                </div>

                <div className="form-input-group">
                  <label htmlFor="currentEducation">Current Education</label>
                  <input type="text" id="currentEducation" placeholder="e.g. Bachelors" value={formData.currentEducation} onChange={handleChange} />
                </div>

                <div className="form-input-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input type="tel" id="phone" placeholder="+92 300 1234567" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-input-group">
                  <label htmlFor="dateOfBirth">Date of birth *</label>
                  <input type="date" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                </div>

                <div className="form-input-group">
                  <label htmlFor="currentAge">Current Age *</label>
                  <input type="number" id="currentAge" placeholder="21" min="10" max="100" value={formData.currentAge} onChange={handleChange} required />
                </div>

                <div className="form-input-group">
                  <label htmlFor="gender">Gender *</label>
                  <select id="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-input-group">
                  <label htmlFor="nationality">Nationality *</label>
                  <input type="text" id="nationality" placeholder="e.g. Pakistani" value={formData.nationality} onChange={handleChange} required />
                </div>

                <div className="form-input-group">
                  <label htmlFor="countryOfResidence">Country of residence *</label>
                  <input type="text" id="countryOfResidence" placeholder="e.g. Pakistan" value={formData.countryOfResidence} onChange={handleChange} required />
                </div>

                <div className="form-input-group">
                  <label htmlFor="passportNumber">Passport Number *</label>
                  <input type="text" id="passportNumber" placeholder="AB1234567" value={formData.passportNumber} onChange={handleChange} required />
                </div>

                {/* Profile Photo Field placed right after Passport Number */}
                <div className="form-input-group">
                  <label htmlFor="profilePhoto">Profile Photo</label>
                  <input type="file" id="profilePhoto" accept="image/*" onChange={handleChange} />
                </div>

                <div className="form-input-group full-width">
                  <label htmlFor="currentAddress">Current address *</label>
                  <textarea id="currentAddress" rows="2" placeholder="Street address, city, country" value={formData.currentAddress} onChange={handleChange} required />
                </div>
              </div>
            )}

            <div className="form-input-group">
              <label htmlFor="email">Email Address *</label>
              <input type="email" id="email" placeholder="example@airease.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-input-group">
              <label htmlFor="password">Password *</label>
              <input type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>

            <button type="submit" className="auth-primary-btn" disabled={submitting}>
              {submitting ? 'Processing...' : isLogin ? 'Sign In' : 'Complete Registration'}
            </button>
            <div className="auth-divider" style={{ margin: "20px 0", textAlign: "center", borderBottom: "1px solid #ddd", lineHeight: "0.1px" }}>
  <span style={{ background: "#fff", padding: "0 10px", color: "#777", fontSize: "14px" }}>OR</span>
</div>

<button 
  type="button"
  onClick={() => {
    const backendURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-app.railway.app' 
      : 'http://localhost:7000';

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

          <div className="auth-toggle-footer">
            <span>{isLogin ? 'New to AirEase Travels?' : 'Already have an account?'}</span>
            <button
              type="button"
              className="toggle-mode-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Create an account' : 'Sign in here'}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;