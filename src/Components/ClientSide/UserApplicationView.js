import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FILE_BASE_URL, visaApplicationsAPI } from '../../services/api';
import { formatApplicationStatus } from '../../utils/applicationStatus';
import PageLoader from './PageLoader';
import '../../Css_Folder/UserDashboard.css';

const docLink = (url) => {
  if (!url) return <span className="text-muted">Not uploaded</span>;
  const href = url.startsWith('http') || url.startsWith('data:')
    ? url
    : `${FILE_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="sd-doc-link">
      View document
    </a>
  );
};

const DetailGrid = ({ title, fields }) => (
  <div className="sd-detail-section">
    <h2>{title}</h2>
    <div className="sd-detail-grid">
      {fields.map((item) => (
        <div key={item.label} className="sd-detail-item">
          <label>{item.label}</label>
          <span>{item.value || '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

const UserApplicationView = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Application not found');
      setLoading(false);
      return;
    }

    visaApplicationsAPI
      .getById(id)
      .then((res) => setApplication(res.data))
      .catch((err) => setError(err.message || 'Failed to load application'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading application..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!application) return <div className="alert alert-warning">Application not found.</div>;

  const p = application.personalInfo || {};
  const a = application.academicBackground || {};
  const prog = application.programInterest || {};
  const lang = application.languageProficiency || {};
  const fin = application.financialAndVisa || {};
  const exp = application.experienceInfo || {};
  const docs = application.attachments || {};

  const personalFields = [
    { label: 'Full name', value: p.fullName || [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') },
    { label: 'CNIC', value: p.cnic },
    { label: 'Email', value: p.emailAddress },
    { label: 'Phone', value: p.contactNumber },
    { label: 'Nationality', value: p.nationality },
    { label: 'Country of residence', value: p.countryOfResidence },
    { label: 'Gender', value: p.gender },
    { label: 'Date of birth', value: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : null },
    { label: 'Passport number', value: p.passportNumber },
    // { label: 'Permanent address', value: p.permanentAddress },
    { label: 'Current address', value: p.currentAddress },
  ];

  const programFields = [
    { label: 'Program', value: application.programName },
    { label: 'University', value: application.universityName },
    { label: 'Program type', value: prog.programType },
    { label: 'Field of study', value: prog.fieldOfStudy },
    { label: 'Interested country', value: prog.interestedCountry },
    { label: 'Intake', value: prog.intakeSeason },
    { label: 'Mode of study', value: prog.modeOfStudy },
  ];

  const educationFields = [
    { label: 'High school', value: a.highSchoolName },
    { label: 'Board / University', value: a.boardOrUniversity },
    { label: 'GPA / Percentage', value: a.gpaOrPercentage },
    { label: 'Year of graduation', value: a.yearOfGraduation },
  ];

  const languageFields = [
    { label: 'English test', value: lang.examType },
    { label: 'Score', value: lang.score },
    { label: 'Exam date / expiry', value: lang.examDateOrExpiry },
  ];

  const financialFields = [
    { label: 'Funding source', value: fin.fundingSource },
    { label: 'Passport expiry', value: fin.passportExpiryDate ? new Date(fin.passportExpiryDate).toLocaleDateString() : null },
  ];

  const experienceFields = [
    { label: 'Internships / projects', value: exp.internshipsOrProjects },
    { label: 'Extracurricular / leadership', value: exp.extracurricularAndLeadership },
    { label: 'Volunteer experience', value: exp.volunteerExperience },
  ];

  const documentItems = [
    { title: 'Resume / CV', value: docs.resumeCv },
    { title: 'Statement of Purpose', value: docs.statementOfPurpose },
    { title: 'Passport copy', value: docs.passportCopyUpload },
    { title: 'National ID proof', value: docs.nationalIdProof },
    { title: 'Academic transcript', value: a.transcriptUpload },
    ...(lang.examType && lang.examType !== 'Not Required'
      ? [{ title: `${lang.examType} result`, value: lang.IELTSresult }]
      : []),
    ...(a.schools || []).map((school, index) => ({
      title: `Additional record ${index + 1} result`,
      value: school.resultUpload,
    })),
  ];

  return (
    <div>
      <div className="sd-view-header">
        <div>
          <Link to="/user/applications" className="sd-back-link">
            <i className="fa fa-arrow-left" /> Back to applications
          </Link>
          <h1>{application.programName || 'Application details'}</h1>
          <p className="text-muted mb-0">
            {application.universityName || 'University'} · Submitted{' '}
            {application.submittedAt
              ? new Date(application.submittedAt).toLocaleDateString()
              : new Date(application.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <span className="sd-badge-done">{formatApplicationStatus(application.applicationStatus)}</span>
      </div>

      <DetailGrid title="Personal information" fields={personalFields} />
      <DetailGrid title="Program interest" fields={programFields} />
      <DetailGrid title="Education" fields={educationFields} />

      {(a.schools || []).length > 0 && (
        <div className="sd-detail-section">
          <h2>Additional academic records</h2>
          {(a.schools || []).map((school, index) => (
            <div key={index} className="sd-school-card">
              <strong>Record {index + 1}</strong>
              <p>{school.schoolName} · {school.boardOrUniversity} · {school.graduationYear} · {school.gpaOrPercentage}</p>
              {school.resultUpload && (
                <p className="mb-0 mt-1">{docLink(school.resultUpload)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <DetailGrid title="Language proficiency" fields={languageFields} />
      <DetailGrid title="Financial & visa" fields={financialFields} />
      <DetailGrid title="Experience" fields={experienceFields} />

      <div className="sd-detail-section">
        <h2>Documents</h2>
        <div className="sd-doc-grid">
          {documentItems.map((item) => (
            <div key={item.title} className="sd-doc-card">
              <h3>{item.title}</h3>
              {docLink(item.value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserApplicationView;
