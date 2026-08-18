import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import '../../Css_Folder/EditUniversityAdmin.css';
import '../../Css_Folder/AdminPrograms.css';
import { programsAPI, universitiesAPI } from '../../services/api';
import PageLoader from './PageLoader';

const emptyForm = {
  programName: '',
  universityId: '',
  tuitionFee: "",
  duration: '',
  degree: 'Bachelor',
  field: 'Computer Science & Engineering',
  language: 'English',
  ieltsRequirement: '6.0',
  status: 'Active',
  applicationDeadline: '',
  intake: 'Fall',
};

const ProgramForm = ({ isEdit: isEditProp }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetUniversityId = searchParams.get('universityId') || '';
  const navigate = useNavigate();
  const isEdit = isEditProp ?? Boolean(id);

  const [form, setForm] = useState({ ...emptyForm, universityId: presetUniversityId });
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const activeUniversityId = form.universityId || presetUniversityId;
  const programsListPath = activeUniversityId
    ? `/admin/university/${activeUniversityId}/programs`
    : '/admin/UniversityAdmin';

  useEffect(() => {
    const loadData = async () => {
      try {
        const uniRes = await universitiesAPI.getAll({ limit: 100 });
        setUniversities(uniRes.data || []);

        if (isEdit && id) {
          const progRes = await programsAPI.getById(id);
          const p = progRes.data;
          const uniId = p.universityId?._id || p.universityId || '';
          setForm({
            programName: p.programName || '',
            universityId: uniId,
            tuitionFee: p.tuitionFee ?? 0,
            duration: p.duration || '',
            degree: p.degree || 'Bachelor',
            field: p.field || 'Computer Science & Engineering',
            language: p.language || 'English',
            ieltsRequirement: p.ieltsRequirement || '6.0',
            status: p.status || 'Active',
            applicationDeadline: p.applicationDeadline
              ? new Date(p.applicationDeadline).toISOString().split('T')[0]
              : '',
            intake: p.intake || 'Fall',
          });
        } else if (presetUniversityId) {
          setForm((prev) => ({ ...prev, universityId: presetUniversityId }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit, presetUniversityId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'tuitionFee' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    if (!form.universityId) {
      setError('Please select a university');
      setSubmitting(false);
      return;
    }
    const selectedYear = new Date(form.applicationDeadline).getFullYear().toString();
    if (selectedYear.length !== 4 || !/^\d{4}$/.test(selectedYear)) {
        setError('Application deadline year must be only 4 digits long no more');
        setSubmitting(false);
        return;
    }

    try {
      const payload = {
        programName: form.programName,
        universityId: form.universityId,
        tuitionFee: Number(form.tuitionFee),
        duration: form.duration,
        degree: form.degree,
        field: form.field,
        language: form.language,
        ieltsRequirement: form.ieltsRequirement,
        status: form.status,
        intake: form.intake,
        applicationDeadline: new Date(form.applicationDeadline).toISOString(),
      };

      if (isEdit && id) {
        await programsAPI.update(id, payload);
        setMessage('Program updated successfully');
        setTimeout(() => navigate(`/admin/program/${id}/view`), 600);
      } else {
        await programsAPI.create(payload);
        navigate(`/admin/university/${form.universityId}/programs`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save program');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading program form..." />;

  const selectedUniversity = universities.find((u) => u._id === activeUniversityId);

  return (
    <div className="admin-page-wrapper admin-programs-page">
      <div className="container">
        <div className="admin-page-hero">
          <div>
            <h1>{isEdit ? 'Edit Program' : 'Add New Program'}</h1>
            <p className="text-muted">
              {selectedUniversity
                ? `For ${selectedUniversity.universityName}`
                : 'Select a university and complete the program details.'}
            </p>
          </div>
          <Link to={programsListPath} className="btn btn-outline-secondary">
            <i className="fa fa-arrow-left me-2" />
            {activeUniversityId ? 'View all programs' : 'Back'}
          </Link>
        </div>
        

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="edit-card shadow-sm admin-card-panel">
          <form className="row g-4" onSubmit={handleSubmit}>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="programName">Program Name</label>
              <input
                id="programName"
                name="programName"
                type="text"
                className="form-control"
                value={form.programName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="universityId">University</label>
              <select
                id="universityId"
                name="universityId"
                className="form-select"
                value={form.universityId}
                onChange={handleChange}
                required
                disabled={Boolean(presetUniversityId && !isEdit)}
              >
                <option value="">Select university</option>
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.universityName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="field">Field of Study</label>
              <select id="field" name="field" className="form-select" value={form.field} onChange={handleChange}>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Business & Management">Business & Management</option>
                <option value="Medicine & Healthcare">Medicine & Healthcare</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Arts & Humanities">Arts & Humanities</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="language">Language</label>
              <select id="language" name="language" className="form-select" value={form.language} onChange={handleChange}>
                <option value="English">English</option>
                <option value="Italian">Italian</option>
                <option value="German">German</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="duration">Duration</label>
              <input id="duration" name="duration" type="text" className="form-control" value={form.duration} onChange={handleChange} placeholder="e.g. 3 Years" required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="tuitionFee">Tuition Fees (€)</label>
              <input id="tuitionFee" name="tuitionFee" type="number" className="form-control" value={form.tuitionFee} onChange={handleChange} min={0} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="ieltsRequirement">IELTS Requirement</label>
              <select id="ieltsRequirement" name="ieltsRequirement" className="form-select" value={form.ieltsRequirement} onChange={handleChange}>
                <option value="No Exam Required">No Exam Required</option>
                <option value="5.5">5.5</option>
                <option value="6.0">6.0</option>
                <option value="6.5">6.5</option>
                <option value="7.0">7.0</option>
                <option value="7.5+">7.5+</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="applicationDeadline">Application Deadline</label>
              <input id="applicationDeadline" name="applicationDeadline" type="date" className="form-control" value={form.applicationDeadline} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="intake">Intake</label>
              <select id="intake" name="intake" className="form-select" value={form.intake} onChange={handleChange}>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="degree">Degree</label>
              <select id="degree" name="degree" className="form-select" value={form.degree} onChange={handleChange}>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="status">Status</label>
              <select id="status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="col-12 mt-4 pt-3 border-top">
              <div className="d-flex justify-content-end gap-3">
                <button type="button" className="btn btn-light px-4" onClick={() => navigate(programsListPath)}>
                  Cancel
                </button>
                {isEdit && id && (
                  <button
                    type="button"
                    className="btn btn-outline-primary px-4"
                    onClick={() => navigate(`/admin/program/${id}/view`)}
                  >
                    View details
                  </button>
                )}
                <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                  {submitting ? 'Saving...' : isEdit ? 'Update Program' : 'Save Program'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgramForm;