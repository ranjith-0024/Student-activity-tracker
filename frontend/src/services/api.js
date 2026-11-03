import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Turn any Axios error into a user-safe message plus optional field errors.
 * Backend messages are already sanitised; anything else falls back to a
 * generic message so implementation details never reach the UI.
 */
export function parseApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.error) {
    const { message, details } = error.response.data.error;
    const status = error.response.status;
    return {
      message: status >= 500 ? fallback : message || fallback,
      fieldErrors: details || {},
      status,
    };
  }
  if (error?.request) {
    return {
      message: 'Unable to reach the server. Check that the backend is running.',
      fieldErrors: {},
      status: 0,
    };
  }
  return { message: fallback, fieldErrors: {}, status: 0 };
}

export const activityApi = {
  list: () => api.get('/activities').then((r) => r.data.data),
  create: (payload) => api.post('/activities', payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/activities/${id}`).then((r) => r.data),
};

export const summaryApi = {
  get: () => api.get('/summary').then((r) => r.data),
  byStudent: () => api.get('/summary/students').then((r) => r.data.data),
  byActivity: () => api.get('/summary/activities').then((r) => r.data.data),
};

export default api;
