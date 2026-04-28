import api from '@/lib/api';

export const billingService = {
  balance: () => api.get('/billing/balance/'),
  requestTopUp: (amount_kes: number) => api.post('/billing/topup/', { amount_kes }),
  history: () => api.get('/billing/topup/history/'),
  confirm: (id: string) => api.post(`/billing/topup/${id}/confirm/`),
  reject: (id: string) => api.post(`/billing/topup/${id}/reject/`),
};
