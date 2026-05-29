import api from '@/lib/api';

export interface LoginPayload { email: string; password: string; }
export interface ChangePasswordPayload { old_password: string; new_password: string; }
export interface AcceptInvitePayload { token: string; password: string; first_name: string; last_name: string; }

export const authService = {
  login: (data: LoginPayload) => api.post('/auth/login/', data),
  register: (data: Record<string, any>) => api.post('/auth/register/', data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  me: () => api.get('/auth/me/'),
  updateMe: (data: Partial<{ first_name: string; last_name: string }>) => api.patch('/auth/me/', data),
  changePassword: (data: ChangePasswordPayload) => api.post('/auth/change-password/', data),
  acceptInvite: (data: AcceptInvitePayload) => api.post('/auth/accept-invite/', data),
};
