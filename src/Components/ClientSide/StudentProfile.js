import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FILE_BASE_URL, studentsAPI } from '../../services/api';
import PageLoader from './PageLoader';
import '../../Css_Folder/StudentProfile.css';

const StudentProfile = () => {
  const { id } = useParams(); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [student, setStudent] = useState({
    name: '',
    email: '',
    occupation: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    phone: '',
    nationality: '',
    residenceCountry: '',
    gender: '',
    birthdate: '',
    passportNumber: '',
    address: '',
    university: '',
    currentEducation: '',
    semester: '',
    age: '',
    skills: []
  });

  // Helper function to calculate age dynamically from Date of Birth
  const calculateAge = (dob) => {
    if (!dob) return '—';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '—';
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const targetId = id; 
        
        if (!targetId) {
          setError('No student ID provided.');
          setLoading(false);
          return;
        }

        const res = await studentsAPI.getById(targetId);
        const data = res.data || {};
        const profile = data.profile || {};

        // Format Date of Birth safely
        const rawDob = profile.dateOfBirth || data.dateOfBirth;
        const formattedDob = rawDob 
          ? new Date(rawDob).toLocaleDateString() 
          : '';
        const computedAge = calculateAge(rawDob);

        // Handle Avatar URL resolution
        const photoSource = profile.profilePhoto || data.profilePhoto;
        let avatarUrl = student.avatar;
        if (photoSource) {
          if (photoSource.startsWith('http') || photoSource.startsWith('data:')) {
            avatarUrl = photoSource;
          } else {
            const cleanBaseUrl = FILE_BASE_URL.endsWith('/') ? FILE_BASE_URL.slice(0, -1) : FILE_BASE_URL;
            const cleanRelativeUrl = photoSource.startsWith('/') ? photoSource : `/${photoSource}`;
            avatarUrl = `${cleanBaseUrl}${cleanRelativeUrl}`;
          }
        }

        // Map DB attributes to state
        setStudent({
          name: data.name || profile.fullName || 'Student Name',
          email: data.email || profile.emailAddress || '',
          occupation: data.occupation || profile.occupation || 'Student',
          phone: profile.phone || profile.contactNumber || data.phone || '',
          nationality: profile.nationality || '',
          residenceCountry: profile.countryOfResidence || data.countryOfResidence || '',
          gender: profile.gender || '',
          birthdate: formattedDob,
          passportNumber: profile.passportNumber || '',
          address: profile.currentAddress || profile.permanentAddress || profile.address || '',
          university: profile.university || profile.institution || '—',
          currentEducation: profile.currentEducation || profile.programInterest?.fieldOfStudy || '—',
          semester: profile.semester || '—',
          age: computedAge,
          skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills ? profile.skills.split(',') : []),
          avatar: avatarUrl,
        });
      } catch (err) {
        setError(err.message || 'Failed to load student profile records.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (isEditing) {
      try {
        // Implement your backend update call here
        // await studentsAPI.update(id, student);
      } catch (err) {
        setError('Failed to update profile details.');
      }
    }
    setIsEditing(!isEditing);
  };

  if (loading) return <PageLoader label="Loading student profile..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="">
      <main className="sp-main-content">

        {/* Profile Header Card */}
        <section className="sp-profile-banner-card">
          <div className="sp-cover-image"></div>
          <div className="sp-profile-main-info">
            <div className="sp-avatar-wrapper">
              <img src={student.avatar} alt={student.name} className="sp-avatar" />
              <label className="sp-avatar-upload-badge" title="Change Avatar">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </label>
            </div>

            <div className="sp-identity-text">
              <div className="sp-name-row">
                <h2>{student.name}</h2>
              </div>
              <p className="sp-role-subtitle">{student.occupation}</p>
              <p className="sp-uni-subtitle">{student.currentEducation}</p>
            </div>

            <div className="sp-quick-stats">
              <div className="sp-stat-box">
                <span className="sp-stat-label">Current Age</span>
                <span className="sp-stat-val">{student.age}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Records Matrix */}
        <div className="sp-card-matrix">
          <div className="sp-matrix-header">
            <h3>Contact & Personal Specifications</h3>
            <span className="sp-matrix-hint">Database Synchronized Record</span>
          </div>

          <div className="sp-matrix-grid">
            
            {/* Phone */}
            <div className="sp-field-cell">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Phone Number</span>
                {isEditing ? (
                  <input type="text" name="phone" value={student.phone} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value">{student.phone || '—'}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="sp-field-cell">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Email Address</span>
                {isEditing ? (
                  <input type="text" name="email" value={student.email} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value">{student.email || '—'}</span>
                )}
              </div>
            </div>

            {/* Nationality */}
            <div className="sp-field-cell">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Nationality</span>
                {isEditing ? (
                  <input type="text" name="nationality" value={student.nationality} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value">{student.nationality || '—'}</span>
                )}
              </div>
            </div>

            {/* Residence Country */}
            <div className="sp-field-cell">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Country of Residence</span>
                {isEditing ? (
                  <input type="text" name="residenceCountry" value={student.residenceCountry} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value">{student.residenceCountry || '—'}</span>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="sp-field-cell">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Gender</span>
                {isEditing ? (
                  <input type="text" name="gender" value={student.gender} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value">{student.gender || '—'}</span>
                )}
              </div>
            </div>

            {/* Birthdate */}
            <div className="sp-field-cell">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Date of Birth</span>
                {isEditing ? (
                  <input type="text" name="birthdate" value={student.birthdate} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value">{student.birthdate || '—'}</span>
                )}
              </div>
            </div>

            {/* Passport Number */}
            <div className="sp-field-cell">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Passport Number</span>
                {isEditing ? (
                  <input type="text" name="passportNumber" value={student.passportNumber} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value sp-mono-badge">{student.passportNumber || '—'}</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="sp-field-cell sp-cell-span-2">
              <div className="sp-cell-icon-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div className="sp-cell-content">
                <span className="sp-label">Residential Address</span>
                {isEditing ? (
                  <input type="text" name="address" value={student.address} onChange={handleChange} className="sp-input" />
                ) : (
                  <span className="sp-value">{student.address || '—'}</span>
                )}
              </div>
            </div>

          </div>

          {/* Technical Skills Footer Panel */}
          {student.skills.length > 0 && (
            <div className="sp-skills-section">
              <h4>Core Engineering Stack & Skills</h4>
              <div className="sp-skills-flex">
                {student.skills.map((skill, idx) => (
                  <span key={idx} className="sp-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
};

export default StudentProfile;