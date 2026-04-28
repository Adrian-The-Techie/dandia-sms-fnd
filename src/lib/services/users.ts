import api from '@/lib/api';

export interface CreateUserPayload {
  email: string;
  role: 'user' | 'org_admin';
  organisation?: string;
  first_name?: string;
  last_name?: string;
}

export const usersService = {
  list: (params?: { search?: string; role?: string }) => api.get('/auth/users/', { params }),
  get: (id: string) => api.get(`/auth/users/${id}/`),
  create: (data: CreateUserPayload) => api.post('/auth/users/', data),
  update: (id: string, data: Partial<CreateUserPayload>) => api.patch(`/auth/users/${id}/`, data),
  deactivate: (id: string) => api.delete(`/auth/users/${id}/`),
  resendInvite: (id: string) => api.post(`/auth/users/${id}/resend-invite/`),
};
