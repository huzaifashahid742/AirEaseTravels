const resolveApiBase = () => {
  let raw = String(process.env.REACT_APP_API_URL || 'http://localhost:7000/api').trim();
  if (!raw) raw = 'http://localhost:7000/api';

  // Host-only values (e.g. "myapp.up.railway.app") must become absolute URLs or
  // fetch treats them as same-origin paths and static hosts return 405 on POST.
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw.replace(/^\/+/, '')}`;
  }

  const trimmed = raw.replace(/\/$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
};

const API_BASE = resolveApiBase();

// --- ADD THIS NEW EXPORT RIGHT HERE ---
// This safely strips '/api' off the end to get the raw root server URL (http://localhost:7000)
export const FILE_BASE_URL = API_BASE.replace(/\/api$/, '');  

export const getToken = () => localStorage.getItem('token');

export async function apiRequest(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    let data = {};
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      const message =
        data.message ||
        (Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
        `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    // If it's already an Error we threw (like response.ok check), rethrow it
    if (error.message && !error.message.includes('Failed to fetch')) {
      throw error;
    }
    // Otherwise, it's a network/fetch failure
    throw new Error(
      'Cannot reach the server. Start the backend (port 7000) and check REACT_APP_API_URL in frontend/.env'
    );
  }
}


export const authAPI = {
  signin: (credentials) =>
    apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  signup: (payload) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: payload,
    }),
  me: () => apiRequest('/auth/me'),
  updateProfile: (payload) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),
};

export const universitiesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/universities${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/universities/${id}`),
  create: (payload) =>
    apiRequest('/universities', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) =>
    apiRequest(`/universities/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id) => apiRequest(`/universities/${id}`, { method: 'DELETE' }),
};

export const programsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/programs${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/programs/${id}`),
  create: (payload) =>
    apiRequest('/programs', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) =>
    apiRequest(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id) => apiRequest(`/programs/${id}`, { method: 'DELETE' }),
};
export const countryDetailsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/country-details${query ? `?${query}` : ''}`);
  },
  
  // 🔴 Pass FormData payload directly without JSON.stringify
  create: (payload) =>
    apiRequest('/country-details', { 
      method: 'POST', 
      body: payload 
    }),
    
  // 🔴 Pass FormData payload directly without JSON.stringify
  update: (id, payload) =>
    apiRequest(`/country-details/${id}`, { 
      method: 'PUT', 
      body: payload 
    }),
};
export const visaApplicationsAPI = {
  getAllAdmin: () => apiRequest('/visa-applications/admin/all'),
  getById: (id) => apiRequest(`/visa-applications/${id}`),
  getMine: () => apiRequest('/visa-applications/mine'),
  getDraftByProgram: (programId) => apiRequest(`/visa-applications/draft/program/${programId}`),
  
  // 🔴 Updated to accept FormData directly without JSON.stringify
  saveDraft: (payload) =>
    apiRequest('/visa-applications/draft', {
      method: 'POST',
      body: payload, 
    }),
    
  // 🔴 Updated to accept FormData directly without JSON.stringify
  submit: (payload) =>
    apiRequest('/visa-applications', {
      method: 'POST',
      body: payload,
    }),
    
  // 🔴 Updated to accept FormData directly without JSON.stringify
  submitDraft: (id, payload) =>
    apiRequest(`/visa-applications/${id}/submit`, {
      method: 'POST',
      body: payload,
    }),
    
  update: (id, payload) =>
    apiRequest(`/visa-applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
    
  delete: (id) => apiRequest(`/visa-applications/${id}`, { method: 'DELETE' }),
};

export const studentsAPI = {
  getAll: async () => {
    const res = await apiRequest('/auth/admin/students');
    // If the top layer is the raw array, return it.
    if (Array.isArray(res)) return res;
    // If the array is wrapped in your standard server response metadata (.data), extract it
    if (res && Array.isArray(res.data)) return res.data;
    // Fallback default
    return [];
  },
  getById: (id) => apiRequest(`/auth/admin/students/${id}`),
  delete: (id) => apiRequest(`/auth/admin/students/${id}`, { method: 'DELETE' }),
};

export { isStaffRole, isStudent, isSuperAdmin, hasPermission } from '../utils/roles';

export const teamAPI = {
  list: () => apiRequest('/auth/team'),
  updateRole: (userId, role) =>
    apiRequest(`/auth/team/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  remove: (userId) =>
    apiRequest(`/auth/team/${userId}`, { method: 'DELETE' }),
  invite: (payload) =>
    apiRequest('/auth/team/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};