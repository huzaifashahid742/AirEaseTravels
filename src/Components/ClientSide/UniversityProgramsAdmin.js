import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../Css_Folder/AdminPrograms.css';
import { programsAPI, universitiesAPI } from '../../services/api';
import { resolveStoredImage } from '../../utils/imageUpload';
import PageLoader from './PageLoader';

const UniversityProgramsAdmin = () => {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uniRes, progRes] = await Promise.all([
        universitiesAPI.getById(universityId),
        programsAPI.getAll({ universityId, limit: 100 }),
      ]);
      setUniversity(uniRes.data);
      setPrograms(progRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [universityId]);

  const handleDelete = async (programId, name) => {
    if (!window.confirm(`Delete program "${name}"?`)) return;
    try {
      await programsAPI.delete(programId);
      setPrograms((prev) => prev.filter((p) => p._id !== programId));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading) return <PageLoader label="Loading programs..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="admin-programs-page">
      <div className="admin-page-hero">
        <div className="uni-hero-brand">
          <img
            src={resolveStoredImage(university?.logo)}
            alt=""
            className="uni-hero-logo"
          />
          <div>
            <h1>{university?.universityName}</h1>
            <p>
              {university?.city}, {university?.country} · {programs.length} program
              {programs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/admin/UniversityAdmin" className="btn btn-outline-secondary">
            <i className="fa fa-arrow-left me-2 pt-2" />
            Universities
          </Link>
          <Link
            to={`/admin/ProgramsAdminDetail?universityId=${universityId}`}
            className="btn btn-primary"
          >
            <i className="fa fa-plus me-2" />
            Add Program
          </Link>
        </div>
      </div>

      <div className="admin-card-panel">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Program</th>
              <th>Degree</th>
              <th>Field</th>
              <th>Tuition (€)</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  No programs yet. Add the first program for this university.
                </td>
              </tr>
            ) : (
              programs.map((prog, index) => (
                <tr key={prog._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600, color: '#0f2744' }}>{prog.programName}</td>
                  <td>{prog.degree}</td>
                  <td>{prog.field}</td>
                  <td>{prog.tuitionFee?.toLocaleString?.() ?? prog.tuitionFee}</td>
                  <td>
                    <span className={`status-pill ${prog.status?.toLowerCase()}`}>
                      {prog.status}
                    </span>
                  </td>
                  <td className="text-end">
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', whiteSpace: 'nowrap' }}>
    <button
      type="button"
      className="btn btn-sm admin-btn-primary"
      onClick={() => navigate(`/admin/program/${prog._id}/view`)}
    >
      Open
    </button>

    <button
      type="button"
      className="btn btn-sm admin-btn-danger-outline"
      onClick={() => handleDelete(prog._id, prog.programName)}
    >
      Delete
    </button>
  </div>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UniversityProgramsAdmin;
