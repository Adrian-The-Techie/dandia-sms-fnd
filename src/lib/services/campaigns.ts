import api from '@/lib/api';

export interface CampaignPayload {
  name: string;
  sender_id?: string;
  message_body: string;
  recipients: string[];
  scheduled_at?: string | null;
}

export const campaignsService = {
  list: (params?: { status?: string }) => api.get('/campaigns/', { params }),
  get: (id: string) => api.get(`/campaigns/${id}/`),
  create: (data: CampaignPayload) => api.post('/campaigns/', data),
  update: (id: string, data: Partial<CampaignPayload>) => api.patch(`/campaigns/${id}/`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}/`),
  send: (id: string) => api.post(`/campaigns/${id}/send/`),
};
