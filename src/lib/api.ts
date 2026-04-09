export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

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
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  return res.json();
}

// Upload image (multipart)
async function uploadImage(file: File, token: string, category?: string): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('image', file);
  if (category) formData.append('category', category);

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
  list: (tokenOrLang?: string | null, lang?: string) => {
    const isToken = tokenOrLang && tokenOrLang.length > 20;
    const queryLang = lang || (!isToken ? tokenOrLang : undefined);
    const token = isToken ? tokenOrLang : undefined;
    const qs = queryLang && queryLang !== 'es' ? `?lang=${queryLang}` : '';
    return apiRequest<ServiceFromAPI[]>(`/api/services${qs}`, { token: token || undefined });
  },
  get: (idOrSlug: string, lang?: string) => {
    const qs = lang && lang !== 'es' ? `?lang=${lang}` : '';
    return apiRequest<ServiceFromAPI>(`/api/services/${idOrSlug}${qs}`);
  },
  create: (data: Partial<ServiceFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/services', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<ServiceFromAPI>, token: string) =>
    apiRequest('/api/services/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/services/' + id, { method: 'DELETE', token }),
};

// News
export const newsApi = {
  list: (tokenOrLang?: string | null, lang?: string) => {
    const isToken = tokenOrLang && tokenOrLang.length > 20;
    const queryLang = lang || (!isToken ? tokenOrLang : undefined);
    const token = isToken ? tokenOrLang : undefined;
    const qs = queryLang && queryLang !== 'es' ? `?lang=${queryLang}` : '';
    return apiRequest<NewsFromAPI[]>(`/api/news${qs}`, { token: token || undefined });
  },
  get: (idOrSlug: string, lang?: string) => {
    const qs = lang && lang !== 'es' ? `?lang=${lang}` : '';
    return apiRequest<NewsFromAPI>(`/api/news/${idOrSlug}${qs}`);
  },
  create: (data: Partial<NewsFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/news', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<NewsFromAPI>, token: string) =>
    apiRequest('/api/news/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/news/' + id, { method: 'DELETE', token }),
};

// Contacts
export const contactsApi = {
  send: (data: { nombre: string; email: string; empresa?: string; telefono?: string; mensaje: string; recaptchaToken: string }) =>
    apiRequest('/api/contacts', { method: 'POST', body: data }),
  list: (token: string) => apiRequest<ContactFromAPI[]>('/api/contacts', { token }),
  markRead: (id: number, token: string) =>
    apiRequest(`/api/contacts/${id}/read`, { method: 'PUT', token }),
  delete: (id: number, token: string) =>
    apiRequest(`/api/contacts/${id}`, { method: 'DELETE', token }),
};

// Contents
export const contentsApi = {
  list: (lang?: string) => apiRequest<Record<string, ContentFromAPI>>(`/api/contents${lang ? `?lang=${lang}` : ''}`),
  listFresh: (token: string) => apiRequest<Record<string, ContentFromAPI>>('/api/contents', { token }),
  update: (key: string, value: string, token: string, title?: string) =>
    apiRequest<ContentUpdateResponse>(`/api/contents/${key}`, { method: 'PUT', body: { value, title }, token }),
  translateAll: (token: string) =>
    apiRequest<ContentTranslateAllResponse>('/api/contents/translate-all', { method: 'POST', token }),
  translateEntities: (token: string) =>
    apiRequest<{ ok: boolean; message: string; count: number }>('/api/contents/translate-entities', { method: 'POST', token }),
  diagnostics: (token: string) =>
    apiRequest<ContentTranslationDiagnosticsResponse>('/api/contents/diagnostics', { token }),
};

// Users (admin management)
export const usersApi = {
  list: (token: string) => apiRequest<{ id: number; name: string; email: string; role: string; created_at: string }[]>('/api/users', { token }),
  create: (data: { name: string; email: string; password: string; role?: string }, token: string) =>
    apiRequest<{ id: number }>('/api/users', { method: 'POST', body: data, token }),
  update: (id: number, data: { name?: string; email?: string; password?: string }, token: string) =>
    apiRequest('/api/users/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/users/' + id, { method: 'DELETE', token }),
  changePassword: (data: { currentPassword: string; newPassword: string }, token: string) =>
    apiRequest<{ success: boolean }>('/api/users/me/password', { method: 'PUT', body: data, token }),
  listLocked: (token: string) =>
    apiRequest<LockedUserFromAPI[]>('/api/users/locked', { token }),
  unlock: (id: number, token: string) =>
    apiRequest<{ success: boolean }>('/api/users/' + id + '/unlock', { method: 'PUT', token }),
};

export interface LockedUserFromAPI {
  id: number;
  name: string;
  email: string;
  role: string;
  failed_login_attempts: number;
  created_at: string;
  recent_attempts: { ip_address: string; attempted_at: string }[];
}

// Clients
export const clientsApi = {
  list: (token?: string | null) => apiRequest<ClientFromAPI[]>('/api/clients', { token: token || undefined }),
  create: (data: Partial<ClientFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/clients', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<ClientFromAPI>, token: string) =>
    apiRequest('/api/clients/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/clients/' + id, { method: 'DELETE', token }),
};

// Testimonials
export const testimonialsApi = {
  list: (langOrToken?: string | null, lang?: string) => {
    const isToken = langOrToken && langOrToken.length > 20;
    const queryLang = lang || (!isToken ? langOrToken : undefined);
    const token = isToken ? langOrToken : undefined;
    const qs = queryLang && queryLang !== 'es' ? `?lang=${queryLang}` : '';
    return apiRequest<TestimonialFromAPI[]>(`/api/testimonials${qs}`, { token: token || undefined });
  },
  listAll: (token: string) => apiRequest<TestimonialFromAPI[]>('/api/testimonials/all', { token }),
  create: (data: Partial<TestimonialFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/testimonials', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<TestimonialFromAPI>, token: string) =>
    apiRequest('/api/testimonials/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/testimonials/' + id, { method: 'DELETE', token }),
};

// Cases (success stories)
export const casesApi = {
  list: (tokenOrLang?: string | null, lang?: string) => {
    const isToken = tokenOrLang && tokenOrLang.length > 20;
    const queryLang = lang || (!isToken ? tokenOrLang : undefined);
    const token = isToken ? tokenOrLang : undefined;
    const qs = queryLang && queryLang !== 'es' ? `?lang=${queryLang}` : '';
    return apiRequest<CaseFromAPI[]>(`/api/cases${qs}`, { token: token || undefined });
  },
  get: (idOrSlug: number | string, lang?: string) => {
    const qs = lang && lang !== 'es' ? `?lang=${lang}` : '';
    return apiRequest<CaseFromAPI>(`/api/cases/${idOrSlug}${qs}`);
  },
  create: (data: Partial<CaseFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/cases', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<CaseFromAPI>, token: string) =>
    apiRequest('/api/cases/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/cases/' + id, { method: 'DELETE', token }),
};

// FAQs
export const faqsApi = {
  list: (langOrToken?: string | null, lang?: string) => {
    const isToken = langOrToken && langOrToken.length > 20;
    const queryLang = lang || (!isToken ? langOrToken : undefined);
    const token = isToken ? langOrToken : undefined;
    const qs = queryLang && queryLang !== 'es' ? `?lang=${queryLang}` : '';
    return apiRequest<FAQFromAPI[]>(`/api/faqs${qs}`, { token: token || undefined });
  },
  listAll: (token: string) => apiRequest<FAQFromAPI[]>('/api/faqs/all', { token }),
  create: (data: Partial<FAQFromAPI>, token: string) =>
    apiRequest<{ id: number }>('/api/faqs', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<FAQFromAPI>, token: string) =>
    apiRequest('/api/faqs/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/faqs/' + id, { method: 'DELETE', token }),
};

// Media
export const mediaApi = {
  list: (token: string, params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return apiRequest<MediaFromAPI[]>(`/api/media${qs ? '?' + qs : ''}`, { token });
  },
  categories: (token: string) => apiRequest<string[]>('/api/media/categories', { token }),
  create: (data: Partial<MediaFromAPI>, token: string) =>
    apiRequest<{ id: number; url: string }>('/api/media', { method: 'POST', body: data, token }),
  update: (id: number, data: Partial<MediaFromAPI>, token: string) =>
    apiRequest('/api/media/' + id, { method: 'PUT', body: data, token }),
  delete: (id: number, token: string) =>
    apiRequest('/api/media/' + id, { method: 'DELETE', token }),
  sync: (token: string) =>
    apiRequest<{ message: string; inserted: number; total: number }>('/api/media/sync', { method: 'POST', token }),
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
  sort_order: number;
  meta_title: string;
  meta_description: string;
  noindex: number;
  nofollow: number;
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

export interface ContentUpdateResponse {
  message: string;
  translation?: {
    queued: boolean;
    status: 'queued' | 'skipped';
    message: string;
  };
}

export interface ContentTranslationEventFromAPI {
  id: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
  stage: string;
  key: string | null;
  message: string;
  details: string;
}

export interface ContentTranslationDiagnostics {
  status: 'healthy' | 'warning' | 'error';
  runtime: {
    openaiConfigured: boolean;
    model: string;
    transport: string;
    fetchAvailable: boolean;
  };
  issues: string[];
  counts: {
    totalRows: number;
    baseRows: number;
    translatedRows: number;
    translatableRows: number;
    missingTranslations: number;
    staleTranslations: number;
    skippedRows: number;
  };
  sampleMissingKeys: string[];
  sampleStaleKeys: string[];
  lastSuccess: ContentTranslationEventFromAPI | null;
  lastError: ContentTranslationEventFromAPI | null;
  lastBulkRequest: {
    timestamp: string;
    requestedCount: number;
    sampleKeys: string[];
  } | null;
  recentEvents: ContentTranslationEventFromAPI[];
  error?: string;
}

export interface ContentTranslationDiagnosticsResponse {
  ok: boolean;
  message: string;
  diagnostics: ContentTranslationDiagnostics;
}

export interface ContentTranslateAllResponse {
  ok: boolean;
  message: string;
  count: number;
  diagnostics: ContentTranslationDiagnostics;
}

export interface ClientFromAPI {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  sort_order: number;
  is_active: number;
}

export interface TestimonialFromAPI {
  id: number;
  author_name: string;
  author_role: string;
  author_company: string;
  quote: string;
  avatar_url: string;
  rating: number;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface CaseFromAPI {
  id: number;
  title: string;
  slug: string;
  client_name: string;
  excerpt: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  meta_title: string;
  meta_description: string;
  noindex: number;
  nofollow: number;
}

export interface FAQFromAPI {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface MediaFromAPI {
  id: number;
  url: string;
  original_name: string;
  category: string;
  alt_text: string;
  created_at: string;
}
