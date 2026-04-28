import api from '@/lib/api';

export interface SingleSMSPayload { sender_id: string; recipient: string; content: string; }
export interface BulkSMSPayload { sender_id: string; label: string; content: string; recipients: string[]; }
export interface SenderIDPayload { name: string; purpose: string; }

export const smsService = {
  analytics: () => api.get('/sms/analytics/'),

  // Sender IDs
  senderIds: (params?: { status?: string }) => api.get('/sms/sender-ids/', { params }),
  getSenderId: (id: string) => api.get(`/sms/sender-ids/${id}/`),
  createSenderId: (data: SenderIDPayload) => api.post('/sms/sender-ids/', data),
  deleteSenderId: (id: string) => api.delete(`/sms/sender-ids/${id}/`),
  approveSenderId: (id: string) => api.post(`/sms/sender-ids/${id}/approve/`),
  rejectSenderId: (id: string, reason: string) => api.post(`/sms/sender-ids/${id}/reject/`, { reason }),

  // Messages
  sendSingle: (data: SingleSMSPayload) => api.post('/sms/single/', data),
  sendBulk: (data: BulkSMSPayload) => api.post('/sms/bulk/', data),
  messages: (params?: { status?: string }) => api.get('/sms/messages/', { params }),
  bulkJobs: () => api.get('/sms/bulk-jobs/'),
};
