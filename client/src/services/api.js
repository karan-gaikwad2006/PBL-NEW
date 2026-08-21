const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Reusable fetch wrapper with auth header support
 */
async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
  create: (token, data) =>
    apiRequest('/v1/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.district && filters.district !== 'ALL') params.append('district', filters.district);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/v1/requirements${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  getById: (id) =>
    apiRequest(`/v1/requirements/${id}`, {
      method: 'GET',
    }),
};

export default apiRequest;
