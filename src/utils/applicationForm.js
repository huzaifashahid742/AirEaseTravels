export const APPLICATION_STEPS = [
  { id: 1, key: 'personal', title: 'Personal Information' },
  { id: 2, key: 'academic', title: 'Academic Background' },
  { id: 3, key: 'language', title: 'English / Language' },
  { id: 4, key: 'program', title: 'Program Interest' },
  { id: 5, key: 'experience', title: 'Work & Activities' },
  { id: 6, key: 'financial', title: 'Financial & Visa' },
  { id: 7, key: 'documents', title: 'Documents' },
  { id: 8, key: 'review', title: 'Review & Submit' },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_GRADUATION_YEAR = 1950;

export const validateGraduationYear = (year, label = 'Year of completion') => {
  if (year === undefined || year === null || year === '') {
    return `${label} is required`;
  }
  const y = Number(year);
  if (Number.isNaN(y) || !Number.isInteger(y)) {
    return `${label} must be a valid 4-digit year`;
  }
  if (String(y).length !== 4) {
    return `${label} must be a 4-digit year`;
  }
  if (y < MIN_GRADUATION_YEAR) {
    return `${label} must be ${MIN_GRADUATION_YEAR} or later`;
  }
  if (y > CURRENT_YEAR) {
    return `${label} cannot be after ${CURRENT_YEAR}`;
  }
  return null;
};

export const validateAcademicStep = (academicBackground) => {
  const errors = [];
  const a = academicBackground || {};

  if (!a.highSchoolName?.trim()) errors.push('Institution / school name is required');
  const primaryYearError = validateGraduationYear(a.yearOfGraduation, 'Year of completion');
  if (primaryYearError) errors.push(primaryYearError);
  if (!a.boardOrUniversity?.trim()) errors.push('Board / university is required');
  if (!a.gpaOrPercentage?.trim()) errors.push('GPA / percentage is required');
  if (!a.transcriptUpload) errors.push('Transcript / marksheet upload is required');

  (a.schools || []).forEach((school, index) => {
    const label = `Additional record ${index + 1}`;
    if (!school.schoolName?.trim()) errors.push(`${label}: school name is required`);
    const yearError = validateGraduationYear(school.graduationYear, `${label} year of completion`);
    if (yearError) errors.push(yearError);
    if (!school.boardOrUniversity?.trim()) errors.push(`${label}: board / university is required`);
    if (!school.gpaOrPercentage?.trim()) errors.push(`${label}: GPA / percentage is required`);
    if (!school.resultUpload) errors.push(`${label}: result upload is required`);
  });

  return errors;
};

const degreeToProgramType = (degree) => {
  if (degree === 'Master' || degree === 'PhD') return 'Graduate';
  if (degree === 'Diploma' || degree === 'Associate Degree') return 'Diploma';
  return 'Undergraduate';
};

export const emptyApplicationForm = () => ({
  applicationId: null,
  programId: '',
  programName: '',
  universityName: '',
  currentStep: 1,
  personalInfo: {
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    countryOfResidence: '',
    // permanentAddress: '',
    currentAddress: '',
    contactNumber: '',
    whatsapp: '',
    emailAddress: '',
    passportNumber: '',
    cnic: '',
    profilePhoto: '',
  },
  academicBackground: {
    highSchoolName: '',
    yearOfGraduation: '',
    boardOrUniversity: '',
    gpaOrPercentage: '',
    subjectsStudied: '',
    previousUniversity: '',
    degreeObtained: '',
    transcriptUpload: '',
    schools: [],
  },
  languageProficiency: {
    examType: 'Not Required',
    score: '',
    examDateOrExpiry: '',
    IELTSresult: '',
    additionalCertificates: '',
  },
  programInterest: {
    programType: '',
    fieldOfStudy: '',
    interestedCountry: '',
    preferredUniversities: [],
    intakeSeason: '',
    modeOfStudy: 'On-campus',
    startDate: '',
  },
  experienceInfo: {
    workHistory: [],
    internshipsOrProjects: '',
    extracurricularAndLeadership: '',
    volunteerExperience: '',
  },
  financialAndVisa: {
    fundingSource: '',
    scholarshipIntended: '',
    currentVisaStatus: '',
    passportExpiryDate: '',
  },
  attachments: {
    resumeCv: '',
    statementOfPurpose: '',
    lettersOfRecommendation: [],
    passportCopyUpload: '',
    nationalIdProof: '',
  },
});

const toDateInput = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const mergeUserIntoForm = (form, user) => {
  if (!user) return form;
  const p = user.profile || {};
  const nameParts = user.name?.split(' ') || [];
  const pi = form.personalInfo || {};

  return {
    ...form,
    personalInfo: {
      ...pi,
      firstName: pi.firstName || p.firstName || nameParts[0] || '',
      middleName: pi.middleName || p.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''),
      lastName: pi.lastName || p.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''),
      fullName: pi.fullName || user.name || '',
      emailAddress: pi.emailAddress || user.email || '',
      contactNumber: pi.contactNumber || p.phone || '',
      whatsapp: pi.whatsapp || p.whatsapp || '',
      nationality: pi.nationality || p.nationality || '',
      countryOfResidence: pi.countryOfResidence || p.countryOfResidence || '',
      // permanentAddress: pi.permanentAddress || p.permanentAddress || '',
      currentAddress: pi.currentAddress || p.currentAddress,
      dateOfBirth: pi.dateOfBirth || toDateInput(p.dateOfBirth),
      gender: pi.gender || p.gender || '',
      passportNumber: pi.passportNumber || p.passportNumber || '',
      profilePhoto: pi.profilePhoto || p.profilePhoto || '',
    },
  };
};

