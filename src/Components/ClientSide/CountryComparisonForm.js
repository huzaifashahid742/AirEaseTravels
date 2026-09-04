// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../Context/AuthContext';
// import { countryDetailsAPI } from '../../services/api';
// import CountryComparison from "../../Css_Folder/CountryComparison.css"

// const CountryComparisonForm = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // Detect if an existing entry is passed for modification
//   const editData = location.state?.editData;
//   const isEditMode = !!editData;

//   const [formData, setFormData] = useState({
//     countryName: '',
//     flagImage: '',
//     tuitionFees: '',
//     costOfLiving: '',
//     scholarshipAvailable: 'Fully Funded',
//     workRight: '',  
//     visaDifficulty: 'Easy',
//     intakeSeasons: [],
//     prSettlement: '',
//     studentSalary: '',
//     rating: '5',
//     acceptanceRate: ''
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   // If in edit mode, pre-hydrate form state values
//   useEffect(() => {
//     if (isEditMode && editData) {
//       setFormData({
//         countryName: editData.countryName || '',
//         flagImage: editData.flagImage || '',
//         tuitionFees: editData.tuitionFees !== undefined ? editData.tuitionFees : '',
//         costOfLiving: editData.costOfLiving !== undefined ? editData.costOfLiving : '',
//         scholarshipAvailable: editData.scholarshipAvailable || 'Fully Funded',
//         workRight: editData.workRight || '',
//         visaDifficulty: editData.visaDifficulty || 'Easy',
//         intakeSeasons: Array.isArray(editData.intakeSeasons) ? editData.intakeSeasons : [],
//         prSettlement: editData.prSettlement || '',
//         studentSalary: editData.studentSalary || '',
//         rating: editData.rating ? String(editData.rating) : '5',
//         acceptanceRate: editData.acceptanceRate || ''
//       });
//     }
//   }, [isEditMode, editData]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (e) => {
//     const { value, checked } = e.target;
//     setFormData((prev) => {
//       const currentSeasons = [...prev.intakeSeasons];
//       if (checked) {
//         return { ...prev, intakeSeasons: [...currentSeasons, value] };
//       } else {
//         return { ...prev, intakeSeasons: currentSeasons.filter((item) => item !== value) };
//       }
//     });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({
//         ...prev,
//         flagImage: file // Store raw file object for FormData
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess(false);

//     if (formData.intakeSeasons.length === 0) {
//       setError('At least one intake season must be selected.');
//       return;
//     }

//     // Use FormData for multipart file uploads
//     const data = new FormData();
//     data.append('countryName', formData.countryName);
    
//     if (formData.flagImage instanceof File) {
//       data.append('flagImage', formData.flagImage);
//     }
    
//     data.append('tuitionFees', Number(formData.tuitionFees));
//     data.append('costOfLiving', Number(formData.costOfLiving));
//     data.append('scholarshipAvailable', formData.scholarshipAvailable);
//     data.append('workRight', formData.workRight);
//     data.append('visaDifficulty', formData.visaDifficulty);
    
//     // Append each item in the intakeSeasons array individually
//     formData.intakeSeasons.forEach((season) => {
//       data.append('intakeSeasons', season);
//     });

//     data.append('prSettlement', formData.prSettlement);
//     data.append('studentSalary', formData.studentSalary);
//     data.append('rating', Number(formData.rating));
//     data.append('acceptanceRate', formData.acceptanceRate);
    
//     const creatorId = user?._id || user?.id;
//     if (creatorId) {
//       data.append('createdBy', creatorId);
//     }

//     try {
//       if (isEditMode) {
//         // Trigger PUT request with FormData
//         await countryDetailsAPI.update(editData._id, data);
//         setSuccess(true);
//         setTimeout(() => navigate('/University_Comparisons'), 1500);
//       } else {
//         // Trigger standard POST request with FormData
//         await countryDetailsAPI.create(data);
//         setSuccess(true);
//         setFormData({
//           countryName: '',
//           flagImage: '',
//           tuitionFees: '',
//           costOfLiving: '',
//           scholarshipAvailable: 'Fully Funded',
//           workRight: '',
//           visaDifficulty: 'Easy',
//           intakeSeasons: [],
//           prSettlement: '',
//           studentSalary: '',
//           rating: '5',
//           acceptanceRate: ''
//         });
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to submit comparison profile');
//     }
//   };

