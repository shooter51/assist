import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// File operations
export const fileApi = {
  list: (path: string) => api.get(`/api/files?path=${encodeURIComponent(path)}`),
  upload: (path: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    return api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  createFolder: (path: string, name: string) =>
    api.post('/api/files/folder', { path, name }),
  delete: (path: string) => api.delete(`/api/files?path=${encodeURIComponent(path)}`),
  move: (source: string, destination: string) =>
    api.post('/api/files/move', { source, destination }),
  copy: (source: string, destination: string) =>
    api.post('/api/files/copy', { source, destination }),
};

// Email operations
export const emailApi = {
  list: (folder: string = 'INBOX') => api.get(`/api/email?folder=${folder}`),
  get: (id: string) => api.get(`/api/email/${id}`),
  send: (data: {
    to: string;
    subject: string;
    body: string;
    attachments?: File[];
  }) => {
    const formData = new FormData();
    formData.append('to', data.to);
    formData.append('subject', data.subject);
    formData.append('body', data.body);
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    return api.post('/api/email/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id: string) => api.delete(`/api/email/${id}`),
  move: (id: string, folder: string) =>
    api.post(`/api/email/${id}/move`, { folder }),
};

// Social media operations
export const socialApi = {
  // Twitter
  twitter: {
    post: (content: string, media?: File[]) => {
      const formData = new FormData();
      formData.append('content', content);
      if (media) {
        media.forEach((file) => {
          formData.append('media', file);
        });
      }
      return api.post('/api/social/twitter/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    timeline: () => api.get('/api/social/twitter/timeline'),
    delete: (id: string) => api.delete(`/api/social/twitter/post/${id}`),
  },
  // Facebook
  facebook: {
    post: (content: string, media?: File[]) => {
      const formData = new FormData();
      formData.append('content', content);
      if (media) {
        media.forEach((file) => {
          formData.append('media', file);
        });
      }
      return api.post('/api/social/facebook/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    feed: () => api.get('/api/social/facebook/feed'),
    delete: (id: string) => api.delete(`/api/social/facebook/post/${id}`),
  },
};

// Settings operations
export const settingsApi = {
  get: () => api.get('/api/settings'),
  update: (settings: any) => api.put('/api/settings', settings),
  testConnection: (type: 'email' | 'nas' | 'twitter' | 'facebook') =>
    api.post(`/api/settings/test/${type}`),
};

// Authentication operations
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  logout: () => api.post('/api/auth/logout'),
  refresh: () => api.post('/api/auth/refresh'),
};

export default api; 