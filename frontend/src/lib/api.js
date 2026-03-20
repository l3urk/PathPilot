import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const profileAPI = {
  extract: (data) => api.post('/profile/extract', data),
};

export const diagnosticAPI = {
  getQuestions: (role) => api.get(`/diagnostic/questions/${role}`),
  submit: (data) => api.post('/diagnostic/submit', data),
};

export const pathwayAPI = {
  generate: (data) => api.post('/pathway/generate', data),
  getRoles: () => api.get('/pathway/roles'),
};

export default api;