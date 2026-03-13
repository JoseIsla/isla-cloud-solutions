const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com:3012';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  return res.json();
}

// Upload image (multipart)
async function uploadImage(file: File, token: string): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error subiendo imagen' }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: { id: number; email: string; name: string; role: string } }>('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: (token: string) =>
    apiRequest<{ id: number; email: string; name: string; role: string }>('/api/auth/me', { token }),
};

// Services
export const servicesApi = {
  list: () => apiRequest<ServiceFromAPI[]>('/api/services'),
  get: (idOrSlug: string) => apiRequest<ServiceFromAPI>(`/api/services/${idOrSlug}`),
  create: (data: Partial<ServiceFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/services', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<ServiceFromAPI>, token: string) =>
    apiRequest('/api/services/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/services/' + id, { method: 'DELETE', token }),
};

// News
export const newsApi = {
  list: (token?: string | null) => apiRequest<NewsFromAPI[]>('/api/news', { token: token || undefined }),
  get: (idOrSlug: string) => apiRequest<NewsFromAPI>(`/api/news/${idOrSlug}`),
  create: (data: Partial<NewsFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/news', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<NewsFromAPI>, token: string) =>
    apiRequest('/api/news/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/news/' + id, { method: 'DELETE', token }),
};

// Contacts
export const contactsApi = {
  send: (data: { nombre: string; email: string; empresa?: string; telefono?: string; mensaje: string }) =>
    apiRequest('/api/contacts', { method: 'POST', body: data }),
  list: (token: string) => apiRequest<ContactFromAPI[]>('/api/contacts', { token }),
  markRead: (id: number, token: string) =>
    apiRequest(`/api/contacts/${id}/read`, { method: 'PUT', token }),
  delete: (id: number, token: string) =>
    apiRequest(`/api/contacts/${id}`, { method: 'DELETE', token }),
};

// Contents
export const contentsApi = {
  list: () => apiRequest<Record<string, ContentFromAPI>>('/api/contents'),
  update: (key: string, value: string, token: string, title?: string) =>
    apiRequest(`/api/contents/${key}`, { method: 'PUT', body: { value, title }, token }),
};

// Clients
export const clientsApi = {
  list: () => apiRequest<ClientFromAPI[]>('/api/clients'),
  create: (data: Partial<ClientFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/clients', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<ClientFromAPI>, token: string) =>
    apiRequest('/api/clients/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/clients/' + id, { method: 'DELETE', token }),
};

// Upload
export { uploadImage };

// Types
export interface ServiceFromAPI {
  id: number;
  slug: string;
  title: string;
  short_title: string;
  description: string;
  long_description: string;
  icon: string;
  features: string[];
  image_url: string;
  sort_order: number;
  is_active: number;
}

export interface NewsFromAPI {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  is_published: number;
  published_at: string;
  created_at: string;
}

export interface ContactFromAPI {
  id: number;
  nombre: string;
  email: string;
  empresa: string;
  telefono: string;
  mensaje: string;
  is_read: number;
  created_at: string;
}

export interface ContentFromAPI {
  id: number;
  content_key: string;
  title: string;
  value: string;
  content_type: string;
}

export interface ClientFromAPI {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  sort_order: number;
  is_active: number;
}
