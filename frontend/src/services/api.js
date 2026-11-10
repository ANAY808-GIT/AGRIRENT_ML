const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('agrirent_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('agrirent_token', token);
  } else {
    localStorage.removeItem('agrirent_token');
  }
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('agrirent_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('agrirent_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('agrirent_user');
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Machinery
  getMachinery: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/machinery?${query.toString()}`);
  },
  getMachineryById: (id) => request(`/machinery/${id}`),
  addMachinery: (data) => request('/machinery', { method: 'POST', body: JSON.stringify(data) }),
  updateMachinery: (id, data) => request(`/machinery/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMachinery: (id) => request(`/machinery/${id}`, { method: 'DELETE' }),
  getCategories: () => request('/machinery/categories'),

  // Bookings
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getFarmerBookings: (status = '') => request(`/bookings/farmer${status ? `?status=${status}` : ''}`),
  getOwnerBookings: (status = '') => request(`/bookings/owner${status ? `?status=${status}` : ''}`),
  updateBookingStatus: (id, status, notes = '') => request(`/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, owner_notes: notes })
  }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
  completeBooking: (id) => request(`/bookings/${id}/complete`, { method: 'POST' }),

  // Payments & Earnings
  processPayment: (data) => request('/payments/process', { method: 'POST', body: JSON.stringify(data) }),
  getPaymentHistory: () => request('/payments/history'),
  getOwnerEarnings: () => request('/payments/owner-earnings'),
  getInvoice: (bookingId) => request(`/payments/invoice/${bookingId}`),

  // Reviews
  submitReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getOwnerReviews: () => request('/reviews/owner'),
  getFarmerReviews: () => request('/reviews/farmer'),

  // Machine Learning
  predictDemand: (data) => request('/ml/predict', { method: 'POST', body: JSON.stringify(data) }),
  getMLOptions: () => request('/ml/options'),
  getMLMetrics: () => request('/ml/metrics'),
  getSeasonalRecommendations: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/ml/seasonal-recommendations?${query.toString()}`);
  },

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/admin/users?${query.toString()}`);
  },
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle-status`, { method: 'PUT' }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminMachinery: () => request('/admin/machinery'),
  getAdminBookings: () => request('/admin/bookings'),
  getAdminAnalytics: () => request('/admin/analytics')
};