export const mergeProgramIntoForm = (form, program) => {
  if (!program) return form;
  const uni = program.universityId;
  const uniName = uni?.universityName || program.university || '';

  return {
    ...form,
    programId: program._id,
    programName: program.programName,
    universityName: uniName,
    programInterest: {
      ...form.programInterest,
      programType: degreeToProgramType(program.degree),
      fieldOfStudy: program.field || '',
      intakeSeason: program.intake || '',
      preferredUniversities: uniName ? [{ universityName: uniName }] : [],
    },
  };
};

export const applicationFromApi = (app) => {
  if (!app) return emptyApplicationForm();
  const form = emptyApplicationForm();

  return {
    ...form,
    applicationId: app._id,
    programId: app.programId?._id || app.programId || '',
    programName: app.programName || app.programId?.programName || '',
    universityName: app.universityName || '',
    currentStep: app.currentStep || 1,
    personalInfo: {
      ...form.personalInfo,
      ...app.personalInfo,
      dateOfBirth: toDateInput(app.personalInfo?.dateOfBirth),
      cnic: app.personalInfo?.cnic || '',
    },
    academicBackground: {
      ...form.academicBackground,
      ...app.academicBackground,
      yearOfGraduation: app.academicBackground?.yearOfGraduation ?? '',
      transcriptUpload: app.academicBackground?.transcriptUpload || '',
      subjectsStudied: (app.academicBackground?.subjectsStudied || []).join(', '),
      schools: (app.academicBackground?.schools || []).map((s) => ({
        ...s,
        graduationYear: s.graduationYear ?? '',
        resultUpload: s.resultUpload || '',
      })),
    },
    languageProficiency: {
      ...form.languageProficiency,
      ...app.languageProficiency,
      IELTSresult: app.languageProficiency?.IELTSresult || '',
      additionalCertificates: (app.languageProficiency?.additionalCertificates || []).join(', '),
    },
    programInterest: {
      ...form.programInterest,
      ...app.programInterest,
      interestedCountry: app.programInterest?.interestedCountry || '',
      preferredUniversities: app.programInterest?.preferredUniversities || [],
    },
    experienceInfo: {
      ...form.experienceInfo,
      ...app.experienceInfo,
      workHistory: app.experienceInfo?.workHistory || [],
    },
    financialAndVisa: {
      ...form.financialAndVisa,
      ...app.financialAndVisa,
      passportExpiryDate: toDateInput(app.financialAndVisa?.passportExpiryDate),
    },
    attachments: {
      ...form.attachments,
      ...app.attachments,
    },
  };
};

