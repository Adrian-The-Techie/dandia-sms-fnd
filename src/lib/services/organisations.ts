import api from '@/lib/api';

export const orgsService = {
  list: () => api.get('/organisations/'),
  get: (id: string) => api.get(`/organisations/${id}/`),
  create: (data: any) => api.post('/organisations/', data),
  update: (id: string, data: any) => api.patch(`/organisations/${id}/`, data),
  delete: (id: string) => api.delete(`/organisations/${id}/`),
  setRate: (id: string, rate_per_unit_kes: number) =>
    api.post(`/organisations/${id}/set-rate/`, { rate_per_unit_kes }),
};
