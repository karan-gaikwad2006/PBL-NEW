const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Reusable fetch wrapper with auth header support
 */
async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type to application/json if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }

    return result;
  } catch (error) {
    console.error(`[API] Error at ${endpoint}:`, error.message);
    throw error;
  }
}

export const userService = {
  sync: (token, role, fullName) => 
    apiRequest('/v1/users/sync', {
      method: 'POST',
      body: JSON.stringify({ role, fullName }),
    }, token),
    
  getProfile: (token) => 
    apiRequest('/v1/users/me', {
      method: 'GET',
    }, token),

  updateProfile: (token, data) =>
    apiRequest('/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),
};

export const institutionService = {
  getMine: (token) =>
    apiRequest('/v1/institutions/me', {
      method: 'GET',
    }, token),

  create: (token, data) =>
    apiRequest('/v1/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateMine: (token, data) =>
    apiRequest('/v1/institutions/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),

  uploadDocument: (token, formData) =>
    apiRequest('/v1/institutions/me/documents', {
      method: 'POST',
      body: formData,
    }, token),

  deleteDocument: (token, id) =>
    apiRequest(`/v1/institutions/me/documents/${id}`, {
      method: 'DELETE',
    }, token),

  adminGetAll: (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const qs = params.toString();
    return apiRequest(`/v1/institutions/admin/list${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  adminGetById: (token, id) =>
    apiRequest(`/v1/institutions/admin/${id}`, { method: 'GET' }, token),

  adminVerify: (token, id, status, notes = '') =>
    apiRequest(`/v1/institutions/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }, token),
};


export const districtService = {
  getAll: () => 
    apiRequest('/v1/districts', {
      method: 'GET',
    }),

  getById: (id) =>
    apiRequest(`/v1/districts/${encodeURIComponent(id)}`, {
      method: 'GET',
    }),
};

export const requirementService = {
  // ── Public ─────────────────────────────────────────────────────────────────
  create: (token, data) =>
    apiRequest('/v1/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.district && filters.district !== 'ALL') {
      params.append('district', filters.district);
    }
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/v1/requirements${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint, { method: 'GET' });
  },

  getById: (id) =>
    apiRequest(`/v1/requirements/${id}`, { method: 'GET' }),

  // ── Requester / Institution ─────────────────────────────────────────────────
  /** GET /mine/list — authenticated requester's own requirements */
  getMine: (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const qs = params.toString();
    return apiRequest(`/v1/requirements/mine/list${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  /** GET /:id/manage — owner or admin: all statuses */
  getMyById: (token, id) =>
    apiRequest(`/v1/requirements/${id}/manage`, { method: 'GET' }, token),

  // ── Admin ───────────────────────────────────────────────────────────────────
  /** GET /admin/list — all requirements with requester info */
  adminGetAll: (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const qs = params.toString();
    return apiRequest(`/v1/requirements/admin/list${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  /** GET /:id/admin — single requirement with requester info */
  adminGetById: (token, id) =>
    apiRequest(`/v1/requirements/${id}/admin`, { method: 'GET' }, token),

  /** PATCH /:id/approve — admin: under_review → active */
  adminApprove: (token, id) =>
    apiRequest(`/v1/requirements/${id}/approve`, { method: 'PATCH' }, token),

  /** PATCH /:id/reject — admin: → rejected */
  adminReject: (token, id) =>
    apiRequest(`/v1/requirements/${id}/reject`, { method: 'PATCH' }, token),
};

export const offerService = {
  create: (token, data) =>
    apiRequest('/v1/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  getMine: (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.filter) params.append('filter', filters.filter);
    const qs = params.toString();
    return apiRequest(`/v1/offers/mine${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  getStats: (token) =>
    apiRequest('/v1/offers/mine/stats', { method: 'GET' }, token),

  getById: (token, id) =>
    apiRequest(`/v1/offers/${id}`, { method: 'GET' }, token),

  confirmDonor: (token, id) =>
    apiRequest(`/v1/offers/${id}/confirm-donor`, { method: 'PATCH' }, token),

  confirmRequester: (token, id) =>
    apiRequest(`/v1/offers/${id}/confirm-requester`, { method: 'PATCH' }, token),

  getImpact: (token) =>
    apiRequest('/v1/offers/mine/impact', { method: 'GET' }, token),
};

export const notificationService = {
  getAll: (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const qs = params.toString();
    return apiRequest(`/v1/notifications${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  markRead: (token, id) =>
    apiRequest(`/v1/notifications/${id}/read`, { method: 'PATCH' }, token),

  markAllRead: (token) =>
    apiRequest('/v1/notifications/read-all', { method: 'PATCH' }, token),
};

export const adminStatsService = {
  getDashboardStats: (token) =>
    apiRequest('/v1/admin/stats', { method: 'GET' }, token),
};

export const adminFraudService = {
  getFraudSignals: (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const qs = params.toString();
    return apiRequest(`/v1/admin/fraud-signals${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  getEntityFraudSignals: (token, type, id) =>
    apiRequest(`/v1/admin/fraud-signals/entity/${type}/${id}`, { method: 'GET' }, token),

  resolveFraudSignal: (token, id, status) =>
    apiRequest(`/v1/admin/fraud-signals/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token),
};

export default apiRequest;

