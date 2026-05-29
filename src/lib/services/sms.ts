import api from '@/lib/api';

export interface SingleSMSPayload { sender_id: string; recipient: string; content: string; }
export interface BulkSMSPayload { sender_id: string; label: string; content: string; recipients: string[]; }
export interface SenderIDPayload { name: string; purpose: string; }

export const smsService = {
  analytics: (params?: Record<string, any>) => api.get('/sms/analytics/', { params }),

  // Sender IDs
  senderIds: (params?: { status?: string }) => api.get('/sms/sender-ids/', { params }),
  getSenderId: (id: string) => api.get(`/sms/sender-ids/${id}/`),
  createSenderId: (data: SenderIDPayload) => api.post('/sms/sender-ids/', data),
  updateSenderId: (id: string, data: any) => api.patch(`/sms/sender-ids/${id}/`, data),

  // Messages
  sendSingle: (data: SingleSMSPayload) => api.post('/sms/single/', data),
  sendBulk: (data: BulkSMSPayload) => api.post('/sms/bulk/', data),
  messages: (params?: Record<string, any>) => api.get('/sms/messages/', { params }),
  bulkJobs: () => api.get('/sms/bulk-jobs/'),
};
