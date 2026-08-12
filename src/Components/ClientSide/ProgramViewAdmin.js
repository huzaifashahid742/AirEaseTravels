import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../Css_Folder/AdminPrograms.css';
import { programsAPI } from '../../services/api';
import { resolveStoredImage } from '../../utils/imageUpload';
import PageLoader from './PageLoader';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const ProgramViewAdmin = () => {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await programsAPI.getById(id);
        setProgram(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load program');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <PageLoader label="Loading program details..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;
  if (!program) return null;

  const university = program.universityId;
  const uniId = university?._id || program.universityId;
  const statusClass = program.status?.toLowerCase() || 'active';

  const fields = [
    { label: 'University', value: university?.universityName || '—' },
    { label: 'Location', value: university ? `${university.city}, ${university.country}` : '—' },
    { label: 'Field of Study', value: program.field },
    { label: 'Degree', value: program.degree },
    { label: 'Duration', value: program.duration },
    { label: 'Language', value: program.language },
    { label: 'Tuition Fee', value: `€${Number(program.tuitionFee || 0).toLocaleString()}` },
    { label: 'IELTS Requirement', value: program.ieltsRequirement },
    { label: 'Intake', value: program.intake },
    { label: 'Application Deadline', value: formatDate(program.applicationDeadline) },
    { label: 'Status', value: program.status },
    { label: 'Created', value: formatDate(program.createdAt) },
  ];

  return (
    <div className="admin-programs-page">
      <div className="admin-page-hero">
        <div>
          <p className="text-muted small mb-1">Program overview</p>
          <h1>{program.programName}</h1>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {uniId && (
            <Link
              to={`/admin/university/${uniId}/programs`}
              className="btn btn-outline-secondary"
            >
              <i className="fa fa-arrow-left me-2 pt-2" />
              All programs
            </Link>
          )}
          <Link
            to={`/admin/ProgramsAdminDetail/${id}`}
            className="btn btn-primary"
          >
            <i className="fa fa-pen me-2" />
            Edit program
          </Link>
        </div>
      </div>

      <div className="admin-card-panel program-detail-card">
        <div className="program-detail-header">
          <div className="d-flex align-items-center gap-3">
            {university && (
              <img
                src={resolveStoredImage(university.logo)}
                alt=""
                className="uni-hero-logo"
              />
            )}
            <div>
              <h2>{program.programName}</h2>
              <p className="text-muted mb-0 small">
                {university?.universityName}
              </p>
            </div>
          </div>
          <span className={`status-pill ${statusClass}`}>{program.status}</span>
        </div>

        <div className="program-detail-grid">
          {fields.map((item) => (
            <div key={item.label} className="program-detail-item">
              <label>{item.label}</label>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramViewAdmin;
