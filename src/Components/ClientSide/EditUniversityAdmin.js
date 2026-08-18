import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../Css_Folder/EditUniversityAdmin.css';  
import '../../Css_Folder/AdminPrograms.css';
import { universitiesAPI } from '../../services/api';
import { resolveStoredImage } from '../../utils/imageUpload';
import PageLoader from './PageLoader';

const emptyForm = {
  universityName: '',
  country: '',
  city: '',
  programCount: "",
  universityType: 'Public',
  status: 'Open',
  link: '',
  logo: '', // Holds either the existing database URL or a local preview object URL
};

const EditUniversityAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null); // Dedicated raw file state for FormData upload
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const loadUniversity = async () => {
      try {
        const res = await universitiesAPI.getById(id);
        const uni = res.data;
        setForm({
          universityName: uni.universityName || '',
          country: uni.country || '',
          city: uni.city || '',
          programCount: uni.programCount ?? 0,
          universityType: uni.universityType || 'Public',
          status: uni.status || 'Open',
          link: uni.link || '',
          logo: uni.logo && uni.logo !== 'default-logo.png' ? uni.logo : '',
        });
      } catch (err) {
        setError(err.message || 'Failed to load university');
      } finally {
        setLoading(false);
      }
    };

    loadUniversity();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'programCount' ? Number(value) : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');

    if (file.size > 5 * 1024 * 1024) {
      setLogoError('File size exceeds 5MB limit');
      return;
    }

    // Save the raw file object for multipart/form-data upload and generate a local preview
    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, logo: previewUrl }));
    e.target.value = '';
  };

  const clearLogo = () => {
    setLogoFile(null);
    setForm((prev) => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      // Build FormData payload to ensure multer handles binary file streaming correctly
      const formData = new FormData();
      formData.append('universityName', form.universityName);
      formData.append('country', form.country);
      formData.append('city', form.city);
      formData.append('programCount', Number(form.programCount) || 0);
      formData.append('universityType', form.universityType);
      formData.append('status', form.status);
      formData.append('link', form.link?.trim() || 'https://airease.com');

      // Append raw logo file only if a new file has been explicitly chosen
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (isEdit) {
        await universitiesAPI.update(id, formData);
        setMessage('University updated successfully');
        setTimeout(() => navigate('/admin/UniversityAdmin'), 800);
      } else {
        await universitiesAPI.create(formData);
        navigate('/admin/UniversityAdmin');
      }
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading university..." />;

  return (
    <div className="admin-page-wrapper admin-programs-page">
      <div className="container">
        <div className="admin-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1>{isEdit ? 'Edit University' : 'Add New University'}</h1>
            <p className="text-muted mb-0">
              {isEdit
                ? 'Update institution profile, logo, and settings.'
                : 'Register a new institution.'}
            </p>
          </div>
          <Link to="/admin/UniversityAdmin" className="btn btn-outline-secondary">
            Back
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="edit-card shadow-sm admin-card-panel">
          <form className="row g-4" onSubmit={handleSubmit}>
            <div className="col-12">
              <label className="form-label">University Logo</label>
              <div className="logo-upload-zone">
                <p className="text-muted small mb-2">
                  Upload PNG or JPG (max 5 MB). Stored in the database and shown across the site.
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="form-control"
                  onChange={handleLogoChange}
                />
                {logoError && <p className="text-danger small mt-2 mb-0">{logoError}</p>}
                {(form.logo || isEdit) && (
                  <div className="logo-preview-wrap justify-content-center">
                    <img src={resolveStoredImage(form.logo)} alt="Logo preview" />
                    {form.logo && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={clearLogo}>
                        Remove logo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="universityName">University Name</label>
              <input
                id="universityName"
                name="universityName"
                type="text"
                className="form-control"
                value={form.universityName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label" htmlFor="country">Country</label>
              <input id="country" name="country" type="text" className="form-control" value={form.country} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label" htmlFor="city">City</label>
              <input id="city" name="city" type="text" className="form-control" value={form.city} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="programCount">Program Count</label>
              <input id="programCount" name="programCount" type="number" className="form-control" value={form.programCount} onChange={handleChange} min={1} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="universityType">University Type</label>
              <select id="universityType" name="universityType" className="form-select" value={form.universityType} onChange={handleChange}>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Semi-Government">Semi-Government</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="status">Status</label>
              <select id="status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="link">Website Link</label>
              <input
                id="link"
                name="link"
                type="url"
                className="form-control"
                value={form.link}
                onChange={handleChange}
                placeholder="https://university-website.edu"
              />
            </div>
            <div className="col-12 mt-4 pt-3 border-top">
              <div className="d-flex justify-content-end gap-3">
                <button type="button" className="btn btn-light px-4" onClick={() => navigate('/admin/UniversityAdmin')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                  {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create University'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUniversityAdmin;