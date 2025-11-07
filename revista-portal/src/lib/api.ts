import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),

  updateProfile: (data: { name?: string }) =>
    api.put('/auth/profile', data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/auth/password', data),
};

// Publishers API
export const publishersApi = {
  getAll: () => api.get('/publishers'),

  getById: (id: number) => api.get(`/publishers/${id}`),

  create: (data: { name: string; description?: string; logo_url?: string }) =>
    api.post('/publishers', data),

  update: (id: number, data: { name?: string; description?: string; logo_url?: string }) =>
    api.put(`/publishers/${id}`, data),

  delete: (id: number) => api.delete(`/publishers/${id}`),
};

// Titles API
export const titlesApi = {
  getAll: (publisher_id?: number) =>
    api.get('/titles', { params: { publisher_id } }),

  getById: (id: number) => api.get(`/titles/${id}`),

  create: (data: {
    publisher_id: number;
    name: string;
    description?: string;
    cover_image_url?: string;
    genre?: string;
  }) => api.post('/titles', data),

  update: (id: number, data: {
    publisher_id?: number;
    name?: string;
    description?: string;
    cover_image_url?: string;
    genre?: string;
  }) => api.put(`/titles/${id}`, data),

  delete: (id: number) => api.delete(`/titles/${id}`),
};

// Issues API
export const issuesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    title_id?: number;
    publication_year?: number;
  }) => api.get('/issues', { params }),

  getById: (id: number) => api.get(`/issues/${id}`),

  search: (term: string, limit?: number) =>
    api.get('/issues/search', { params: { term, limit } }),

  create: (data: {
    title_id: number;
    issue_number: number;
    publication_year: number;
    cover_image_url?: string;
    pdf_url?: string;
    description?: string;
  }) => api.post('/issues', data),

  update: (id: number, data: {
    title_id?: number;
    issue_number?: number;
    publication_year?: number;
    cover_image_url?: string;
    pdf_url?: string;
    description?: string;
  }) => api.put(`/issues/${id}`, data),

  delete: (id: number) => api.delete(`/issues/${id}`),
};

// Ratings & Comments API
export const ratingsApi = {
  rate: (issue_id: number, value: number) =>
    api.post(`/issues/${issue_id}/rate`, { value }),

  getRatings: (issue_id: number) =>
    api.get(`/issues/${issue_id}/ratings`),

  addComment: (issue_id: number, content: string) =>
    api.post(`/issues/${issue_id}/comments`, { content }),

  getComments: (issue_id: number, params?: { limit?: number; offset?: number }) =>
    api.get(`/issues/${issue_id}/comments`, { params }),

  deleteComment: (comment_id: number) =>
    api.delete(`/comments/${comment_id}`),
};

// Favorites API
export const favoritesApi = {
  getAll: () => api.get('/favorites'),

  add: (issue_id: number) => api.post(`/favorites/${issue_id}`),

  remove: (issue_id: number) => api.delete(`/favorites/${issue_id}`),

  check: (issue_id: number) => api.get(`/favorites/${issue_id}/check`),
};