const filePathOnly = (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

export const formToApiPayload = (form, step) => {
  const subjects = form.academicBackground.subjectsStudied
    ? form.academicBackground.subjectsStudied.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const certs = form.languageProficiency.additionalCertificates
    ? form.languageProficiency.additionalCertificates.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const fullName = [form.personalInfo.firstName, form.personalInfo.middleName, form.personalInfo.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    applicationId: form.applicationId,
    programId: form.programId || undefined,
    programName: form.programName,
    universityName: form.universityName,
    currentStep: step,
    personalInfo: {
      ...form.personalInfo,
      fullName: fullName || form.personalInfo.fullName,
      dateOfBirth: form.personalInfo.dateOfBirth || undefined,
      cnic: form.personalInfo.cnic || '',
    },
    academicBackground: {
      ...form.academicBackground,
      yearOfGraduation: form.academicBackground.yearOfGraduation
        ? Number(form.academicBackground.yearOfGraduation)
        : undefined,
      transcriptUpload: typeof form.academicBackground.transcriptUpload === 'string'
        ? form.academicBackground.transcriptUpload
        : undefined,
      schools: (form.academicBackground.schools || []).map((school) => ({
        schoolName: school.schoolName || '',
        boardOrUniversity: school.boardOrUniversity || '',
        gpaOrPercentage: school.gpaOrPercentage || '',
        graduationYear: school.graduationYear ? Number(school.graduationYear) : undefined,
        resultUpload: typeof school.resultUpload === 'string' ? school.resultUpload : undefined,
      })),
      subjectsStudied: subjects,
    },
    languageProficiency: {
      ...form.languageProficiency,
      IELTSresult: typeof form.languageProficiency.IELTSresult === 'string'
        ? form.languageProficiency.IELTSresult
        : undefined,
      additionalCertificates: certs,
    },
    programInterest: form.programInterest,
    experienceInfo: form.experienceInfo,
    financialAndVisa: {
      ...form.financialAndVisa,
      passportExpiryDate: form.financialAndVisa.passportExpiryDate || undefined,
    },
    attachments: {
      resumeCv: filePathOnly(form.attachments.resumeCv),
      statementOfPurpose: filePathOnly(form.attachments.statementOfPurpose),
      passportCopyUpload: filePathOnly(form.attachments.passportCopyUpload),
      nationalIdProof: filePathOnly(form.attachments.nationalIdProof),
      lettersOfRecommendation: form.attachments.lettersOfRecommendation || [],
    },
  };
};

export const getApplicationContinueUrl = (app) => {
  const programId = app.programId?._id || app.programId;
  if (!programId) return '/Programs_List';
  return `/user/apply/${programId}?applicationId=${app._id}`;
};

export const getApplicationViewUrl = (app) => `/user/applications/${app._id}`;

export const calculateProfileProgress = (user, applications = []) => {
  const p = user?.profile || {};
  let score = 0;
  const checks = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(p.phone),
    Boolean(p.nationality),
    Boolean(p.countryOfResidence),
    Boolean(p.dateOfBirth),
    Boolean(p.passportNumber),
  ];
  checks.forEach((c) => { if (c) score += 12; });
  if (applications.some((a) => !a.isDraft)) score += 16;
  return Math.min(100, score);
};

export const getSectionCompletion = (form) => ({
  personal: Boolean(
    form.personalInfo.firstName &&
    form.personalInfo.emailAddress &&
    form.personalInfo.contactNumber
  ),
  academic: Boolean(
    form.academicBackground.highSchoolName &&
    form.academicBackground.gpaOrPercentage &&
    form.academicBackground.yearOfGraduation &&
    form.academicBackground.transcriptUpload
  ),
  language: Boolean(
    form.languageProficiency.examType === 'Not Required' ||
    (form.languageProficiency.score && form.languageProficiency.IELTSresult)
  ),
  program: Boolean(
    form.programInterest.programType &&
    form.programInterest.fieldOfStudy &&
    form.programInterest.interestedCountry
  ),
  experience: true,
  financial: Boolean(form.financialAndVisa.fundingSource),
  documents: Boolean(form.attachments.resumeCv && form.attachments.statementOfPurpose),
});
