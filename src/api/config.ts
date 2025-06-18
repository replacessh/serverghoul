// Базовый URL API
export const API_BASE_URL = 'http://localhost:3001';

// Типы для API ответов
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

// Конфигурация эндпоинтов
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
    logout: `${API_BASE_URL}/api/auth/logout`,
  },
  products: {
    list: `${API_BASE_URL}/api/products`,
    detail: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    create: `${API_BASE_URL}/api/products`,
    update: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  },
  support: {
    list: `${API_BASE_URL}/api/support`,
    detail: (id: string) => `${API_BASE_URL}/api/support/${id}`,
    create: `${API_BASE_URL}/api/support`,
    update: (id: string) => `${API_BASE_URL}/api/support/${id}`,
  },
  profile: {
    get: `${API_BASE_URL}/api/profile`,
    update: `${API_BASE_URL}/api/profile`,
    changePassword: `${API_BASE_URL}/api/profile/password`,
  },
  admin: {
    users: {
      list: `${API_BASE_URL}/api/admin/users`,
      detail: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
      block: (id: string) => `${API_BASE_URL}/api/admin/users/${id}/block`,
      unblock: (id: string) => `${API_BASE_URL}/api/admin/users/${id}/unblock`,
    },
    products: {
      list: `${API_BASE_URL}/api/admin/products`,
      create: `${API_BASE_URL}/api/admin/products`,
      update: (id: string) => `${API_BASE_URL}/api/admin/products/${id}`,
      delete: (id: string) => `${API_BASE_URL}/api/admin/products/${id}`,
    },
  },
} as const;

// HTTP методы
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// HTTP статусы
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const; 