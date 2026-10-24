
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import '../../Css_Folder/ApplyViaUs.css';
import {
  programsAPI,
  visaApplicationsAPI,
  countryDetailsAPI,
} from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import {
  APPLICATION_STEPS,
  applicationFromApi,
  emptyApplicationForm,
  formToApiPayload,
  mergeProgramIntoForm,
  mergeUserIntoForm,
  validateAcademicStep,
} from '../../utils/applicationForm';
import PageLoader from './PageLoader';

// ============================================================
// VALIDATION HELPERS
// ============================================================

const CURRENT_YEAR = new Date().getFullYear();

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidYear = (value) => {
  if (!/^\d{4}$/.test(String(value ?? ''))) return false;
  const year = Number(value);
  return year >= 1950 && year <= CURRENT_YEAR;
};

const isValidDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const isPastOrToday = (value) =>
  isValidDate(value) && value <= getLocalDateString();

const isFutureDate = (value) =>
  isValidDate(value) && value > getLocalDateString();

const isValidCNIC = (value) =>
  /^\d{5}-?\d{7}-?\d$/.test(String(value ?? '').trim());

const isValidPhone = (value) => {
  const phone = String(value ?? '').trim();
  const digits = phone.replace(/\D/g, '');

  return (
    /^\+?[\d\s()-]+$/.test(phone) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
};

const isValidPassport = (value) =>
  /^[A-Za-z0-9]{5,20}$/.test(String(value ?? '').trim());

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());

const isValidAcademicResult = (value) => {
  const result = String(value ?? '').trim();

  if (!result) return false;

  // Percentage: 85%, 99.5%
  const percentage = result.match(/^(\d{1,3}(?:\.\d{1,2})?)\s*%$/);

  if (percentage) {
    const number = Number(percentage[1]);
    return number >= 0 && number <= 100;
  }

  // Fraction: 850/1000, 3.8/4.0
  const fraction = result.match(
    /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/
  );

  if (fraction) {
    const obtained = Number(fraction[1]);
    const maximum = Number(fraction[2]);

    return maximum > 0 && obtained >= 0 && obtained <= maximum;
  }

  // Plain numeric GPA, e.g. 3.8
  return /^\d+(?:\.\d+)?$/.test(result);
};

const isValidLanguageScore = (examType, value) => {
  if (examType === 'Not Required') return true;

  const text = String(value ?? '').trim();
  if (!/^\d+(?:\.\d+)?$/.test(text)) return false;

  const score = Number(text);

  switch (examType) {
    case 'IELTS':
      return score >= 0 && score <= 9;
    case 'TOEFL':
      return score >= 0 && score <= 120 && Number.isInteger(score);
    case 'PTE':
      return score >= 10 && score <= 90 && Number.isInteger(score);
    default:
      return false;
  }
};

// ============================================================
// REUSABLE FORM COMPONENTS
// ============================================================

const Field = ({ label, required, children }) => (
  <div className="apply-field">
    <label>
      {label}
      {required && <span className="apply-req"> *</span>}
    </label>
    {children}
  </div>
);

const FileField = ({ label, required, value, onChange }) => (
  <Field label={label} required={required}>
    <input
      type="file"
      accept=".pdf,application/pdf"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (
          file.type !== 'application/pdf' &&
          !file.name.toLowerCase().endsWith('.pdf')
        ) {
          alert('Only PDF documents are allowed.');
          e.target.value = '';
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert('File size must not exceed 5 MB.');
          e.target.value = '';
          return;
        }

        onChange(file);
      }}
    />

    {value && (
      <p className="apply-file-ok">
        <i className="fa fa-check-circle" />{' '}
        {typeof value === 'string' ? 'Saved Server File' : 'Document Ready'}
      </p>
    )}
  </Field>
);

