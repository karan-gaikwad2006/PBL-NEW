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
    apiRequest('/v1/users/profile', {
      method: 'GET',
    }, token),
};

export default apiRequest;
