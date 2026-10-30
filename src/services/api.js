
// ==========================================
// API CONFIGURATION
// ==========================================

let raw = String(
  process.env.REACT_APP_API_URL || 'http://localhost:7000/api'
).trim();

if (!raw) {
  raw = 'http://localhost:7000/api';
}

if (!/^https?:\/\//i.test(raw)) {
  raw = `https://${raw.replace(/^\/+/, '')}`;
}

const trimmed = raw.replace(/\/+$/, '');

const API_BASE = trimmed.endsWith('/api')
  ? trimmed
  : `${trimmed}/api`;

export const FILE_BASE_URL =
  process.env.REACT_APP_FILE_BASE_URL ||
  'https://aireasetravels-backend-production.up.railway.app';


// ==========================================
// AUTHENTICATION
// ==========================================

export const getToken = () => localStorage.getItem('token');


// ==========================================
// COMMON API REQUEST FUNCTION
// ==========================================

export async function apiRequest(endpoint, options = {}) {
  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body = options.body;

  // Convert normal objects to JSON.
  // Keep FormData untouched.
  if (
    body &&
    !isFormData &&
    typeof body === 'object' &&
    !(body instanceof Blob)
  ) {
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      body,
      headers,
    });

    let data = {};

    try {
      const responseText = await response.text();
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      const message =
        data.message ||
        (Array.isArray(data.errors)
          ? data.errors.join(', ')
          : null) ||
        `Request failed (${response.status})`;

      throw new Error(message);
    }

    return data;

  } catch (error) {
    if (
      error.message &&
      !error.message.includes('Failed to fetch')
    ) {
      throw error;
    }

    throw new Error('Cannot reach the server.');
  }
}


// ==========================================
// AUTH API
// ==========================================

export const authAPI = {
  signin: (credentials) =>
    apiRequest('/auth/signin', {
      method: 'POST',
      body: credentials,
    }),

  signup: (payload) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: payload,
    }),

  me: () =>
    apiRequest('/auth/me'),

  requestPasswordOtp: () =>
    apiRequest('/auth/request-password-otp', {
      method: 'POST',
    }),

  updateProfile: (payload) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: payload,
    }),
};


// ==========================================
// UNIVERSITIES API
// ==========================================

export const universitiesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return apiRequest(
      `/universities${query ? `?${query}` : ''}`
    );
  },

  getById: (id) =>
    apiRequest(`/universities/${id}`),

  create: (payload) =>
    apiRequest('/universities', {
      method: 'POST',
      body: payload,
    }),

  update: (id, payload) =>
    apiRequest(`/universities/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id) =>
    apiRequest(`/universities/${id}`, {
      method: 'DELETE',
    }),
};


// ==========================================
// PROGRAMS API
// ==========================================

export const programsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return apiRequest(
      `/programs${query ? `?${query}` : ''}`
    );
  },

  getById: (id) =>
    apiRequest(`/programs/${id}`),

  create: (payload) =>
    apiRequest('/programs', {
      method: 'POST',
      body: payload,
    }),

  update: (id, payload) =>
    apiRequest(`/programs/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id) =>
    apiRequest(`/programs/${id}`, {
      method: 'DELETE',
    }),
};


// ==========================================
// COUNTRY DETAILS API
// ==========================================

export const countryDetailsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return apiRequest(
      `/country-details${query ? `?${query}` : ''}`
    );
  },

  create: (payload) =>
    apiRequest('/country-details', {
      method: 'POST',
      body: payload,
    }),

  update: (id, payload) =>
    apiRequest(`/country-details/${id}`, {
      method: 'PUT',
      body: payload,
    }),
};


// ==========================================
// VISA APPLICATIONS API
// ==========================================

export const visaApplicationsAPI = {
  getAllAdmin: () =>
    apiRequest('/visa-applications/admin/all'),

  getById: (id) =>
    apiRequest(`/visa-applications/${id}`),

  getMine: () =>
    apiRequest('/visa-applications/mine'),

  getDraftByProgram: (programId) =>
    apiRequest(
      `/visa-applications/draft/program/${programId}`
    ),

  // Save application draft
  saveDraft: (payload) =>
    apiRequest('/visa-applications/draft', {
      method: 'POST',
      body: payload,
    }),

  // Submit a new application
  submit: (payload) =>
    apiRequest('/visa-applications', {
      method: 'POST',
      body: payload,
    }),

  // Submit an existing draft
  submitDraft: (id, payload) =>
    apiRequest(`/visa-applications/${id}/submit`, {
      method: 'POST',
      body: payload,
    }),

  update: (id, payload) =>
    apiRequest(`/visa-applications/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  delete: (id) =>
    apiRequest(`/visa-applications/${id}`, {
      method: 'DELETE',
    }),
};


// ==========================================
// STUDENTS API
// ==========================================

export const studentsAPI = {
  getAll: async () => {
    const res = await apiRequest('/auth/admin/students');

    if (Array.isArray(res)) {
      return res;
    }

    if (res && Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  },

  getById: (id) =>
    apiRequest(`/auth/admin/students/${id}`),

  delete: (id) =>
    apiRequest(`/auth/admin/students/${id}`, {
      method: 'DELETE',
    }),
};


// ==========================================
// ROLE UTILITIES
// ==========================================

export {
  isStaffRole,
  isStudent,
  isSuperAdmin,
  hasPermission,
} from '../utils/roles';


// ==========================================
// TEAM API
// ==========================================

export const teamAPI = {
  list: () =>
    apiRequest('/auth/team'),

  updateRole: (userId, role) =>
    apiRequest(`/auth/team/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    }),

  remove: (userId) =>
    apiRequest(`/auth/team/${userId}`, {
      method: 'DELETE',
    }),

  invite: (payload) =>
    apiRequest('/auth/team/invite', {
      method: 'POST',
      body: payload,
    }),
};