//   return (
//     <div className="admin-page-container" style={{ padding: '2rem 3rem', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
//         <div>
//           <h1 style={{ fontSize: '2rem', color: '#1a365d', fontWeight: 'bold', margin: 0 }}>
//             {isEditMode ? `Modify ${editData?.countryName || 'Country'}` : 'Add Country Comparison'}
//           </h1>
//           <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.25rem' }}>
//             {isEditMode ? 'Update existing comparison indicators for this profile.' : 'Register comparison metrics.'}
//           </p>
//         </div>
//         <button 
//           type="button" 
//           onClick={() => navigate(-1)} 
//           style={{ padding: '0.5rem 1.25rem', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '6px', color: '#4a5568', cursor: 'pointer', fontSize: '0.875rem' }}
//         >
//           Back
//         </button>
//       </div>

//       <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '2.5rem', border: '1px solid #e2e8f0' }}>
//         {success && (
//           <div style={{ color: '#2f855a', backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
//             Country profile {isEditMode ? 'updated' : 'added'} successfully! {isEditMode && 'Redirecting...'}
//           </div>
//         )}
//         {error && <div style={{ color: '#c53030', backgroundColor: '#fff5f5', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

//         <form onSubmit={handleSubmit}>
//           {/* Flag Image Dropzone */}
//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Country Flag</label>
//             <div style={{ border: '1px dashed #cbd5e0', borderRadius: '6px', padding: '1.5rem', textAlign: 'center', backgroundColor: '#fafbfc', cursor: 'pointer', position: 'relative' }}>
//               <span style={{ fontSize: '0.85rem', color: '#718096', display: 'block', marginBottom: '0.75rem' }}>Upload PNG or JPG (max 5 MB). Stored in the database and shown across the site.</span>
//               <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', maxWidth: '100%', backgroundColor: '#fff' }}>
//                 <span style={{ backgroundColor: '#f7fafc', padding: '0.5rem 1rem', borderRight: '1px solid #e2e8f0', color: '#4a5568', fontSize: '0.85rem' }}>Choose File</span>
//                 <span style={{ padding: '0.5rem 1rem', color: formData.flagImage ? '#2d3748' : '#a0aec0', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                   {formData.flagImage 
//                     ? (formData.flagImage instanceof File ? formData.flagImage.name : formData.flagImage) 
//                     : 'No file chosen'}
//                 </span>
//               </div>
//               <input 
//                 type="file" 
//                 accept="image/png, image/jpeg" 
//                 onChange={handleFileChange} 
//                 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
//               />
//             </div>
//           </div>

//           {/* Row 1: Country Name, Annual Tuition, Cost of Living */}
//           <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Country Name</label>
//               <input type="text" name="countryName" value={formData.countryName} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', boxSizing: 'border-box' }} />
//             </div>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Tuition Fees (Annual)</label>
//               <input type="number" name="tuitionFees" min="0" value={formData.tuitionFees} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', boxSizing: 'border-box' }} />
//             </div>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Cost of Living (Annual)</label>
//               <input type="number" name="costOfLiving" min="0" value={formData.costOfLiving} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', boxSizing: 'border-box' }} />
//             </div>
//           </div>

