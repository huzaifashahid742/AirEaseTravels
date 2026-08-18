import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import '../../Css_Folder/ApplyViaUs.css';
import { programsAPI, visaApplicationsAPI, countryDetailsAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import {
  APPLICATION_STEPS,
  applicationFromApi,
  emptyApplicationForm,
  formToApiPayload,
  mergeProgramIntoForm,
  mergeUserIntoForm,
  validateAcademicStep,
  validateGraduationYear,
} from '../../utils/applicationForm';
import PageLoader from './PageLoader';

const Field = ({ label, required, children }) => (
  <div className="apply-field">
    <label>
      {label}
      {required && <span className="apply-req"> *</span>}
    </label>
    {children}
  </div>
);

// Modified FileField to accept raw File handles into state
const FileField = ({ label, required, value, onChange }) => (
  <Field label={label} required={required}>
    <input
      type="file"
      accept=".pdf"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          alert('Invalid file format. Only PDF documents (.pdf) are permitted.');
          e.target.value = '';
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds the 5MB maximum allowed threshold.');
          e.target.value = '';
          return;
        }

        onChange(file); // Passes the raw File object directly
      }}
    />
    {value && (
      <p className="apply-file-ok">
        <i className="fa fa-check-circle" /> {typeof value === 'string' ? 'Saved Server File' : 'Document Stage Ready'}
      </p>
    )}
  </Field>
);

