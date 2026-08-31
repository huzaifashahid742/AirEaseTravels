import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const p = user?.profile || {};
    const nameParts = user?.name?.split(' ') || [];
    
    setProfile({
      ...p,
      firstName: p.firstName || nameParts[0] || '',
      middleName: p.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''),
      lastName: p.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''),
      email: user?.email || '',
      dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).split('T')[0] : '',
      profilePhoto: p.profilePhoto || '',
      skills: Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || ''),
      password: '',
    });

    if (!justSaved) {
      setLocalPreview('');
    }
  }, [user]);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLocalPreview(URL.createObjectURL(file));
      setJustSaved(false);
    }
  };

 const getProfilePhotoUrl = () => {
    // 1. Prioritize local preview if a new file was just selected
    if (localPreview) return localPreview;
    
    // 2. Fall back to database URL stored in user context or profile state
    const dbPhoto = user?.profile?.profilePhoto || profile?.profilePhoto;
    if (dbPhoto) {
      if (dbPhoto.startsWith('http')) return dbPhoto;
      
      // Extract base server URL from REACT_APP_API_URL (removes trailing '/api')
      const apiEnvUrl = process.env.REACT_APP_API_URL || 'http://localhost:7000/api';
      const serverRootUrl = apiEnvUrl.replace(/\/api\/?$/, '');
      
      return `${serverRootUrl}${dbPhoto}`;
    }
    return '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const formData = new FormData();
      
      formData.append('firstName', profile.firstName || '');
      formData.append('lastName', profile.lastName || '');
      formData.append('occupation', profile.occupation || '');
      formData.append('currentEducation', profile.currentEducation || '');
      formData.append('phone', profile.phone || '');
      formData.append('whatsapp', profile.whatsapp || '');
      if (profile.dateOfBirth) formData.append('dateOfBirth', profile.dateOfBirth);
      formData.append('currentAge', profile.currentAge || '');
      formData.append('gender', profile.gender || '');
      formData.append('nationality', profile.nationality || '');
      formData.append('countryOfResidence', profile.countryOfResidence || '');
      formData.append('permanentAddress', profile.permanentAddress || '');
      formData.append('currentAddress', profile.currentAddress || '');
      formData.append('passportNumber', profile.passportNumber || '');
      formData.append('skills', profile.skills || '');
      if (profile.password && profile.password.trim().length >= 6) {
        formData.append('password', profile.password.trim());
      }

      if (selectedFile) {
        formData.append('profilePhoto', selectedFile);
      }

      const res = await authAPI.updateProfile(formData);
      const token = localStorage.getItem('token');
      
      setJustSaved(true);
      login(res.data, token);
      setSelectedFile(null); 
      setMessage('Profile saved successfully. Changes will pre-fill your applications.');
      
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <PageLoader label="Loading profile..." />;

  const currentPhotoUrl = getProfilePhotoUrl();

  return (
    <div className="apply-wizard-page">
      <h1 style={{ color: '#1F3A5F', fontWeight: 700, margin: 0 }}>My Profile</h1>
      <p className="text-muted">Information saved here can be used when applying via AirEase.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form className="apply-form-card w-100" onSubmit={handleSave} encType="multipart/form-data">
        <div className="apply-grid">
          <div className="apply-field">
            <label>First name</label>
            <input className="form-control" value={profile.firstName || ''} onChange={(e) => handleChange('firstName', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Last name</label>
            <input className="form-control" value={profile.lastName || ''} onChange={(e) => handleChange('lastName', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Occupation</label>
            <input className="form-control" value={profile.occupation || ''} onChange={(e) => handleChange('occupation', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Current Education</label>
            <input className="form-control" value={profile.currentEducation || ''} onChange={(e) => handleChange('currentEducation', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Email</label>
            <input className="form-control" value={user.email || ''} disabled />
          </div>
          <div className="apply-field">
  <label>Create / Change Password (Optional)</label>
  <input 
    type="password" 
    className="form-control" 
    placeholder="At least 6 characters" 
    value={profile.password || ''} 
    onChange={(e) => handleChange('password', e.target.value)} 
    minLength={6} 
  />
</div>
          <div className="apply-field">
            <label>Phone Number</label>
            <input className="form-control" value={profile.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Date of birth</label>
            <input type="date" className="form-control" value={profile.dateOfBirth || ''} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Current Age</label>
            <input className="form-control" value={profile.currentAge || ''} onChange={(e) => handleChange('currentAge', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Gender</label>
            <select className="form-select" value={profile.gender || ''} onChange={(e) => handleChange('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="apply-field">
            <label>Nationality</label>
            <input className="form-control" value={profile.nationality || ''} onChange={(e) => handleChange('nationality', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Country of residence</label>
            <input className="form-control" value={profile.countryOfResidence || ''} onChange={(e) => handleChange('countryOfResidence', e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Passport Number</label>
            <input className="form-control" value={profile.passportNumber || ''} onChange={(e) => handleChange('passportNumber', e.target.value)} />
          </div>
          <div className="apply-grid-full">
            <div className="apply-field">
              <label>Current address</label>
              <textarea className="form-control" value={profile.currentAddress || ''} onChange={(e) => handleChange('currentAddress', e.target.value)} />
            </div>
          </div>

          <div className="apply-grid-full">
            <div className="apply-field">
              <label>Skills Set</label>
              <input
                className="form-control"
                placeholder="e.g. Communication, Leadership, Python, Research, Public Speaking"
                value={profile.skills || ''}
                onChange={(e) => handleChange('skills', e.target.value)}
              />
              <small className="text-muted">Separate multiple skills with commas. These appear on your student profile.</small>
            </div>
          </div>
          
          <div className="apply-field">
            <label>Profile Photo</label>
            <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
            
            {currentPhotoUrl ? (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={currentPhotoUrl} 
                  alt="Profile Preview" 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '1px solid #ccc' }} 
                />
              </div>
            ) : (
              <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>No photo uploaded</small>
            )}
          </div>
        </div>

        <div className="apply-form-actions">
          <button type="submit" className="btn apply-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;