const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal request wrapper with error handling and response normalization
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    throw new Error('Unable to connect to server. Please check your network or server status.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }
    return null;
  }

  if (!response.ok || (data && data.success === false)) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data?.error?.details || null;
    throw err;
  }

  return data?.data !== undefined ? data.data : data;
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Places
  getPlaces: ({ search = '', category = '', page = 1, limit = 9 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    return request(`/places?${params.toString()}`);
  },

  createPlace: (placeData) => {
    return request('/places', {
      method: 'POST',
      body: JSON.stringify(placeData)
    });
  },

  getPlaceById: (id) => {
    return request(`/places/${id}`);
  },

  deletePlace: (id) => {
    return request(`/places/${id}`, {
      method: 'DELETE'
    });
  },

  // Stats
  getPlaceStats: (id, dayType = 'All') => {
    const params = new URLSearchParams();
    if (dayType && dayType !== 'All') {
      params.append('dayType', dayType);
    }
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request(`/places/${id}/stats${queryStr}`);
  },

  // Reports
  getPlaceReports: (id, { page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    return request(`/places/${id}/reports?${params.toString()}`);
  },

  submitReport: (id, reportData) => {
    return request(`/places/${id}/reports`, {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }
};
