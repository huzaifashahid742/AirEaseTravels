import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { authAPI } from '../../services/api';
import '../../Css_Folder/ApplyViaUs.css';
import '../../Css_Folder/UserDashboard.css';
import PageLoader from './PageLoader';

const UserProfile = () => {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  // Cleanup local preview object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  useEffect(() => {
    const p = user?.profile || {};
    const nameParts = user?.name?.trim().split(/\s+/) || [];

    setProfile({
      ...p,
      firstName: p.firstName || nameParts[0] || '',
      middleName: p.middleName || '',
      lastName: p.lastName ||
        (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''),
      email: user?.email || '',
      dateOfBirth: p.dateOfBirth
        ? String(p.dateOfBirth).split('T')[0]
        : '',
      profilePhoto: p.profilePhoto || '',
      skills: Array.isArray(p.skills)
        ? p.skills.join(', ')
        : (p.skills || ''),
      password: ''
    });

    if (!justSaved) {
      setLocalPreview('');
    }
  }, [user]);

  const handleChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));

    setError('');
    setMessage('');
  };

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;

    const birthDate = new Date(`${dob}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Profile photo validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, WEBP and GIF images are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo must be smaller than 5MB.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    setLocalPreview(URL.createObjectURL(file));
    setError('');
    setMessage('');
    setJustSaved(false);
  };

  const getProfilePhotoUrl = () => {
    if (localPreview) return localPreview;

    const dbPhoto =
      user?.profile?.profilePhoto || profile?.profilePhoto;

    if (!dbPhoto) return '';

    if (dbPhoto.startsWith('http')) return dbPhoto;

    const apiEnvUrl = process.env.REACT_APP_API_URL || '';
    const serverRootUrl = apiEnvUrl.replace(/\/api\/?$/, '');

    return `${serverRootUrl}${dbPhoto}`;
  };

  // Request OTP
  const handleRequestOtp = async () => {
    const password = profile.password || '';

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        'Password must contain uppercase, lowercase, number and special character.'
      );
      return;
    }

    setSendingOtp(true);
    setError('');
    setOtpSentMessage('');

    try {
      const res = await authAPI.requestPasswordOtp();

      setOtpSentMessage(
        res.message || 'Verification code sent to your email!'
      );
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Strong password validation
  const isStrongPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  // Complete form validation
  const validateForm = () => {
    const firstName = (profile.firstName || '').trim();
    const lastName = (profile.lastName || '').trim();
    const password = profile.password || '';

    const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
    const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;
    const countryRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
    const passportRegex = /^[A-Za-z0-9]{6,15}$/;

    // First name
    if (!firstName) {
      setError('First name is required.');
      return false;
    }

    if (firstName.length < 2 || firstName.length > 50) {
      setError('First name must contain 2–50 characters.');
      return false;
    }

    if (!nameRegex.test(firstName)) {
      setError('First name can only contain letters, spaces, hyphens or apostrophes.');
      return false;
    }

    // Last name
    if (!lastName) {
      setError('Last name is required.');
      return false;
    }

    if (lastName.length < 2 || lastName.length > 50) {
      setError('Last name must contain 2–50 characters.');
      return false;
    }

    if (!nameRegex.test(lastName)) {
      setError('Last name can only contain letters, spaces, hyphens or apostrophes.');
      return false;
    }

    // Occupation
    if ((profile.occupation || '').length > 60) {
      setError('Occupation cannot exceed 60 characters.');
      return false;
    }

    // Education
    if ((profile.currentEducation || '').length > 100) {
      setError('Current education cannot exceed 100 characters.');
      return false;
    }

    // Phone
    if (
      profile.phone &&
      !phoneRegex.test(profile.phone.trim())
    ) {
      setError('Please enter a valid phone number.');
      return false;
    }

    // WhatsApp
    if (
      profile.whatsapp &&
      !phoneRegex.test(profile.whatsapp.trim())
    ) {
      setError('Please enter a valid WhatsApp number.');
      return false;
    }

    // Date of birth
    if (profile.dateOfBirth) {
      const dob = new Date(`${profile.dateOfBirth}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dob.getTime()) || dob > today) {
        setError('Please enter a valid date of birth.');
        return false;
      }

      if (calculateAge(profile.dateOfBirth) > 120) {
        setError('Date of birth cannot indicate an age above 120.');
        return false;
      }
    }

    // Current age
    if (profile.currentAge !== '' && profile.currentAge != null) {
      const age = Number(profile.currentAge);

      if (!Number.isInteger(age) || age < 1 || age > 120) {
        setError('Age must be a whole number between 1 and 120.');
        return false;
      }

      if (
        profile.dateOfBirth &&
        calculateAge(profile.dateOfBirth) !== age
      ) {
        setError('Your current age does not match your date of birth.');
        return false;
      }
    }

    // Gender
    if (
      profile.gender &&
      !['Male', 'Female', 'Other'].includes(profile.gender)
    ) {
      setError('Please select a valid gender.');
      return false;
    }

    // Nationality
    if (
      profile.nationality &&
      (
        profile.nationality.length > 60 ||
        !countryRegex.test(profile.nationality.trim())
      )
    ) {
      setError('Please enter a valid nationality.');
      return false;
    }

    // Country of residence
    if (
      profile.countryOfResidence &&
      (
        profile.countryOfResidence.length > 60 ||
        !countryRegex.test(profile.countryOfResidence.trim())
      )
    ) {
      setError('Please enter a valid country of residence.');
      return false;
    }

    // Passport
    if (
      profile.passportNumber &&
      !passportRegex.test(profile.passportNumber.trim())
    ) {
      setError('Passport number must contain 6–15 alphanumeric characters.');
      return false;
    }

    // Addresses
    if ((profile.currentAddress || '').length > 250) {
      setError('Current address cannot exceed 250 characters.');
      return false;
    }

    if ((profile.permanentAddress || '').length > 250) {
      setError('Permanent address cannot exceed 250 characters.');
      return false;
    }

    // Skills
    if ((profile.skills || '').length > 300) {
      setError('Skills cannot exceed 300 characters.');
      return false;
    }

    // Password and OTP
    if (password.trim()) {
      if (!isStrongPassword(password)) {
        setError(
          'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.'
        );
        return false;
      }

      if (!/^[0-9]{6}$/.test(otp.trim())) {
        setError('Please enter a valid 6-digit numeric OTP.');
        return false;
      }

      if (!otpSentMessage) {
        setError('Please request an email verification code first.');
        return false;
      }
    }

    return true;
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!validateForm()) return;

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append('firstName', profile.firstName.trim());
      formData.append('lastName', profile.lastName.trim());
      formData.append('occupation', profile.occupation || '');
      formData.append('currentEducation', profile.currentEducation || '');
      formData.append('phone', profile.phone || '');
      formData.append('whatsapp', profile.whatsapp || '');

      if (profile.dateOfBirth) {
        formData.append('dateOfBirth', profile.dateOfBirth);
      }

      formData.append('currentAge', profile.currentAge || '');
      formData.append('gender', profile.gender || '');
      formData.append('nationality', profile.nationality || '');
      formData.append('countryOfResidence', profile.countryOfResidence || '');
      formData.append('permanentAddress', profile.permanentAddress || '');
      formData.append('currentAddress', profile.currentAddress || '');
      formData.append('passportNumber', profile.passportNumber || '');
      formData.append('skills', profile.skills || '');

      if (profile.password && profile.password.trim()) {
        formData.append('password', profile.password.trim());
        formData.append('otp', otp.trim());
      }

      if (selectedFile) {
        formData.append('profilePhoto', selectedFile);
      }

      const res = await authAPI.updateProfile(formData);
      const token = localStorage.getItem('token');

      setJustSaved(true);

      login(res.data, token);

      setSelectedFile(null);
      setProfile(prev => ({
        ...prev,
        password: ''
      }));

      setOtp('');
      setOtpSentMessage('');

      setMessage(
        'Profile saved successfully. Changes will pre-fill your applications.'
      );

      setTimeout(() => setJustSaved(false), 2000);

    } catch (err) {
      setError(err.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <PageLoader label="Loading profile..." />;
  }

  const currentPhotoUrl = getProfilePhotoUrl();

  return (
    <div className="apply-wizard-page">

      <h1 style={{ color: '#1F3A5F', fontWeight: 700, margin: 0 }}>
        My Profile
      </h1>

      <p className="text-muted">
        Information saved here can be used when applying via AirEase.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      <form
        className="apply-form-card w-100"
        onSubmit={handleSave}
        encType="multipart/form-data"
      >

        <div className="apply-grid">

          <div className="apply-field">
            <label>First name *</label>
            <input
              className="form-control"
              value={profile.firstName || ''}
              onChange={e => handleChange('firstName', e.target.value)}
              minLength={2}
              maxLength={50}
              required
            />
          </div>

          <div className="apply-field">
            <label>Last name *</label>
            <input
              className="form-control"
              value={profile.lastName || ''}
              onChange={e => handleChange('lastName', e.target.value)}
              minLength={2}
              maxLength={50}
              required
            />
          </div>

          <div className="apply-field">
            <label>Occupation</label>
            <input
              className="form-control"
              maxLength={60}
              value={profile.occupation || ''}
              onChange={e => handleChange('occupation', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Current Education</label>
            <input
              className="form-control"
              maxLength={100}
              value={profile.currentEducation || ''}
              onChange={e => handleChange('currentEducation', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              value={user.email || ''}
              disabled
            />
          </div>

          <div className="apply-field">
            <label>Create / Change Password (Optional)</label>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 8 characters"
                value={profile.password || ''}
                onChange={e => handleChange('password', e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
                onClick={handleRequestOtp}
                disabled={
                  sendingOtp ||
                  !profile.password ||
                  !isStrongPassword(profile.password)
                }
              >
                {sendingOtp ? 'Sending...' : 'Send Code'}
              </button>
            </div>

            <small className="text-muted">
              Use at least 8 characters, uppercase, lowercase, a number
              and a special character.
            </small>
          </div>

          {profile.password && (
            <div className="apply-field">
              <label>Email Verification Code (OTP) *</label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={e => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                inputMode="numeric"
                maxLength={6}
              />

              {otpSentMessage && (
                <small className="text-success">
                  {otpSentMessage}
                </small>
              )}
            </div>
          )}

          <div className="apply-field">
            <label>Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+923001234567"
              value={profile.phone || ''}
              onChange={e => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>WhatsApp Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+923001234567"
              value={profile.whatsapp || ''}
              onChange={e => handleChange('whatsapp', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Date of Birth</label>
            <input
              type="date"
              className="form-control"
              max={new Date().toISOString().split('T')[0]}
              value={profile.dateOfBirth || ''}
              onChange={e => {
                handleChange('dateOfBirth', e.target.value);

                if (e.target.value) {
                  setProfile(prev => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                    currentAge: calculateAge(e.target.value)
                  }));
                }
              }}
            />
          </div>

          <div className="apply-field">
            <label>Current Age</label>
            <input
              type="number"
              min="1"
              max="120"
              step="1"
              className="form-control"
              value={profile.currentAge ?? ''}
              onChange={e => handleChange('currentAge', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Gender</label>
            <select
              className="form-select"
              value={profile.gender || ''}
              onChange={e => handleChange('gender', e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="apply-field">
            <label>Nationality</label>
            <input
              className="form-control"
              maxLength={60}
              value={profile.nationality || ''}
              onChange={e => handleChange('nationality', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Country of Residence</label>
            <input
              className="form-control"
              maxLength={60}
              value={profile.countryOfResidence || ''}
              onChange={e => handleChange('countryOfResidence', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Passport Number</label>
            <input
              className="form-control"
              maxLength={15}
              value={profile.passportNumber || ''}
              onChange={e => handleChange('passportNumber', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Current Address</label>
            <textarea
              className="form-control"
              maxLength={250}
              value={profile.currentAddress || ''}
              onChange={e => handleChange('currentAddress', e.target.value)}
            />
          </div>

          <div className="apply-field">
            <label>Permanent Address</label>
            <textarea
              className="form-control"
              maxLength={250}
              value={profile.permanentAddress || ''}
              onChange={e => handleChange('permanentAddress', e.target.value)}
            />
          </div>

          <div className="apply-grid-full">
            <div className="apply-field">
              <label>Skills Set</label>

              <input
                className="form-control"
                maxLength={300}
                placeholder="Communication, Leadership, Python, Research"
                value={profile.skills || ''}
                onChange={e => handleChange('skills', e.target.value)}
              />

              <small className="text-muted">
                Separate multiple skills with commas.
              </small>
            </div>
          </div>

          <div className="apply-field">
            <label>Profile Photo</label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="form-control"
              onChange={handleFileChange}
            />

            <small className="text-muted">
              JPG, PNG, WEBP or GIF. Maximum size: 5MB.
            </small>

            {currentPhotoUrl ? (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={currentPhotoUrl}
                  alt="Profile Preview"
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            ) : (
              <small className="text-muted d-block mt-2">
                No photo uploaded.
              </small>
            )}
          </div>

        </div>

        <div className="apply-form-actions">
          <button
            type="submit"
            className="btn apply-btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default UserProfile;