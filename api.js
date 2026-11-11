/**
 * Unified API Client for Tourist Safety System
 * Communicates with Python Flask Backend on port 5000.
 * Includes graceful offline fallback for offline viva presentations.
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';

export const getAuthToken = () => localStorage.getItem('tourist_safety_token');
export const setAuthToken = (token) => localStorage.setItem('tourist_safety_token', token);
export const clearAuthToken = () => {
  localStorage.removeItem('tourist_safety_token');
  localStorage.removeItem('tourist_safety_user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('tourist_safety_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('tourist_safety_user', JSON.stringify(user));
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (err) {
    // If backend connection refused (e.g. backend not started yet), log friendly warning
    console.warn(`[API Notice] Request to ${endpoint} failed: ${err.message}`);
    throw err;
  }
}

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      setAuthToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  register: async (userData) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) {
      setAuthToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  getCurrentUser: async () => {
    return await request('/auth/me');
  },

  logout: () => {
    clearAuthToken();
  },

  // GPS Tracking & Location
  sendLocationUpdate: async (locationPayload) => {
    return await request('/location/update', {
      method: 'POST',
      body: JSON.stringify(locationPayload),
    });
  },

  toggleTracking: async (isTracking) => {
    return await request('/location/toggle', {
      method: 'POST',
      body: JSON.stringify({ is_tracking: isTracking }),
    });
  },

  getAdminLatestLocations: async () => {
    return await request('/location/latest');
  },

  // Emergency SOS & Incidents
  triggerSOS: async (sosPayload) => {
    return await request('/sos', {
      method: 'POST',
      body: JSON.stringify(sosPayload),
    });
  },

  getIncidents: async (status = 'ALL') => {
    return await request(`/incidents?status=${status}`);
  },

  updateIncidentStatus: async (incidentId, status, notes, responderName) => {
    return await request(`/incidents/${incidentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes, responder_name: responderName }),
    });
  },

  // Danger Zones (Geo-fencing)
  getDangerZones: async () => {
    return await request('/danger-zones');
  },

  createDangerZone: async (zoneData) => {
    return await request('/danger-zones', {
      method: 'POST',
      body: JSON.stringify(zoneData),
    });
  },

  deleteDangerZone: async (zoneId) => {
    return await request(`/danger-zones/${zoneId}`, {
      method: 'DELETE',
    });
  },

  // Blockchain Ledger & Digital ID
  getBlockchainLedger: async () => {
    return await request('/blockchain');
  },

  verifyBlockchain: async () => {
    return await request('/blockchain/verify', { method: 'POST' });
  },

  tamperBlockchainDemo: async (blockIndex = 1) => {
    return await request('/blockchain/tamper', {
      method: 'POST',
      body: JSON.stringify({ index: blockIndex }),
    });
  },

  repairBlockchainDemo: async () => {
    return await request('/blockchain/repair', { method: 'POST' });
  },

  verifyDigitalIdPublic: async (touristId) => {
    return await request(`/digital-id/${touristId}`);
  },

  // Admin Dashboard Statistics
  getAdminStats: async () => {
    return await request('/admin/stats');
  },

  getAdminTourists: async () => {
    return await request('/admin/tourists');
  },

  // AI Assistant & Chatbot
  sendAIChat: async (message) => {
    return await request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getAIRiskAssessment: async (lat, lng, battery) => {
    return await request('/ai/risk-assessment', {
      method: 'POST',
      body: JSON.stringify({ latitude: lat, longitude: lng, battery_level: battery }),
    });
  },
};
