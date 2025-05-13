import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Attachment[];
  timestamp: string;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive';
  labels: string[];
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: Attachment[];
}

const emailApi = {
  // Fetch emails with pagination and filtering
  list: async (params: {
    folder?: string;
    page?: number;
    limit?: number;
    search?: string;
    labels?: string[];
  }) => {
    const response = await axios.get(`${BASE_URL}/api/emails`, { params });
    return response.data;
  },

  // Get a single email by ID
  get: async (id: string) => {
    const response = await axios.get(`${BASE_URL}/api/emails/${id}`);
    return response.data;
  },

  // Send a new email
  send: async (email: EmailDraft) => {
    const response = await axios.post(`${BASE_URL}/api/emails`, email);
    return response.data;
  },

  // Reply to an email
  reply: async (id: string, body: string) => {
    const response = await axios.post(`${BASE_URL}/api/emails/${id}/reply`, { body });
    return response.data;
  },

  // Forward an email
  forward: async (id: string, to: string[]) => {
    const response = await axios.post(`${BASE_URL}/api/emails/${id}/forward`, { to });
    return response.data;
  },

  // Move email to a different folder
  move: async (id: string, folder: string) => {
    const response = await axios.put(`${BASE_URL}/api/emails/${id}/move`, { folder });
    return response.data;
  },

  // Mark email as read/unread
  markAsRead: async (id: string, read: boolean) => {
    const response = await axios.put(`${BASE_URL}/api/emails/${id}/read`, { read });
    return response.data;
  },

  // Star/unstar email
  star: async (id: string, starred: boolean) => {
    const response = await axios.put(`${BASE_URL}/api/emails/${id}/star`, { starred });
    return response.data;
  },

  // Add/remove labels
  updateLabels: async (id: string, labels: string[]) => {
    const response = await axios.put(`${BASE_URL}/api/emails/${id}/labels`, { labels });
    return response.data;
  },

  // Delete email (move to trash)
  delete: async (id: string) => {
    const response = await axios.delete(`${BASE_URL}/api/emails/${id}`);
    return response.data;
  },

  // Permanently delete email
  permanentDelete: async (id: string) => {
    const response = await axios.delete(`${BASE_URL}/api/emails/${id}/permanent`);
    return response.data;
  },

  // Upload attachment
  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${BASE_URL}/api/emails/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get email statistics
  getStats: async () => {
    const response = await axios.get(`${BASE_URL}/api/emails/stats`);
    return response.data;
  },
};

export default emailApi; 