//           {/* Row 2: Scholarship Available, Visa Difficulty, Dynamic Score */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Scholarship Available</label>
//               <select name="scholarshipAvailable" value={formData.scholarshipAvailable} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
//                 <option value="Fully Funded">Fully Funded</option>
//                 <option value="Partial Scholarship">Partial Scholarship</option>
//                 <option value="Not Available">Not Available</option>
//               </select>
//             </div>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Visa Difficulty</label>
//               <select name="visaDifficulty" value={formData.visaDifficulty} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
//                 <option value="Easy">Easy</option>
//                 <option value="Medium">Medium</option>
//                 <option value="Hard">Hard</option>
//               </select>
//             </div>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Rating Score ({formData.rating}.0)</label>
//               <select name="rating" value={formData.rating} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
//                 <option value="1">1.0 Star</option>
//                 <option value="2">2.0 Stars</option>
//                 <option value="3">3.0 Stars</option>
//                 <option value="4">4.0 Stars</option>
//                 <option value="5">5.0 Stars</option>
//               </select>
//             </div>
//           </div>

//           {/* Row 3: Part-Time Salary, Acceptance Rate, Intake Checkboxes */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Student Salary (Part-Time)</label>
//               <input type="text" name="studentSalary" placeholder="e.g., $15-$22 / hr" value={formData.studentSalary} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', boxSizing: 'border-box' }} />
//             </div>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Average Acceptance Rate</label>
//               <input type="text" name="acceptanceRate" placeholder="e.g., 72%" value={formData.acceptanceRate} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', boxSizing: 'border-box' }} />
//             </div>
//             <div>
//               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Intake Seasons</label>
//               <div style={{ display: 'flex', gap: '1.25rem', paddingTop: '0.6rem' }}>
//                 <label style={{ fontSize: '0.9rem', color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
//                   <input type="checkbox" value="Fall" checked={formData.intakeSeasons.includes('Fall')} onChange={handleCheckboxChange} style={{ transform: 'scale(1.15)' }} /> Fall
//                 </label>
//                 <label style={{ fontSize: '0.9rem', color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
//                   <input type="checkbox" value="Spring" checked={formData.intakeSeasons.includes('Spring')} onChange={handleCheckboxChange} style={{ transform: 'scale(1.15)' }} /> Spring
//                 </label>
//                  <label style={{ fontSize: '0.9rem', color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
//                   <input type="checkbox" value="Winter" checked={formData.intakeSeasons.includes('Winter')} onChange={handleCheckboxChange} style={{ transform: 'scale(1.15)' }} /> Winter
//                 </label>
//                  <label style={{ fontSize: '0.9rem', color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
//                   <input type="checkbox" value="Summer" checked={formData.intakeSeasons.includes('Summer')} onChange={handleCheckboxChange} style={{ transform: 'scale(1.15)' }} /> Summer
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>Work Rights Description</label>
//             <input type="text" name="workRight" placeholder="Provide working terms, visa hour caps etc." value={formData.workRight} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', boxSizing: 'border-box' }} />
//           </div>

//           <div style={{ marginBottom: '2.5rem' }}>
//             <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>PR / Permanent Settlement Outlook</label>
//             <input type="text" name="prSettlement" placeholder="Describe naturalization routes or post-study stream availability..." value={formData.prSettlement} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e0', borderRadius: '6px', boxSizing: 'border-box' }} />
//           </div>

//           {/* Form Action Controls Layout */}
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
//             <button 
//               type="button" 
//               onClick={() => navigate(-1)} 
//               style={{ padding: '0.6rem 1.5rem', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '6px', color: '#4a5568', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit" 
//               style={{ padding: '0.6rem 1.5rem', backgroundColor: '#1d4ed8', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}
//             >
//               {isEditMode ? 'Save Changes' : 'Create Comparison'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CountryComparisonForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { countryDetailsAPI } from '../../services/api';
import '../../Css_Folder/CountryComparison.css';

const CountryComparisonForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if an existing entry is passed for modification
  const editData = location.state?.editData;
  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    countryName: '',
    flagImage: '',
    tuitionFees: '',
    costOfLiving: '',
    scholarshipAvailable: 'Fully Funded',
    workRight: '',  
    visaDifficulty: 'Easy',
    intakeSeasons: [],
    prSettlement: '',
    studentSalary: '',
    rating: '5',
    acceptanceRate: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If in edit mode, pre-hydrate form state values
  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        countryName: editData.countryName || '',
        flagImage: editData.flagImage || '',
        tuitionFees: editData.tuitionFees !== undefined ? editData.tuitionFees : '',
        costOfLiving: editData.costOfLiving !== undefined ? editData.costOfLiving : '',
        scholarshipAvailable: editData.scholarshipAvailable || 'Fully Funded',
        workRight: editData.workRight || '',
        visaDifficulty: editData.visaDifficulty || 'Easy',
        intakeSeasons: Array.isArray(editData.intakeSeasons) ? editData.intakeSeasons : [],
        prSettlement: editData.prSettlement || '',
        studentSalary: editData.studentSalary || '',
        rating: editData.rating ? String(editData.rating) : '5',
        acceptanceRate: editData.acceptanceRate || ''
      });
    }
  }, [isEditMode, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentSeasons = [...prev.intakeSeasons];
      if (checked) {
        return { ...prev, intakeSeasons: [...currentSeasons, value] };
      } else {
        return { ...prev, intakeSeasons: currentSeasons.filter((item) => item !== value) };
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        flagImage: file // Store raw file object for FormData
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.intakeSeasons.length === 0) {
      setError('At least one intake season must be selected.');
      return;
    }

    // Use FormData for multipart file uploads
    const data = new FormData();
    data.append('countryName', formData.countryName);
    
    if (formData.flagImage instanceof File) {
      data.append('flagImage', formData.flagImage);
    }
    
    data.append('tuitionFees', Number(formData.tuitionFees));
    data.append('costOfLiving', Number(formData.costOfLiving));
    data.append('scholarshipAvailable', formData.scholarshipAvailable);
    data.append('workRight', formData.workRight);
    data.append('visaDifficulty', formData.visaDifficulty);
    
    // Append each item in the intakeSeasons array individually
    formData.intakeSeasons.forEach((season) => {
      data.append('intakeSeasons', season);
    });

    data.append('prSettlement', formData.prSettlement);
    data.append('studentSalary', formData.studentSalary);
    data.append('rating', Number(formData.rating));
    data.append('acceptanceRate', formData.acceptanceRate);
    
    const creatorId = user?._id || user?.id;
    if (creatorId) {
      data.append('createdBy', creatorId);
    }

    try {
      if (isEditMode) {
        // Trigger PUT request with FormData
        await countryDetailsAPI.update(editData._id, data);
        setSuccess(true);
        setTimeout(() => navigate('/University_Comparisons'), 1500);
      } else {
        // Trigger standard POST request with FormData
        await countryDetailsAPI.create(data);
        setSuccess(true);
        setFormData({
          countryName: '',
          flagImage: '',
          tuitionFees: '',
          costOfLiving: '',
          scholarshipAvailable: 'Fully Funded',
          workRight: '',
          visaDifficulty: 'Easy',
          intakeSeasons: [],
          prSettlement: '',
          studentSalary: '',
          rating: '5',
          acceptanceRate: ''
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit comparison profile');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header Bar */}
      <div className="page-header">
        <div className="header-title">
          <h1>
            {isEditMode ? `Modify ${editData?.countryName || 'Country'}` : 'Add Country Comparison'}
          </h1>
          <p>
            {isEditMode ? 'Update existing comparison indicators for this profile.' : 'Register comparison metrics.'}
          </p>
        </div>
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="btn btn-secondary"
        >
          Back
        </button>
      </div>

      {/* Form Container Card */}
      <div className="form-card">
        {success && (
          <div className="alert alert-success">
            Country profile {isEditMode ? 'updated' : 'added'} successfully! {isEditMode && 'Redirecting...'}
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Flag Image Dropzone */}
          <div className="form-group">
            <label className="form-label">Country Flag</label>
            <div className="dropzone">
              <span className="dropzone-help">
                Upload PNG or JPG (max 5 MB). Stored in the database and shown across the site.
              </span>
              <div className="file-picker-display">
                <span className="file-picker-btn">Choose File</span>
                <span className="file-picker-text">
                  {formData.flagImage 
                    ? (formData.flagImage instanceof File ? formData.flagImage.name : formData.flagImage) 
                    : 'No file chosen'}
                </span>
              </div>
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange} 
                className="file-input-overlay" 
              />
            </div>
          </div>

          {/* Row 1: Country Name, Annual Tuition, Cost of Living */}
          <div className="form-grid grid-col-3-unequal">
            <div className="form-group">
              <label className="form-label">Country Name</label>
              <input 
                type="text" 
                name="countryName" 
                value={formData.countryName} 
                onChange={handleChange} 
                required 
                className="form-control" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tuition Fees (Annual)</label>
              <input 
                type="number" 
                name="tuitionFees" 
                min="0" 
                value={formData.tuitionFees} 
                onChange={handleChange} 
                required 
                className="form-control" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost of Living (Annual)</label>
              <input 
                type="number" 
                name="costOfLiving" 
                min="0" 
                value={formData.costOfLiving} 
                onChange={handleChange} 
                required 
                className="form-control" 
              />
            </div>
          </div>

          {/* Row 2: Scholarship Available, Visa Difficulty, Rating Score */}
          <div className="form-grid grid-col-3">
            <div className="form-group">
              <label className="form-label">Scholarship Available</label>
              <select 
                name="scholarshipAvailable" 
                value={formData.scholarshipAvailable} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Fully Funded">Fully Funded</option>
                <option value="Partial Scholarship">Partial Scholarship</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Visa Difficulty</label>
              <select 
                name="visaDifficulty" 
                value={formData.visaDifficulty} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating Score ({formData.rating}.0)</label>
              <select 
                name="rating" 
                value={formData.rating} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="1">1.0 Star</option>
                <option value="2">2.0 Stars</option>
                <option value="3">3.0 Stars</option>
                <option value="4">4.0 Stars</option>
                <option value="5">5.0 Stars</option>
              </select>
            </div>
          </div>

          {/* Row 3: Part-Time Salary, Acceptance Rate, Intake Checkboxes */}
          <div className="form-grid grid-col-3">
            <div className="form-group">
              <label className="form-label">Student Salary (Part-Time)</label>
              <input 
                type="text" 
                name="studentSalary" 
                placeholder="e.g., $15-$22 / hr" 
                value={formData.studentSalary} 
                onChange={handleChange} 
                required 
                className="form-control" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Average Acceptance Rate</label>
              <input 
                type="text" 
                name="acceptanceRate" 
                placeholder="e.g., 72%" 
                value={formData.acceptanceRate} 
                onChange={handleChange} 
                required 
                className="form-control" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Intake Seasons</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    value="Fall" 
                    checked={formData.intakeSeasons.includes('Fall')} 
                    onChange={handleCheckboxChange} 
                  /> 
                  Fall
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    value="Spring" 
                    checked={formData.intakeSeasons.includes('Spring')} 
                    onChange={handleCheckboxChange} 
                  /> 
                  Spring
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    value="Winter" 
                    checked={formData.intakeSeasons.includes('Winter')} 
                    onChange={handleCheckboxChange} 
                  /> 
                  Winter
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    value="Summer" 
                    checked={formData.intakeSeasons.includes('Summer')} 
                    onChange={handleCheckboxChange} 
                  /> 
                  Summer
                </label>
              </div>
            </div>
          </div>

          {/* Work Rights */}
          <div className="form-group">
            <label className="form-label">Work Rights Description</label>
            <input 
              type="text" 
              name="workRight" 
              placeholder="Provide working terms, visa hour caps etc." 
              value={formData.workRight} 
              onChange={handleChange} 
              required 
              className="form-control" 
            />
          </div>

          {/* Permanent Settlement */}
          <div className="form-group group-spaced">
            <label className="form-label">PR / Permanent Settlement Outlook</label>
            <input 
              type="text" 
              name="prSettlement" 
              placeholder="Describe naturalization routes or post-study stream availability..." 
              value={formData.prSettlement} 
              onChange={handleChange} 
              required 
              className="form-control" 
            />
          </div>

          {/* Form Action Controls */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              {isEditMode ? 'Save Changes' : 'Create Comparison'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CountryComparisonForm;