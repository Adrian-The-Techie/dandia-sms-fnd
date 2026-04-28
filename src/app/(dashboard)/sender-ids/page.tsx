'use client';
import { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress,
  IconButton, Tooltip, Divider, Chip
} from '@mui/material';
import { Plus, Check, X, IdCard, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { smsService } from '@/lib/services/sms';

export default function SenderIDsPage() {
  const { isSuperAdmin } = useAuth();
  const [senderIds, setSenderIds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<any>(null);
  const [actionItem, setActionItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', purpose: '' });
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    smsService.senderIds().then(r => setSenderIds(r.data.results ?? r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    setActionLoading(true); setError('');
    try {
      await smsService.createSenderId(form);
      setOpen(false);
      setForm({ name: '', purpose: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to submit request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try { await smsService.approveSenderId(id); load(); } catch {}
    finally { setActionLoading(false); setActionItem(null); }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setActionLoading(true);
    try { await smsService.rejectSenderId(rejectDialog.id, rejectReason); load(); } catch {}
    finally { setActionLoading(false); setRejectDialog(null); setRejectReason(''); }
  };

  return (
    <Box>
      <PageHeader
        title="Sender IDs"
        subtitle="Manage your approved message sender names."
        action={{ label: 'Request Sender ID', onClick: () => setOpen(true), icon: <Plus size={15} /> }}
      />

      <Paper>
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Refresh"><IconButton size="small" onClick={load} disabled={loading}><RefreshCw size={15} /></IconButton></Tooltip>
        </Box>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sender Name</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested</TableCell>
              {isSuperAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : senderIds.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ border: 0 }}>
                <EmptyState icon={<IdCard />} title="No Sender IDs" description="Request your first Sender ID to start sending branded messages." action={{ label: 'Request Now', onClick: () => setOpen(true) }} />
              </TableCell></TableRow>
            ) : senderIds.map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, bgcolor: '#F1F5F9', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IdCard size={14} color="#64748B" />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem', maxWidth: 240 }}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.purpose}</Typography>
                </TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {new Date(s.created_at).toLocaleDateString()}
                </TableCell>
                {isSuperAdmin && (
                  <TableCell align="right">
                    {s.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end' }}>
                        <Button size="small" variant="contained" color="success" startIcon={<Check size={13} />} onClick={() => handleApprove(s.id)} disabled={actionLoading}>
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<X size={13} />} onClick={() => { setRejectDialog(s); setRejectReason(''); }}>
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Request dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Request Sender ID</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Sender name" placeholder="e.g. MYBRAND" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required helperText="Max 11 characters, alphanumeric" slotProps={{ htmlInput: { maxLength: 11 } }} />
          <TextField label="Purpose / use case" multiline rows={3} placeholder="Describe how you'll use this sender name…" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} required />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleCreate} disabled={actionLoading || !form.name || !form.purpose}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Reject "{rejectDialog?.name}"</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField label="Reason for rejection" multiline rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button variant="contained" color="error" size="small" onClick={handleReject} disabled={actionLoading || !rejectReason}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