// ============================================================
// MAIN APPLICATION WIZARD
// ============================================================

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
  const today = getLocalDateString();

  // ----------------------------------------------------------
  // LOAD APPLICATION
  // ----------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let base = mergeUserIntoForm(emptyApplicationForm(), user);

        if (applicationIdParam) {
          const res = await visaApplicationsAPI.getById(applicationIdParam);

          base = mergeUserIntoForm(applicationFromApi(res.data), user);
          setStep(res.data.currentStep || 1);

          const loadedProgramId =
            res.data.programId?._id || res.data.programId;

          if (loadedProgramId) {
            const progRes = await programsAPI.getById(loadedProgramId);
            base = mergeProgramIntoForm(base, progRes.data);
          }
        } else if (routeProgramId) {
          const draftRes =
            await visaApplicationsAPI.getDraftByProgram(routeProgramId);

          if (draftRes.data) {
            base = mergeUserIntoForm(
              applicationFromApi(draftRes.data),
              user
            );
            setStep(draftRes.data.currentStep || 1);
          }

          const progRes = await programsAPI.getById(routeProgramId);
          base = mergeProgramIntoForm(base, progRes.data);
        }

        if (!base.academicBackground.schools) {
          base.academicBackground.schools = [];
        }

        if (!cancelled) setForm(base);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load application.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [routeProgramId, applicationIdParam, user]);

  useEffect(() => {
    countryDetailsAPI
      .getAll()
      .then((res) => setCountries(res.data || []))
      .catch(() => setCountries([]));
  }, []);

  // ----------------------------------------------------------
  // FORM HELPERS
  // ----------------------------------------------------------

  const patch = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));

    setError('');
    setMessage('');
  };

  const addSchoolRow = () => {
    patch('academicBackground', 'schools', [
      ...(form.academicBackground.schools || []),
      {
        schoolName: '',
        graduationYear: '',
        boardOrUniversity: '',
        gpaOrPercentage: '',
        resultUpload: '',
      },
    ]);
  };

  const updateSchoolRow = (index, key, value) => {
    const schools = [...(form.academicBackground.schools || [])];
    schools[index] = { ...schools[index], [key]: value };
    patch('academicBackground', 'schools', schools);
  };

  const removeSchoolRow = (index) => {
    const schools = (form.academicBackground.schools || []).filter(
      (_, i) => i !== index
    );

    patch('academicBackground', 'schools', schools);

    setYearErrors((prev) => {
      const updated = { ...prev };
      delete updated[`school_${index}`];
      return updated;
    });
  };

  // ----------------------------------------------------------
  // VALIDATE EACH STEP
  // ----------------------------------------------------------

  const validateStep = (stepNumber) => {
    const p = form.personalInfo;
    const a = form.academicBackground;
    const l = form.languageProficiency;
    const i = form.programInterest;
    const f = form.financialAndVisa;
    const attachments = form.attachments;

    const errors = [];

    if (stepNumber === 1) {
      if (!p.firstName?.trim()) errors.push('First name is required.');
      if (!p.lastName?.trim()) errors.push('Last name is required.');

      if (!isValidCNIC(p.cnic)) {
        errors.push('Enter a valid 13-digit CNIC, e.g. 35202-1234567-1.');
      }

      if (!isValidDate(p.dateOfBirth) || !isPastOrToday(p.dateOfBirth)) {
        errors.push('Date of birth must be a valid date and cannot be in the future.');
      } else {
        const birthDate = new Date(`${p.dateOfBirth}T00:00:00`);
        const minimumBirthDate = new Date(CURRENT_YEAR - 120, 0, 1);

        if (birthDate < minimumBirthDate) {
          errors.push('Enter a realistic date of birth.');
        }
      }

      if (!p.gender) errors.push('Select your gender.');
      if (!p.nationality?.trim()) errors.push('Nationality is required.');
      if (!p.countryOfResidence?.trim()) {
        errors.push('Country of residence is required.');
      }

      if (!isValidPhone(p.contactNumber)) {
        errors.push('Enter a valid phone number containing 7–15 digits.');
      }

      if (!isValidEmail(p.emailAddress)) {
        errors.push('Enter a valid email address.');
      }

      if (!isValidPassport(p.passportNumber)) {
        errors.push('Passport number must contain 5–20 letters or digits.');
      }

      if (!p.currentAddress?.trim()) {
        errors.push('Current address is required.');
      }
    }

    if (stepNumber === 2) {
      if (!a.highSchoolName?.trim()) {
        errors.push('Institution / school name is required.');
      }

      if (!a.boardOrUniversity?.trim()) {
        errors.push('Board / university is required.');
      }

      if (!isValidYear(a.yearOfGraduation)) {
        errors.push(`Completion year must be between 1950 and ${CURRENT_YEAR}.`);
      }

      if (!isValidAcademicResult(a.gpaOrPercentage)) {
        errors.push('Enter a valid GPA, percentage, or obtained/maximum score.');
      }

      if (!a.transcriptUpload) {
        errors.push('Upload the latest education transcript or marksheet.');
      }

      // Retain your existing academic validation utility.
      const academicErrors = validateAcademicStep(a) || [];
      errors.push(...academicErrors);

      (a.schools || []).forEach((school, index) => {
        const label = `Additional qualification ${index + 1}`;

        if (!school.schoolName?.trim()) {
          errors.push(`${label}: institution name is required.`);
        }

        if (!school.boardOrUniversity?.trim()) {
          errors.push(`${label}: board/university is required.`);
        }

        if (!isValidYear(school.graduationYear)) {
          errors.push(`${label}: enter a valid completion year.`);
        }

        if (!isValidAcademicResult(school.gpaOrPercentage)) {
          errors.push(`${label}: enter a valid academic result.`);
        }

        if (!school.resultUpload) {
          errors.push(`${label}: upload the result or transcript.`);
        }
      });
    }

    if (stepNumber === 3) {
      if (!l.examType) {
        errors.push('Select an English test option.');
      } else if (l.examType !== 'Not Required') {
        if (!isValidLanguageScore(l.examType, l.score)) {
          errors.push(
            l.examType === 'IELTS'
              ? 'IELTS score must be between 0 and 9.'
              : l.examType === 'TOEFL'
                ? 'TOEFL score must be a whole number between 0 and 120.'
                : 'PTE score must be a whole number between 10 and 90.'
          );
        }

        if (!l.IELTSresult) {
          errors.push('Upload your English test result certificate.');
        }

        if (
          l.examDateOrExpiry &&
          !isValidDate(l.examDateOrExpiry)
        ) {
          errors.push('Enter a valid exam date or expiry date.');
        }
      } else if (
        l.examDateOrExpiry &&
        !isValidDate(l.examDateOrExpiry)
      ) {
        errors.push('Enter a valid exam date or expiry date.');
      }
    }

    if (stepNumber === 4) {
      if (!i.programType) errors.push('Select a program type.');
      if (!i.fieldOfStudy?.trim()) errors.push('Field of study is required.');
      if (!i.interestedCountry?.trim()) {
        errors.push('Select your interested country.');
      }
      if (!i.intakeSeason) errors.push('Select an intake.');
      if (!i.modeOfStudy) errors.push('Select a mode of study.');
    }

    // Step 5 contains optional experience fields.

    if (stepNumber === 6) {
      if (!f.fundingSource) errors.push('Select a funding source.');

      if (
        !isValidDate(f.passportExpiryDate) ||
        !isFutureDate(f.passportExpiryDate)
      ) {
        errors.push('Passport expiry must be a valid future date.');
      }
    }

    if (stepNumber === 7) {
      if (!attachments.resumeCv) errors.push('Upload your CV.');
      if (!attachments.passportCopyUpload) {
        errors.push('Upload your passport copy.');
      }
      if (!attachments.nationalIdProof) {
        errors.push('Upload your national ID proof.');
      }
    }

    return [...new Set(errors)];
  };

  const validateCurrentStep = () => {
    const errors = validateStep(step);

    if (errors.length) {
      setError(errors.join('\n'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setError('');
    return true;
  };

  // ----------------------------------------------------------
  // BUILD MULTIPART FORMDATA
  // ----------------------------------------------------------

  const buildFormDataPayload = (nextStep) => {
    const data = new FormData();
    const rawPayload = formToApiPayload(form, nextStep);

    if (form.applicationId) {
      data.append('applicationId', form.applicationId);
    }

    const selectedProgramId =
      rawPayload.programId || form.programId || programId;

    if (selectedProgramId) data.append('programId', selectedProgramId);
    if (rawPayload.programName) {
      data.append('programName', rawPayload.programName);
    }
    if (rawPayload.universityName) {
      data.append('universityName', rawPayload.universityName);
    }

    data.append('currentStep', String(nextStep));

    [
      'personalInfo',
      'academicBackground',
      'languageProficiency',
      'programInterest',
      'experienceInfo',
      'financialAndVisa',
      'attachments',
    ].forEach((key) => {
      data.append(key, JSON.stringify(rawPayload[key] || {}));
    });

    const appendFile = (key, value) => {
      if (typeof File !== 'undefined' && value instanceof File) {
        data.append(key, value);
      }
    };

    appendFile('transcriptUpload', form.academicBackground.transcriptUpload);
    appendFile('resumeCv', form.attachments.resumeCv);
    appendFile(
      'statementOfPurpose',
      form.attachments.statementOfPurpose
    );
    appendFile(
      'passportCopyUpload',
      form.attachments.passportCopyUpload
    );
    appendFile('nationalIdProof', form.attachments.nationalIdProof);
    appendFile('IELTSresult', form.languageProficiency.IELTSresult);

    (form.academicBackground.schools || []).forEach((school, index) => {
      appendFile(`schoolResultUpload_${index}`, school.resultUpload);
    });

    return data;
  };

  // ----------------------------------------------------------
  // SAVE DRAFT
  // ----------------------------------------------------------

  const saveDraft = async (nextStep = step) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const formData = buildFormDataPayload(nextStep);
      const res = await visaApplicationsAPI.saveDraft(formData);
      const parsed = applicationFromApi(res.data);

      setForm((prev) => ({
        ...prev,
        ...parsed,
        applicationId: parsed.applicationId || prev.applicationId,

        personalInfo: {
          ...prev.personalInfo,
          ...parsed.personalInfo,
          cnic: parsed.personalInfo?.cnic || prev.personalInfo.cnic || '',
        },

        academicBackground: {
          ...prev.academicBackground,
          ...parsed.academicBackground,
          transcriptUpload:
            parsed.academicBackground?.transcriptUpload ||
            prev.academicBackground?.transcriptUpload ||
            '',

          schools: (
            parsed.academicBackground?.schools ||
            prev.academicBackground?.schools ||
            []
          ).map((school, index) => ({
            ...(prev.academicBackground?.schools?.[index] || {}),
            ...school,
            resultUpload:
              school.resultUpload ||
              prev.academicBackground?.schools?.[index]?.resultUpload ||
              '',
          })),
        },

        languageProficiency: {
          ...prev.languageProficiency,
          ...parsed.languageProficiency,
          IELTSresult:
            parsed.languageProficiency?.IELTSresult ||
            prev.languageProficiency?.IELTSresult ||
            '',
        },

        programInterest: {
          ...prev.programInterest,
          ...parsed.programInterest,
          interestedCountry:
            parsed.programInterest?.interestedCountry ||
            prev.programInterest?.interestedCountry ||
            '',
        },

        attachments: {
          ...prev.attachments,
          ...parsed.attachments,
          resumeCv:
            parsed.attachments?.resumeCv || prev.attachments?.resumeCv || '',
          statementOfPurpose:
            parsed.attachments?.statementOfPurpose ||
            prev.attachments?.statementOfPurpose ||
            '',
          passportCopyUpload:
            parsed.attachments?.passportCopyUpload ||
            prev.attachments?.passportCopyUpload ||
            '',
          nationalIdProof:
            parsed.attachments?.nationalIdProof ||
            prev.attachments?.nationalIdProof ||
            '',
        },
      }));

      setMessage('Progress saved. You can continue anytime from your dashboard.');
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to save application.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!validateCurrentStep()) return;

    const next = Math.min(step + 1, APPLICATION_STEPS.length);

    try {
      await saveDraft(next);
      setStep(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Error is handled by saveDraft.
    }
  };

  // ----------------------------------------------------------
  // FINAL SUBMISSION
  // ----------------------------------------------------------

  const handleSubmit = async () => {
    // Validate every required step, even if the user navigated
    // directly to the review screen.
    const allErrors = [];

    for (const stepNumber of [1, 2, 3, 4, 6, 7]) {
      allErrors.push(...validateStep(stepNumber));
    }

    if (allErrors.length) {
      setError([...new Set(allErrors)].join('\n'));

      const firstInvalidStep = [1, 2, 3, 4, 6, 7].find(
        (stepNumber) => validateStep(stepNumber).length > 0
      );

      if (firstInvalidStep) setStep(firstInvalidStep);

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const formData = buildFormDataPayload(APPLICATION_STEPS.length);

      if (form.applicationId) {
        await visaApplicationsAPI.submitDraft(form.applicationId, formData);
      } else {
        await visaApplicationsAPI.submit(formData);
      }

      navigate('/user/dashboard', { state: { submitted: true } });
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading application..." />;
  }

  const progress = Math.round(
    (step / APPLICATION_STEPS.length) * 100
  );

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

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
            onClick={() => {
              if (step > s.id && !saving) {
                setError('');
                setStep(s.id);
              }
            }}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ whiteSpace: 'pre-line' }}
        >
          {error}
        </div>
      )}

      {message && <div className="alert alert-success">{message}</div>}

      <div className="apply-form-card">
        {/* STEP 1: PERSONAL INFORMATION */}

        {step === 1 && (
          <div className="apply-grid">
            <Field label="First name" required>
              <input
                className="form-control"
                value={form.personalInfo.firstName}
                onChange={(e) => patch('personalInfo', 'firstName', e.target.value)}
                required
              />
            </Field>

            <Field label="Last name" required>
              <input
                className="form-control"
                value={form.personalInfo.lastName}
                onChange={(e) => patch('personalInfo', 'lastName', e.target.value)}
                required
              />
            </Field>

            <Field label="CNIC / National Identity Number" required>
              <input
                className="form-control"
                placeholder="35202-1234567-1"
                maxLength={15}
                value={form.personalInfo.cnic || ''}
                onChange={(e) => patch('personalInfo', 'cnic', e.target.value)}
                required
              />
              <small className="text-muted">Enter 13 digits, with or without hyphens.</small>
            </Field>

            <Field label="Date of birth" required>
              <input
                type="date"
                className="form-control"
                min="1900-01-01"
                max={today}
                value={form.personalInfo.dateOfBirth}
                onChange={(e) => patch('personalInfo', 'dateOfBirth', e.target.value)}
                required
              />
            </Field>

            <Field label="Gender" required>
              <select
                className="form-select"
                value={form.personalInfo.gender}
                onChange={(e) => patch('personalInfo', 'gender', e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Nationality" required>
              <input
                className="form-control"
                value={form.personalInfo.nationality}
                onChange={(e) => patch('personalInfo', 'nationality', e.target.value)}
                required
              />
            </Field>

            <Field label="Country of residence" required>
              <input
                className="form-control"
                value={form.personalInfo.countryOfResidence}
                onChange={(e) => patch('personalInfo', 'countryOfResidence', e.target.value)}
                required
              />
            </Field>

            <Field label="Mobile number" required>
              <input
                type="tel"
                inputMode="tel"
                className="form-control"
                placeholder="+92 300 1234567"
                value={form.personalInfo.contactNumber}
                onChange={(e) => patch('personalInfo', 'contactNumber', e.target.value)}
                required
              />
            </Field>

            <Field label="Email" required>
              <input
                type="email"
                className="form-control"
                value={form.personalInfo.emailAddress}
                onChange={(e) => patch('personalInfo', 'emailAddress', e.target.value)}
                required
              />
            </Field>

            <Field label="Passport number" required>
              <input
                className="form-control"
                minLength={5}
                maxLength={20}
                value={form.personalInfo.passportNumber}
                onChange={(e) => patch('personalInfo', 'passportNumber', e.target.value)}
                required
              />
            </Field>

            <div className="apply-grid-full">
              <Field label="Current address" required>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.personalInfo.currentAddress}
                  onChange={(e) => patch('personalInfo', 'currentAddress', e.target.value)}
                  required
                />
              </Field>
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC BACKGROUND */}

        {step === 2 && (
          <div className="apply-academic-section">
            <div className="border-bottom pb-3 mb-4 w-100">
              <h4 className="mb-1 text-dark fw-bold">Academic Background</h4>
              <p className="text-muted small mb-0">
                Enter your latest qualification first.
              </p>
            </div>

            <div className="card shadow-sm border mb-4 w-100">
              <div className="card-header bg-light py-3 border-bottom-0 w-100">
                <span className="text-dark small fw-bold text-uppercase">
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
                        value={form.academicBackground.boardOrUniversity}
                        onChange={(e) => patch('academicBackground', 'boardOrUniversity', e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <div className="col-md-6 px-2">
                    <Field label="Year of Completion" required>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        className="form-control w-100"
                        placeholder="YYYY"
                        value={form.academicBackground.yearOfGraduation}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/^\d{0,4}$/.test(value)) return;

                          patch('academicBackground', 'yearOfGraduation', value);

                          setYearErrors((prev) => ({
                            ...prev,
                            primary:
                              value.length === 4 && !isValidYear(value)
                                ? `Year must be between 1950 and ${CURRENT_YEAR}.`
                                : '',
                          }));
                        }}
                        required
                      />
                      {yearErrors.primary && (
                        <small className="text-danger">{yearErrors.primary}</small>
                      )}
                    </Field>
                  </div>

                  <div className="col-md-6 px-2">
                    <Field label="GPA / Percentage" required>
                      <input
                        className="form-control w-100"
                        placeholder="85% or 850/1000 or 3.8/4.0"
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

            {(form.academicBackground.schools || []).map((school, index) => (
              <div
                key={index}
                className="card shadow-sm border mb-4 w-100 animate-fade-in"
              >
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                  <span className="text-secondary small fw-bold text-uppercase">
                    Additional Academic Track #{index + 1}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeSchoolRow(index)}
                  >
                    <i className="fa-solid fa-trash-can" /> Remove
                  </button>
                </div>

                <div className="card-body p-4 pt-2">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Field label="School / Institution Name" required>
                        <input
                          className="form-control"
                          value={school.schoolName}
                          onChange={(e) => updateSchoolRow(index, 'schoolName', e.target.value)}
                          required
                        />
                      </Field>
                    </div>

                    <div className="col-md-6">
                      <Field label="Board / University" required>
                        <input
                          className="form-control"
                          value={school.boardOrUniversity}
                          onChange={(e) => updateSchoolRow(index, 'boardOrUniversity', e.target.value)}
                          required
                        />
                      </Field>
                    </div>

                    <div className="col-md-6">
                      <Field label="Year of Completion" required>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          className="form-control"
                          placeholder="YYYY"
                          value={school.graduationYear}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!/^\d{0,4}$/.test(value)) return;

                            updateSchoolRow(index, 'graduationYear', value);

                            setYearErrors((prev) => ({
                              ...prev,
                              [`school_${index}`]:
                                value.length === 4 && !isValidYear(value)
                                  ? `Year must be between 1950 and ${CURRENT_YEAR}.`
                                  : '',
                            }));
                          }}
                          required
                        />
                        {yearErrors[`school_${index}`] && (
                          <small className="text-danger">
                            {yearErrors[`school_${index}`]}
                          </small>
                        )}
                      </Field>
                    </div>

                    <div className="col-md-6">
                      <Field label="GPA / Percentage" required>
                        <input
                          className="form-control"
                          placeholder="85% or 850/1000"
                          value={school.gpaOrPercentage}
                          onChange={(e) => updateSchoolRow(index, 'gpaOrPercentage', e.target.value)}
                          required
                        />
                      </Field>
                    </div>

                    <div className="col-12 mt-3 pt-3 border-top">
                      <FileField
                        label="Upload Result / Transcript"
                        required
                        value={school.resultUpload}
                        onChange={(v) => updateSchoolRow(index, 'resultUpload', v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center my-4 py-3 bg-light border rounded-3">
              <button
                type="button"
                className="btn btn-outline-primary fw-bold px-4"
                onClick={addSchoolRow}
              >
                <i className="fa-solid fa-plus-circle me-2" />
                Add Prior Education / Qualification
              </button>
              <p className="text-muted small mt-2 mb-0">
                Add secondary school or other historic qualifications.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: ENGLISH TEST */}

        {step === 3 && (
          <div className="apply-grid">
            <Field label="English test" required>
              <select
                className="form-select"
                value={form.languageProficiency.examType}
                onChange={(e) => patch('languageProficiency', 'examType', e.target.value)}
              >
                <option value="Not Required">Not Required</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
                <option value="PTE">PTE</option>
              </select>
            </Field>

            <Field
              label="Score"
              required={form.languageProficiency.examType !== 'Not Required'}
            >
              <input
                type="number"
                min="0"
                max={
                  form.languageProficiency.examType === 'IELTS'
                    ? 9
                    : form.languageProficiency.examType === 'TOEFL'
                      ? 120
                      : 90
                }
                step={form.languageProficiency.examType === 'IELTS' ? '0.5' : '1'}
                className="form-control"
                value={form.languageProficiency.score}
                onChange={(e) => patch('languageProficiency', 'score', e.target.value)}
                disabled={form.languageProficiency.examType === 'Not Required'}
              />
              <small className="text-muted">
                IELTS: 0–9; TOEFL: 0–120; PTE: 10–90.
              </small>
            </Field>

            <Field label="Exam date / expiry">
              <input
                type="date"
                className="form-control"
                min="1950-01-01"
                max={today}
                value={form.languageProficiency.examDateOrExpiry}
                onChange={(e) => patch('languageProficiency', 'examDateOrExpiry', e.target.value)}
              />
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

        {/* STEP 4: PROGRAM PREFERENCES */}

        {step === 4 && (
          <div className="apply-grid">
            <Field label="Program type" required>
              <select
                className="form-select"
                value={form.programInterest.programType}
                onChange={(e) => patch('programInterest', 'programType', e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="Diploma">Diploma</option>
                <option value="Short Course">Short Course</option>
              </select>
            </Field>

            <Field label="Field of study" required>
              <input
                className="form-control"
                value={form.programInterest.fieldOfStudy}
                onChange={(e) => patch('programInterest', 'fieldOfStudy', e.target.value)}
                required
              />
            </Field>

            <Field label="Interested Country" required>
              <select
                className="form-select"
                value={form.programInterest.interestedCountry}
                onChange={(e) => patch('programInterest', 'interestedCountry', e.target.value)}
                required
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country._id} value={country.countryName}>
                    {country.countryName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Preferred university">
              <input
                className="form-control"
                value={
                  form.universityName ||
                  form.programInterest.preferredUniversities?.[0]?.universityName ||
                  ''
                }
                onChange={(e) =>
                  patch('programInterest', 'preferredUniversities', [
                    { universityName: e.target.value },
                  ])
                }
              />
            </Field>

            <Field label="Intake" required>
              <select
                className="form-select"
                value={form.programInterest.intakeSeason}
                onChange={(e) => patch('programInterest', 'intakeSeason', e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
              </select>
            </Field>

            <Field label="Mode of study" required>
              <select
                className="form-select"
                value={form.programInterest.modeOfStudy}
                onChange={(e) => patch('programInterest', 'modeOfStudy', e.target.value)}
                required
              >
                <option value="On-campus">On-campus</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </Field>
          </div>
        )}

        {/* STEP 5: EXPERIENCE */}

        {step === 5 && (
          <div className="apply-grid apply-grid-full">
            <Field label="Internships / research (optional)">
              <textarea
                className="form-control"
                rows={3}
                value={form.experienceInfo.internshipsOrProjects}
                onChange={(e) => patch('experienceInfo', 'internshipsOrProjects', e.target.value)}
              />
            </Field>

            <Field label="Extracurricular / leadership (optional)">
              <textarea
                className="form-control"
                rows={3}
                value={form.experienceInfo.extracurricularAndLeadership}
                onChange={(e) => patch('experienceInfo', 'extracurricularAndLeadership', e.target.value)}
              />
            </Field>

            <Field label="Volunteer experience (optional)">
              <textarea
                className="form-control"
                rows={3}
                value={form.experienceInfo.volunteerExperience}
                onChange={(e) => patch('experienceInfo', 'volunteerExperience', e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* STEP 6: FINANCIAL AND VISA */}

        {step === 6 && (
          <div className="apply-grid">
            <Field label="Funding source" required>
              <select
                className="form-select"
                value={form.financialAndVisa.fundingSource}
                onChange={(e) => patch('financialAndVisa', 'fundingSource', e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Self-funded">Self-funded</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Educational Loan">Educational Loan</option>
              </select>
            </Field>

            <Field label="Passport expiry date" required>
              <input
                type="date"
                className="form-control"
                min={today}
                value={form.financialAndVisa.passportExpiryDate}
                onChange={(e) => patch('financialAndVisa', 'passportExpiryDate', e.target.value)}
                required
              />
            </Field>
          </div>
        )}

        {/* STEP 7: DOCUMENTS */}

        {step === 7 && (
          <div className="apply-grid apply-grid-full">
            <FileField
              label="Resume / CV"
              required
              value={form.attachments.resumeCv}
              onChange={(v) => patch('attachments', 'resumeCv', v)}
            />

            <FileField
              label="Letter of Recommendation"
              value={form.attachments.statementOfPurpose}
              onChange={(v) => patch('attachments', 'statementOfPurpose', v)}
            />

            <FileField
              label="Passport copy"
              required
              value={form.attachments.passportCopyUpload}
              onChange={(v) => patch('attachments', 'passportCopyUpload', v)}
            />

            <FileField
              label="National ID proof"
              required
              value={form.attachments.nationalIdProof}
              onChange={(v) => patch('attachments', 'nationalIdProof', v)}
            />
          </div>
        )}

        {/* STEP 8: REVIEW */}

        {step === 8 && (
          <div className="apply-review">
            <p>Review your information before final submission.</p>

            <ul>
              <li>
                <strong>Program:</strong> {form.programName || '—'} at{' '}
                {form.universityName || '—'}
              </li>
              <li>
                <strong>Name:</strong>{' '}
                {[form.personalInfo.firstName, form.personalInfo.lastName]
                  .filter(Boolean)
                  .join(' ') || '—'}
              </li>
              <li>
                <strong>CNIC:</strong> {form.personalInfo.cnic || '—'}
              </li>
              <li>
                <strong>Date of birth:</strong>{' '}
                {form.personalInfo.dateOfBirth || '—'}
              </li>
              <li>
                <strong>Mobile:</strong> {form.personalInfo.contactNumber || '—'}
              </li>
              <li>
                <strong>Email:</strong> {form.personalInfo.emailAddress || '—'}
              </li>
              <li>
                <strong>Field:</strong>{' '}
                {form.programInterest.fieldOfStudy || '—'}
              </li>
              <li>
                <strong>Interested Country:</strong>{' '}
                {form.programInterest.interestedCountry || '—'}
              </li>
              <li>
                <strong>English Test:</strong>{' '}
                {form.languageProficiency.examType || '—'}
              </li>
              <li>
                <strong>Additional Academic Records:</strong>{' '}
                {form.academicBackground.schools?.length || 0} track(s)
              </li>
            </ul>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}

        <div className="apply-wizard-actions d-flex gap-2 align-items-center mt-5 pt-3 border-top">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setError('');
                setMessage('');
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
