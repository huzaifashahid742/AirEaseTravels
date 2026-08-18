import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FILE_BASE_URL, visaApplicationsAPI, studentsAPI } from '../../services/api';
import { formatApplicationStatus } from '../../utils/applicationStatus';
import PageLoader from './PageLoader';
import '../../Css_Folder/UserDashboard.css';
import '../../Css_Folder/StudentProfile.css';

const docLink = (url) => {
  if (!url) return <span className="doc-missing">Missing</span>;
  const href = url.startsWith('http') || url.startsWith('data:')
    ? url
    : `${FILE_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="doc-link-btn">
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      Open File
    </a>
  );
};

const EnterpriseDetailGrid = ({ title, tag, fields }) => (
  <div className="data-card">
    <div className="card-header">
      <div className="card-title-group">
        <h3>{title}</h3>
        {tag && <span className="header-tag">{tag}</span>}
      </div>
    </div>
    <div className="table-grid">
      {fields.map((item) => (
        <div key={item.label} className={`cell ${!item.value ? 'empty-cell' : ''}`}>
          <span className="cell-label">{item.label}</span>
          <span className="cell-value">{item.value || '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

const calculateAge = (dob) => {
  if (!dob) return '—';
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return '—';
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const UnifiedApplicationView = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!id) {
        setError('Application identifier not found.');
        setLoading(false);
        return;
      }

      try {
        const appRes = await visaApplicationsAPI.getById(id);
        const appData = appRes.data || {};
        setApplication(appData);

        const studentId = appData.studentId || appData.userId || id;
        try {
          const studentRes = await studentsAPI.getById(studentId);
          const sData = studentRes.data || {};
          const profile = sData.profile || {};

          const rawDob = profile.dateOfBirth || sData.dateOfBirth;
          const photoSource = profile.profilePhoto || sData.profilePhoto;
          
          let avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';
          if (photoSource) {
            if (photoSource.startsWith('http') || photoSource.startsWith('data:')) {
              avatarUrl = photoSource;
            } else {
              const cleanBaseUrl = FILE_BASE_URL.endsWith('/') ? FILE_BASE_URL.slice(0, -1) : FILE_BASE_URL;
              const cleanRelativeUrl = photoSource.startsWith('/') ? photoSource : `/${photoSource}`;
              avatarUrl = `${cleanBaseUrl}${cleanRelativeUrl}`;
            }
          }

          setStudent({
            name: sData.name || profile.fullName || 'Candidate Name',
            email: sData.email || profile.emailAddress || '',
            occupation: sData.occupation || profile.occupation || 'Consultancy Candidate',
            phone: profile.phone || profile.contactNumber || sData.phone || '',
            nationality: profile.nationality || '',
            residenceCountry: profile.countryOfResidence || sData.countryOfResidence || '',
            gender: profile.gender || '',
            birthdate: rawDob ? new Date(rawDob).toLocaleDateString() : '',
            passportNumber: profile.passportNumber || '',
            address: profile.currentAddress || profile.permanentAddress || profile.address || '',
            university: profile.university || profile.institution || '—',
            currentEducation: profile.currentEducation || profile.programInterest?.fieldOfStudy || '—',
            semester: profile.semester || '—',
            age: calculateAge(rawDob),
            skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills ? profile.skills.split(',') : []),
            avatar: avatarUrl,
          });
        } catch (studentErr) {
          console.warn('Secondary profile sync skipped:', studentErr);
        }

      } catch (err) {
        setError(err.message || 'Failed to retrieve database application record.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [id]);

  if (loading) return <PageLoader label="Synchronizing records..." />;
  if (error) return <div className="alert error-alert"><span>System Error:</span> {error}</div>;
  if (!application) return <div className="alert warning-alert">Application dossier not found in system logs.</div>;

  const p = application.personalInfo || {};
  const a = application.academicBackground || {};
  const prog = application.programInterest || {};
  const lang = application.languageProficiency || {};
  const fin = application.financialAndVisa || {};
  const exp = application.experienceInfo || {};
  const docs = application.attachments || {};

  const personalFields = [
    { label: 'Full Legal Name', value: p.fullName || [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') },
    { label: 'National ID / CNIC', value: p.cnic },
    { label: 'Primary Email', value: p.emailAddress },
    { label: 'Mobile Line', value: p.contactNumber },
    { label: 'Nationality', value: p.nationality },
    { label: 'Country of Residence', value: p.countryOfResidence },
    { label: 'Gender', value: p.gender },
    { label: 'Date of Birth', value: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : null },
    { label: 'Passport Number', value: p.passportNumber },
    { label: 'Current Address', value: p.currentAddress },
  ];

  const programFields = [
    { label: 'Target Program', value: application.programName },
    { label: 'Host Institution', value: application.universityName },
    { label: 'Program Classification', value: prog.programType },
    { label: 'Field of Study', value: prog.fieldOfStudy },
    { label: 'Interested Country', value: prog.interestedCountry },
    { label: 'Intake Period', value: prog.intakeSeason },
    { label: 'Delivery Mode', value: prog.modeOfStudy },
  ];

  const educationFields = [
    { label: 'High School / Institution', value: a.highSchoolName },
    { label: 'Accrediting Board / University', value: a.boardOrUniversity },
    { label: 'CGPA / Percentage', value: a.gpaOrPercentage },
    { label: 'Graduation Year', value: a.yearOfGraduation },
  ];

  const languageFields = [
    { label: 'Exam Framework', value: lang.examType },
    { label: 'Certified Score', value: lang.score },
    { label: 'Test Date / Expiry', value: lang.examDateOrExpiry },
  ];

  const financialFields = [
    { label: 'Funding Channel', value: fin.fundingSource },
    { label: 'Passport Expiry Date', value: fin.passportExpiryDate ? new Date(fin.passportExpiryDate).toLocaleDateString() : null },
  ];

  const experienceFields = [
    { label: 'Internships & Projects', value: exp.internshipsOrProjects },
    { label: 'Leadership & Extracurriculars', value: exp.extracurricularAndLeadership },
    { label: 'Volunteer History', value: exp.volunteerExperience },
  ];

  const documentItems = [
    { title: 'Curriculum Vitae (CV)', value: docs.resumeCv },
    { title: 'Statement of Purpose', value: docs.statementOfPurpose },
    { title: 'Passport Bio Page', value: docs.passportCopyUpload },
    { title: 'National Identity Proof', value: docs.nationalIdProof },
    { title: 'Official Transcript', value: a.transcriptUpload },
    ...(lang.examType && lang.examType !== 'Not Required'
      ? [{ title: `${lang.examType} Result Certificate`, value: lang.IELTSresult }]
      : []),
    ...(a.schools || []).map((school, index) => ({
      title: `Supplementary Record ${index + 1} Result`,
      value: school.resultUpload,
    })),
  ];

  return (
    <div className="enterprise-layout">
      <div className="shell">
        
        {/* Top Control Bar */}
        <div className="control-bar">
          <Link to="/user/applications" className="return-action">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to Application Logs
          </Link>
        </div>

        {/* Dossier Header Info */}
        <div className="dossier-heading">
          <div className="heading-meta">
            <h1>{application.programName || 'Institutional Application Dossier'}</h1>
            <p>
              <strong>{application.universityName || 'University Institution'}</strong> 
              <span>· Logged Timestamp: {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : new Date(application.updatedAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Candidate Profile Summary Console */}
        {student && (
          <div className="candidate-console">
            <div className="candidate-avatar-frame">
              <img src={student.avatar} alt={student.name} />
            </div>
            <div className="candidate-core-data">
              <div className="name-row-ent">
                <h2>{student.name}</h2>
              </div>
              <p className="sub-data-ent">{student.occupation} &mdash; {student.currentEducation}</p>
              <div className="micro-tags">
                <span>Email: {student.email || 'N/A'}</span>
                <span>Phone: {student.phone || 'N/A'}</span>
                <span>Location: {student.residenceCountry || 'N/A'}</span>
              </div>
            </div>
            <div className="candidate-metrics-ent">
              <div className="metric-unit">
                <span className="m-label">Age</span>
                <span className="m-val">{student.age}</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Architecture Grid */}
        <div className="architecture-grid">
          <EnterpriseDetailGrid title="Personal Identification" tag="SEC-01" fields={personalFields} />
          <EnterpriseDetailGrid title="Program Selection Matrix" tag="SEC-02" fields={programFields} />
          <EnterpriseDetailGrid title="Primary Academic History" tag="SEC-03" fields={educationFields} />

          {(a.schools || []).length > 0 && (
            <div className="data-card full-span">
              <div className="card-header">
                <h3>Supplementary Academic Credentials</h3>
                <span className="header-tag">SEC-03.B</span>
              </div>
              <div className="sub-list-ent">
                {(a.schools || []).map((school, index) => (
                  <div key={index} className="sub-item-ent">
                    <span className="index-pill">Record 0{index + 1}</span>
                    <p><strong>{school.schoolName}</strong> &bull; {school.boardOrUniversity} &bull; Class of {school.graduationYear} &bull; Score: {school.gpaOrPercentage}</p>
                    {school.resultUpload && (
                      <div className="mt-1">{docLink(school.resultUpload)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <EnterpriseDetailGrid title="Language Proficiency" tag="SEC-04" fields={languageFields} />
          <EnterpriseDetailGrid title="Financial & Visa Directives" tag="SEC-05" fields={financialFields} />
          <EnterpriseDetailGrid title="Experience & Leadership Profile" tag="SEC-06" fields={experienceFields} />
        </div>

        {/* Verified Documents Registry */}
        <div className="data-card full-span mt-4">
          <div className="card-header">
            <h3>Verified Document Registry</h3>
            <span className="header-tag">DOC-REPOSITORY</span>
          </div>
          <div className="document-matrix">
            {documentItems.map((item) => (
              <div key={item.title} className="doc-row">
                <span className="doc-title-label">{item.title}</span>
                {docLink(item.value)}
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Competency Matrix */}
        {student && student.skills.length > 0 && (
          <div className="data-card full-span mt-4">
            <div className="card-header">
              <h3>Core Technical Competencies & Stack</h3>
              <span className="header-tag">SKILL-INDEX</span>
            </div>
            <div className="competencies-flex">
              {student.skills.map((skill, idx) => (
                <span key={idx} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UnifiedApplicationView;