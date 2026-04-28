'use client';
import { useEffect, useState } from 'react';
import {
  Box, Paper, Grid, Typography, TextField, Button,
  Alert, CircularProgress, Table, TableHead, TableRow,
  TableCell, TableBody, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip
} from '@mui/material';
import { CreditCard, Zap, RefreshCw, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { billingService } from '@/lib/services/billing';

const KES_PER_UNIT = 1; // fallback

export default function TopUpPage() {
  const { isSuperAdmin } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [confirmItem, setConfirmItem] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'reject' | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      billingService.balance().then(r => setBalance(r.data)).catch(() => {}),
      billingService.history().then(r => setHistory(r.data.results ?? r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await billingService.requestTopUp(Number(amount));
      setSuccess('Top-up request submitted. Your administrator will confirm it shortly.');
      setAmount('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async () => {
    if (!confirmItem || !confirmAction) return;
    setActionLoading(confirmItem.id);
    try {
      if (confirmAction === 'confirm') await billingService.confirm(confirmItem.id);
      else await billingService.reject(confirmItem.id);
      load();
    } catch {}
    finally { setActionLoading(''); setConfirmItem(null); setConfirmAction(null); }
  };

  const unitPreview = amount ? Math.floor(Number(amount) / (balance?.rate_per_unit_kes ?? KES_PER_UNIT)) : 0;

  return (
    <Box>
      <PageHeader title="Top Up Units" subtitle="Add SMS units to your organisation's balance." />

      <Grid container spacing={3}>
        {/* Balance & Request */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Balance tile */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Current Balance</Typography>
              {loading ? <CircularProgress size={20} /> : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                      {(balance?.unit_balance ?? 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>units</Typography>
                  </Box>
                  {balance?.rate_per_unit_kes && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      KES {balance.rate_per_unit_kes} / unit
                    </Typography>
                  )}
                </>
              )}
            </Paper>

            {/* Request form */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2.5 }}>Request Top-Up</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              <form onSubmit={handleRequest}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Amount (KES)"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    inputProps={{ min: 100, step: 100 }}
                    required
                  />
                  {unitPreview > 0 && (
                    <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Zap size={14} color="#15803D" />
                      <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600 }}>
                        ≈ {unitPreview.toLocaleString()} units
                      </Typography>
                    </Box>
                  )}
                  <Button type="submit" variant="contained" disabled={submitting || !amount} startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CreditCard size={15} />}>
                    Submit Request
                  </Button>
                </Box>
              </form>
            </Paper>
          </Box>
        </Grid>

        {/* History table */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h3" sx={{ fontSize: '0.9375rem' }}>Top-Up History</Typography>
              <Tooltip title="Refresh"><IconButton size="small" onClick={load}><RefreshCw size={15} /></IconButton></Tooltip>
            </Box>
            <Divider />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount (KES)</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested</TableCell>
                  {isSuperAdmin && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : history.length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: 'text.secondary', fontSize: '0.875rem', border: 0 }}>No top-up requests yet.</TableCell></TableRow>
                ) : history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell sx={{ fontWeight: 600 }}>KES {Number(h.amount_kes).toLocaleString()}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{h.units_granted?.toLocaleString() ?? '—'}</TableCell>
                    <TableCell><StatusBadge status={h.status} /></TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{new Date(h.created_at).toLocaleDateString()}</TableCell>
                    {isSuperAdmin && (
                      <TableCell align="right">
                        {h.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end' }}>
                            <Button size="small" variant="contained" color="success" startIcon={<Check size={13} />} onClick={() => { setConfirmItem(h); setConfirmAction('confirm'); }} disabled={!!actionLoading}>Confirm</Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<X size={13} />} onClick={() => { setConfirmItem(h); setConfirmAction('reject'); }} disabled={!!actionLoading}>Reject</Button>
                          </Box>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirm action dialog */}
      <Dialog open={!!confirmItem} onClose={() => { setConfirmItem(null); setConfirmAction(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {confirmAction === 'confirm' ? 'Confirm Top-Up' : 'Reject Top-Up'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {confirmAction === 'confirm'
              ? `This will credit ${confirmItem?.units_granted?.toLocaleString() ?? '—'} units to the organisation's balance.`
              : 'The top-up request will be rejected and no units will be added.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => { setConfirmItem(null); setConfirmAction(null); }}>Cancel</Button>
          <Button variant="contained" size="small" color={confirmAction === 'reject' ? 'error' : 'primary'} onClick={handleAction} disabled={!!actionLoading}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : confirmAction === 'confirm' ? 'Confirm' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