const ApplyViaUsWizard = () => {
  const { programId: routeProgramId } = useParams();
  const [searchParams] = useSearchParams();
  const applicationIdParam = searchParams.get('applicationId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyApplicationForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countries, setCountries] = useState([]);
  const [yearErrors, setYearErrors] = useState({});

  const programId = routeProgramId || form.programId;

  useEffect(() => {
    const load = async () => {
      try {
        let base = mergeUserIntoForm(emptyApplicationForm(), user);

        if (applicationIdParam) {
          const res = await visaApplicationsAPI.getById(applicationIdParam);
          base = mergeUserIntoForm(applicationFromApi(res.data), user);
          setStep(res.data.currentStep || 1);
          const loadedProgramId = res.data.programId?._id || res.data.programId;
          if (loadedProgramId) {
            const progRes = await programsAPI.getById(loadedProgramId);
            base = mergeProgramIntoForm(base, progRes.data);
          }
        } else if (routeProgramId) {
          const draftRes = await visaApplicationsAPI.getDraftByProgram(routeProgramId);
          if (draftRes.data) {
            base = mergeUserIntoForm(applicationFromApi(draftRes.data), user);
            setStep(draftRes.data.currentStep || 1);
          }
          const progRes = await programsAPI.getById(routeProgramId);
          base = mergeProgramIntoForm(base, progRes.data);
        }

        if (!base.academicBackground.schools) {
          base.academicBackground.schools = [];
        }

        setForm(base);
      } catch (err) {
        setError(err.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [routeProgramId, applicationIdParam, user]);

  useEffect(() => {
    countryDetailsAPI.getAll()
      .then((res) => setCountries(res.data || []))
      .catch(() => setCountries([]));
  }, []);

  const patch = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const addSchoolRow = () => {
    const currentSchools = form.academicBackground.schools || [];
    const updatedSchools = [
      ...currentSchools,
      { schoolName: '', graduationYear: '', boardOrUniversity: '', gpaOrPercentage: '', resultUpload: '' }
    ];
    patch('academicBackground', 'schools', updatedSchools);
  };

  const updateSchoolRow = (index, key, value) => {
    const updatedSchools = [...(form.academicBackground.schools || [])];
    updatedSchools[index][key] = value;
    patch('academicBackground', 'schools', updatedSchools);
  };

  const removeSchoolRow = (index) => {
    const updatedSchools = (form.academicBackground.schools || []).filter((_, i) => i !== index);
    patch('academicBackground', 'schools', updatedSchools);
  };

  // 🔴 CONVERTS COMPONENT STRUCT TO FORMDATA PAYLOADS
  const buildFormDataPayload = (nextStep) => {
    const data = new FormData();
    const rawPayload = formToApiPayload(form, nextStep);

    // Append regular metadata fields 
    if (form.applicationId) data.append('applicationId', form.applicationId);
    if (rawPayload.programId) data.append('programId', rawPayload.programId);
    else if (form.programId) data.append('programId', form.programId);
    if (rawPayload.programName) data.append('programName', rawPayload.programName);
    if (rawPayload.universityName) data.append('universityName', rawPayload.universityName);
    data.append('currentStep', nextStep);

    // Stringify complex structural fields to preserve formatting for express-urlencoded parsing
    data.append('personalInfo', JSON.stringify(rawPayload.personalInfo || {}));
    data.append('academicBackground', JSON.stringify(rawPayload.academicBackground || {}));
    data.append('languageProficiency', JSON.stringify(rawPayload.languageProficiency || {}));
    data.append('programInterest', JSON.stringify(rawPayload.programInterest || {}));
    data.append('experienceInfo', JSON.stringify(rawPayload.experienceInfo || {}));
    data.append('financialAndVisa', JSON.stringify(rawPayload.financialAndVisa || {}));
    data.append('attachments', JSON.stringify(rawPayload.attachments || {}));

    // Attach native binary file data safely if it's an instance of a file
    if (form.academicBackground.transcriptUpload instanceof File) {
      data.append('transcriptUpload', form.academicBackground.transcriptUpload);
    }
    if (form.attachments.resumeCv instanceof File) {
      data.append('resumeCv', form.attachments.resumeCv);
    }
    if (form.attachments.statementOfPurpose instanceof File) {
      data.append('statementOfPurpose', form.attachments.statementOfPurpose);
    }
    if (form.attachments.passportCopyUpload instanceof File) {
      data.append('passportCopyUpload', form.attachments.passportCopyUpload);
    }
    if (form.attachments.nationalIdProof instanceof File) {
      data.append('nationalIdProof', form.attachments.nationalIdProof);
    }
    if (form.languageProficiency.IELTSresult instanceof File) {
      data.append('IELTSresult', form.languageProficiency.IELTSresult);
    }
    (form.academicBackground.schools || []).forEach((school, index) => {
      if (school.resultUpload instanceof File) {
        data.append(`schoolResultUpload_${index}`, school.resultUpload);
      }
    });

    return data;
  };

  const saveDraft = async (nextStep = step) => {
    setSaving(true);
    setError('');
    try {
      const formData = buildFormDataPayload(nextStep);
      const res = await visaApplicationsAPI.saveDraft(formData);

      const parsedApiForm = applicationFromApi(res.data);

      setForm((prev) => ({
        ...prev,
        ...parsedApiForm,
        applicationId: parsedApiForm.applicationId || prev.applicationId,
        personalInfo: {
          ...prev.personalInfo,
          ...parsedApiForm.personalInfo,
          cnic: parsedApiForm.personalInfo?.cnic || prev.personalInfo.cnic || '',
        },
        academicBackground: {
          ...prev.academicBackground,
          ...parsedApiForm.academicBackground,
          transcriptUpload:
            parsedApiForm.academicBackground?.transcriptUpload ||
            prev.academicBackground?.transcriptUpload ||
            '',
          schools: (parsedApiForm.academicBackground?.schools || prev.academicBackground?.schools || []).map(
            (school, index) => ({
              ...(prev.academicBackground?.schools?.[index] || {}),
              ...school,
              resultUpload:
                school.resultUpload ||
                prev.academicBackground?.schools?.[index]?.resultUpload ||
                '',
            })
          ),
        },
        languageProficiency: {
          ...prev.languageProficiency,
          ...parsedApiForm.languageProficiency,
          IELTSresult:
            parsedApiForm.languageProficiency?.IELTSresult ||
            prev.languageProficiency?.IELTSresult ||
            '',
        },
        programInterest: {
          ...prev.programInterest,
          ...parsedApiForm.programInterest,
          interestedCountry:
            parsedApiForm.programInterest?.interestedCountry ||
            prev.programInterest?.interestedCountry ||
            '',
        },
        attachments: {
          ...prev.attachments,
          ...parsedApiForm.attachments,
          resumeCv: parsedApiForm.attachments?.resumeCv || prev.attachments?.resumeCv || '',
          statementOfPurpose:
            parsedApiForm.attachments?.statementOfPurpose || prev.attachments?.statementOfPurpose || '',
          passportCopyUpload:
            parsedApiForm.attachments?.passportCopyUpload || prev.attachments?.passportCopyUpload || '',
          nationalIdProof:
            parsedApiForm.attachments?.nationalIdProof || prev.attachments?.nationalIdProof || '',
        },
      }));

      setMessage('Progress saved. You can continue anytime from your dashboard.');
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to save');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (step === 1) {
      if (!form.personalInfo.cnic) {
        setError('CNIC mapping value is mandatory before passing onward.');
        return;
      }
    }

    if (step === 2) {
      const academicErrors = validateAcademicStep(form.academicBackground);
      if (academicErrors.length) {
        setError(academicErrors.join('. '));
        return;
      }
    }

    if (step === 3 && form.languageProficiency.examType !== 'Not Required') {
      if (!form.languageProficiency.score?.trim()) {
        setError('Language test score is required when an exam type is selected.');
        return;
      }
      if (!form.languageProficiency.IELTSresult) {
        setError('Language test result document upload is required.');
        return;
      }
    }

    if (step === 4 && !form.programInterest.interestedCountry?.trim()) {
      setError('Interested country is required.');
      return;
    }

    const next = Math.min(step + 1, APPLICATION_STEPS.length);
    try {
      await saveDraft(next);
      setStep(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      /* error set */
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const formData = buildFormDataPayload(APPLICATION_STEPS.length);
      if (form.applicationId) {
        await visaApplicationsAPI.submitDraft(form.applicationId, formData);
      } else {
        await visaApplicationsAPI.submit(formData);
      }
      navigate('/user/dashboard', { state: { submitted: true } });
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading application..." />;

  const progress = Math.round((step / APPLICATION_STEPS.length) * 100);

  return (
    <div className="apply-wizard-page">
      <div className="apply-wizard-header">
        <div>
          <Link to="/Programs_List" className="apply-back-link">
            <i className="fa fa-arrow-left" /> Choose program
          </Link>
          <h1>Apply via AirEase</h1>
          {form.programName && (
            <p className="apply-program-label">
              {form.programName} · {form.universityName}
            </p>
          )}
        </div>
        <div className="apply-progress-ring">
          <span>{progress}%</span>
          <small>Step {step} of {APPLICATION_STEPS.length}</small>
        </div>
      </div>

      <div className="apply-stepper">
        {APPLICATION_STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`apply-step-pill${step === s.id ? ' active' : ''}${step > s.id ? ' done' : ''}`}
            onClick={() => step > s.id && setStep(s.id)}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="apply-form-card">
        {step === 1 && (
          <div className="apply-grid">
            <Field label="First name" required>
              <input className="form-control" value={form.personalInfo.firstName} onChange={(e) => patch('personalInfo', 'firstName', e.target.value)} required />
            </Field>
            <Field label="Last name" required>
              <input className="form-control" value={form.personalInfo.lastName} onChange={(e) => patch('personalInfo', 'lastName', e.target.value)} required />
            </Field>
            <Field label="CNIC / National Identity Number" required>
              <input className="form-control" placeholder="xxxxx-xxxxxxx-x" value={form.personalInfo.cnic || ''} onChange={(e) => patch('personalInfo', 'cnic', e.target.value)} required />
            </Field>
            <Field label="Date of birth" required>
              <input type="date" className="form-control" value={form.personalInfo.dateOfBirth} onChange={(e) => patch('personalInfo', 'dateOfBirth', e.target.value)} required />
            </Field>
            <Field label="Gender" required>
              <select className="form-select" value={form.personalInfo.gender} onChange={(e) => patch('personalInfo', 'gender', e.target.value)} required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Nationality" required>
              <input className="form-control" value={form.personalInfo.nationality} onChange={(e) => patch('personalInfo', 'nationality', e.target.value)} required />
            </Field>
            <Field label="Country of residence" required>
              <input className="form-control" value={form.personalInfo.countryOfResidence} onChange={(e) => patch('personalInfo', 'countryOfResidence', e.target.value)} required />
            </Field>
            <Field label="Mobile number" required>
              <input className="form-control" value={form.personalInfo.contactNumber} onChange={(e) => patch('personalInfo', 'contactNumber', e.target.value)} required />
            </Field>
            <Field label="Email" required>
              <input type="email" className="form-control" value={form.personalInfo.emailAddress} onChange={(e) => patch('personalInfo', 'emailAddress', e.target.value)} required />
            </Field>
            <Field label="Passport number" required>
              <input className="form-control" value={form.personalInfo.passportNumber} onChange={(e) => patch('personalInfo', 'passportNumber', e.target.value)} required />
            </Field>
            <div className="apply-grid-full">
              <Field label="Current address" required>
                <textarea className="form-control" rows={2} value={form.personalInfo.currentAddress} onChange={(e) => patch('personalInfo', 'currentAddress', e.target.value)} required />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="apply-academic-section">
            <div className="border-bottom pb-3 mb-4 w-100">
              <h4 className="mb-1 text-dark fw-bold">Academic Background</h4>
              <p className="text-muted small mb-0">
                Please provide your academic achievements starting with your highest/most recent qualification.
              </p>
            </div>

            <div className="card shadow-sm border mb-4 w-100">
              <div className="card-header bg-light py-3 border-bottom-0 w-100">
                <span className="text-dark small fw-bold text-uppercase tracking-wider">
                  <i className="fa-solid fa-graduation-cap text-primary me-2" />
                  Latest Education
                </span>
              </div>
              <div className="card-body p-4 pt-2 w-100">
                <div className="row g-3 w-100 mx-0">
                  <div className="col-md-6 px-2">
                    <Field label="Institution / School Name" required>
                      <input 
                        className="form-control w-100" 
                        placeholder="e.g. Stanford University"
                        value={form.academicBackground.highSchoolName} 
                        onChange={(e) => patch('academicBackground', 'highSchoolName', e.target.value)} 
                        required 
                      />
                    </Field>
                  </div>
                  <div className="col-md-6 px-2">
                    <Field label="Board / University / Awarding Body" required>
                      <input 
                        className="form-control w-100" 
                        placeholder="e.g. State Board / University"
                        value={form.academicBackground.boardOrUniversity} 
                        onChange={(e) => patch('academicBackground', 'boardOrUniversity', e.target.value)} 
                        required 
                      />
                    </Field>
                  </div>
                  <div className="col-md-6 px-2">
                    <Field label="Year of Completion" required>
                      <input 
                        type="number" 
                        className="form-control w-100" 
                        placeholder="YYYY"
                        min={1950}
                        max={new Date().getFullYear()}
                        value={form.academicBackground.yearOfGraduation} 
                        onChange={(e) => {
                          patch('academicBackground', 'yearOfGraduation', e.target.value);
                          const err = validateGraduationYear(e.target.value);
                          setYearErrors((prev) => ({ ...prev, primary: err }));
                        }}
                        required 
                      />
                      {yearErrors.primary && <small className="text-danger">{yearErrors.primary}</small>}
                    </Field>
                  </div>
                  <div className="col-md-6 px-2">
                    <Field label="GPA / Percentage" required>
                      <input 
                        className="form-control w-100" 
                        placeholder="e.g. 3.8/4.0 or 85%"
                        value={form.academicBackground.gpaOrPercentage} 
                        onChange={(e) => patch('academicBackground', 'gpaOrPercentage', e.target.value)} 
                        required 
                      />
                    </Field>
                  </div>
                  
                  <div className="col-12 px-2 mt-4 pt-3 border-top w-100">
                    <FileField 
                      label="Upload Transcript / Marksheet (Latest Education)" 
                      required 
                      value={form.academicBackground.transcriptUpload} 
                      onChange={(v) => patch('academicBackground', 'transcriptUpload', v)} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {form.academicBackground.schools?.map((sch, index) => (
              <div key={index} className="card shadow-sm border mb-4 w-100 animate-fade-in">
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom-0 w-100">
                  <span className="text-secondary small fw-bold text-uppercase">
                    <i className="fa-solid fa-clock-rotate-left me-2 text-secondary" />
                    Additional Academic Track #{index + 1}
                  </span>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-3" 
                    onClick={() => removeSchoolRow(index)}
                  >
                    <i className="fa-solid fa-trash-can small" /> 
                    <span>Remove</span>
                  </button>
                </div>
                
                <div className="card-body p-4 pt-2 w-100">
                  <div className="row g-3 w-100 mx-0">
                    <div className="col-md-6 px-2">
                      <Field label="School / Institution Name" required>
                        <input 
                          className="form-control w-100" 
                          value={sch.schoolName} 
                          onChange={(e) => updateSchoolRow(index, 'schoolName', e.target.value)} 
                          required 
                        />
                      </Field>
                    </div>
                    <div className="col-md-6 px-2">
                      <Field label="Board / University" required>
                        <input 
                          className="form-control w-100" 
                          value={sch.boardOrUniversity} 
                          onChange={(e) => updateSchoolRow(index, 'boardOrUniversity', e.target.value)} 
                          required 
                        />
                      </Field>
                    </div>
                    <div className="col-md-6 px-2">
                      <Field label="Year of Completion" required>
                        <input 
                          type="number" 
                          className="form-control w-100"
                          placeholder="YYYY"
                          min={1950}
                          max={new Date().getFullYear()}
                          value={sch.graduationYear} 
                          onChange={(e) => {
                            updateSchoolRow(index, 'graduationYear', e.target.value);
                            const err = validateGraduationYear(e.target.value, `Record ${index + 1} year`);
                            setYearErrors((prev) => ({ ...prev, [`school_${index}`]: err }));
                          }}
                          required 
                        />
                        {yearErrors[`school_${index}`] && (
                          <small className="text-danger">{yearErrors[`school_${index}`]}</small>
                        )}
                      </Field>
                    </div>
                    <div className="col-md-6 px-2">
                      <Field label="GPA / Percentage" required>
                        <input 
                          className="form-control w-100" 
                          value={sch.gpaOrPercentage} 
                          onChange={(e) => updateSchoolRow(index, 'gpaOrPercentage', e.target.value)} 
                          required 
                        />
                      </Field>
                    </div>
                    <div className="col-12 px-2 mt-3 pt-3 border-top w-100">
                      <FileField
                        label="Upload Result / Transcript (This Qualification)"
                        required
                        value={sch.resultUpload}
                        onChange={(v) => updateSchoolRow(index, 'resultUpload', v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center my-4 py-3 bg-light border border-dashed rounded-3 w-100">
              <button 
                type="button" 
                className="btn btn-outline-primary fw-bold d-inline-flex align-items-center gap-2 px-4" 
                onClick={addSchoolRow}
              >
                <i className="fa-solid fa-plus-circle" />
                <span>Add Prior Education / Qualification</span>
              </button>
              <p className="text-muted small mt-2 mb-0">Click to add secondary, high school, or other historic qualifications.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="apply-grid">
            <Field label="English test" required>
              <select className="form-select" value={form.languageProficiency.examType} onChange={(e) => patch('languageProficiency', 'examType', e.target.value)}>
                <option value="Not Required">Not Required</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
                <option value="PTE">PTE</option>
              </select>
            </Field>
            <Field label="Score" required={form.languageProficiency.examType !== 'Not Required'}>
              <input className="form-control" value={form.languageProficiency.score} onChange={(e) => patch('languageProficiency', 'score', e.target.value)} />
            </Field>
            <Field label="Exam date / expiry">
              <input className="form-control" type='date' value={form.languageProficiency.examDateOrExpiry} onChange={(e) => patch('languageProficiency', 'examDateOrExpiry', e.target.value)} />
            </Field>
            {form.languageProficiency.examType !== 'Not Required' && (
              <div className="apply-grid-full">
                <FileField
                  label={`Upload ${form.languageProficiency.examType} Result Certificate`}
                  required
                  value={form.languageProficiency.IELTSresult}
                  onChange={(v) => patch('languageProficiency', 'IELTSresult', v)}
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="apply-grid">
            <Field label="Program type" required>
              <select className="form-select" value={form.programInterest.programType} onChange={(e) => patch('programInterest', 'programType', e.target.value)} required>
                <option value="">Select</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="Diploma">Diploma</option>
                <option value="Short Course">Short Course</option>
              </select>
            </Field>
            <Field label="Field of study" required>
              <input className="form-control" value={form.programInterest.fieldOfStudy} onChange={(e) => patch('programInterest', 'fieldOfStudy', e.target.value)} required />
            </Field>
            <Field label="Interested Country" required>
              <select
                className="form-select"
                value={form.programInterest.interestedCountry}
                onChange={(e) => patch('programInterest', 'interestedCountry', e.target.value)}
                required
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c._id} value={c.countryName}>{c.countryName}</option>
                ))}
              </select>
            </Field>
            <Field label="Preferred university">
              <input className="form-control" value={form.universityName || form.programInterest.preferredUniversities?.[0]?.universityName || ''} onChange={(e) => patch('programInterest', 'preferredUniversities', [{ universityName: e.target.value }])} />
            </Field>
            <Field label="Intake" required>
              <select className="form-select" value={form.programInterest.intakeSeason} onChange={(e) => patch('programInterest', 'intakeSeason', e.target.value)} required>
                <option value="">Select</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
              </select>
            </Field>
            <Field label="Mode of study" required>
              <select className="form-select" value={form.programInterest.modeOfStudy} onChange={(e) => patch('programInterest', 'modeOfStudy', e.target.value)} required>
                <option value="On-campus">On-campus</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="apply-grid apply-grid-full">
            <Field label="Internships / research (optional)">
              <textarea className="form-control" rows={3} value={form.experienceInfo.internshipsOrProjects} onChange={(e) => patch('experienceInfo', 'internshipsOrProjects', e.target.value)} />
            </Field>
            <Field label="Extracurricular / leadership (optional)">
              <textarea className="form-control" rows={3} value={form.experienceInfo.extracurricularAndLeadership} onChange={(e) => patch('experienceInfo', 'extracurricularAndLeadership', e.target.value)} />
            </Field>
            <Field label="Volunteer experience (optional)">
              <textarea className="form-control" rows={3} value={form.experienceInfo.volunteerExperience} onChange={(e) => patch('experienceInfo', 'volunteerExperience', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="apply-grid">
            <Field label="Funding source" required>
              <select className="form-select" value={form.financialAndVisa.fundingSource} onChange={(e) => patch('financialAndVisa', 'fundingSource', e.target.value)} required>
                <option value="">Select</option>
                <option value="Self-funded">Self-funded</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Educational Loan">Educational Loan</option>
              </select>
            </Field>
            <Field label="Passport expiry date" required>
              <input type="date" className="form-control" value={form.financialAndVisa.passportExpiryDate} onChange={(e) => patch('financialAndVisa', 'passportExpiryDate', e.target.value)} required />
            </Field>
          </div>
        )}

        {step === 7 && (
          <div className="apply-grid apply-grid-full">
            <FileField label="Resume / CV" required value={form.attachments.resumeCv} onChange={(v) => patch('attachments', 'resumeCv', v)} />
            <FileField label="Letter of Recommendation" required value={form.attachments.statementOfPurpose} onChange={(v) => patch('attachments', 'statementOfPurpose', v)} />
            <FileField label="Passport copy" required value={form.attachments.passportCopyUpload} onChange={(v) => patch('attachments', 'passportCopyUpload', v)} />
            <FileField label="National ID proof" required value={form.attachments.nationalIdProof} onChange={(v) => patch('attachments', 'nationalIdProof', v)} />
          </div>
        )}

        {step === 8 && (
          <div className="apply-review">
            <p>Review your information before final submission. You can go back to any step to edit.</p>
            <ul>
              <li><strong>Program:</strong> {form.programName || '—'} at {form.universityName || '—'}</li>
              <li><strong>Name:</strong> {[form.personalInfo.firstName, form.personalInfo.lastName].filter(Boolean).join(' ')}</li>
              <li><strong>CNIC / National Identity:</strong> {form.personalInfo.cnic || '—'}</li>
              <li><strong>Email:</strong> {form.personalInfo.emailAddress}</li>
              <li><strong>Field:</strong> {form.programInterest.fieldOfStudy}</li>
              <li><strong>Interested Country:</strong> {form.programInterest.interestedCountry || '—'}</li>
              <li><strong>English Test:</strong> {form.languageProficiency.examType}</li>
              <li><strong>Additional Academic Records:</strong> {form.academicBackground.schools?.length || 0} track(s) added</li>
            </ul>
          </div>
        )}

        <div className="apply-wizard-actions d-flex gap-2 align-items-center mt-5 pt-3 border-top">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setError('');
                setStep((prev) => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={saving}
            >
              Back
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline-primary me-auto"
            onClick={() => saveDraft(step)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {step < APPLICATION_STEPS.length ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAndNext}
              disabled={saving}
            >
              {saving ? 'Processing...' : 'Save & Next'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyViaUsWizard;