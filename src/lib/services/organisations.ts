import api from '@/lib/api';

export const orgsService = {
  list: () => api.get('/organisations/'),
  get: (id: string) => api.get(`/organisations/${id}/`),
  create: (data: { name: string; contact_email?: string }) => api.post('/organisations/', data),
  update: (id: string, data: any) => api.patch(`/organisations/${id}/`, data),
  setRate: (id: string, rate_per_unit_kes: number) =>
    api.post(`/organisations/${id}/set-rate/`, { rate_per_unit_kes }),
};
