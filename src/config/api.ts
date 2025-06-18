export const API_BASE_URL = 'http://localhost:3002';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`,
  },
  products: {
    list: `${API_BASE_URL}/products`,
    details: (id: string) => `${API_BASE_URL}/products/${id}`,
    reviews: (id: string) => `${API_BASE_URL}/products/${id}/reviews`,
  },
  cart: {
    list: `${API_BASE_URL}/api/cart`,
    add: `${API_BASE_URL}/api/cart`,
    update: (id: string) => `${API_BASE_URL}/api/cart/${id}`,
    remove: `${API_BASE_URL}/api/cart/remove`,
  },
  orders: {
    list: `${API_BASE_URL}/orders`,
    create: `${API_BASE_URL}/orders`,
    details: (id: string) => `${API_BASE_URL}/orders/${id}`,
  },
  support: {
    tickets: `${API_BASE_URL}/support`,
    createTicket: `${API_BASE_URL}/support`,
    adminTickets: `${API_BASE_URL}/support/admin`,
  },
  admin: {
    users: {
      list: `${API_BASE_URL}/admin/users`,
      update: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
    },
    products: {
      list: `${API_BASE_URL}/admin/products`,
      create: `${API_BASE_URL}/admin/products`,
      update: (id: string) => `${API_BASE_URL}/admin/products/${id}`,
      delete: (id: string) => `${API_BASE_URL}/admin/products/${id}`,
    },
  },
}; 