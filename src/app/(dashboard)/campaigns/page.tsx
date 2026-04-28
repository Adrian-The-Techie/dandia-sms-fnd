'use client';
import { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert, CircularProgress,
  IconButton, Tooltip, Divider
} from '@mui/material';
import { Plus, Send, Trash2, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { campaignsService } from '@/lib/services/campaigns';
import { smsService } from '@/lib/services/sms';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [senderIds, setSenderIds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmSend, setConfirmSend] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', sender_id: '', message_body: '', recipients: '', scheduled_at: '' });

  const load = () => {
    setLoading(true);
    Promise.all([
      campaignsService.list().then(r => setCampaigns(r.data.results ?? r.data)),
      smsService.senderIds({ status: 'approved' }).then(r => setSenderIds(r.data.results ?? r.data)),
    ]).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    setActionLoading(true); setError('');
    try {
      const recipients = form.recipients.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean);
      await campaignsService.create({ ...form, recipients, scheduled_at: form.scheduled_at || null });
      setOpen(false);
      setForm({ name: '', sender_id: '', message_body: '', recipients: '', scheduled_at: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to create campaign.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirmSend) return;
    setActionLoading(true);
    try { await campaignsService.send(confirmSend.id); load(); } catch {}
    finally { setActionLoading(false); setConfirmSend(null); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    try { await campaignsService.delete(confirmDelete.id); load(); } catch {}
    finally { setActionLoading(false); setConfirmDelete(null); }
  };

  return (
    <Box>
      <PageHeader
        title="Campaigns"
        subtitle="Create, schedule and launch SMS campaigns."
        action={{ label: 'New Campaign', onClick: () => setOpen(true), icon: <Plus size={15} /> }}
      />

      <Paper>
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={load} disabled={loading}><RefreshCw size={15} /></IconButton>
          </Tooltip>
        </Box>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ border: 0 }}>
                <EmptyState icon={<Send />} title="No campaigns yet" description="Create your first campaign to get started." action={{ label: 'New Campaign', onClick: () => setOpen(true) }} />
              </TableCell></TableRow>
            ) : campaigns.map(c => (
              <TableRow key={c.id}>
                <TableCell sx={{ fontWeight: 500 }}>{c.name}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{c.recipient_count ?? '—'}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : 'Immediate'}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end' }}>
                    {(c.status === 'draft' || c.status === 'scheduled') && (
                      <Button size="small" variant="contained" startIcon={<Send size={13} />} onClick={() => setConfirmSend(c)}>
                        Send
                      </Button>
                    )}
                    <IconButton size="small" color="error" onClick={() => setConfirmDelete(c)}><Trash2 size={15} /></IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Create dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>New Campaign</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Campaign name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <TextField select label="Sender ID" value={form.sender_id} onChange={e => setForm(p => ({ ...p, sender_id: e.target.value }))}>
            {senderIds.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="Message" multiline rows={4} value={form.message_body} onChange={e => setForm(p => ({ ...p, message_body: e.target.value }))} required />
          <TextField label="Recipients (one per line)" multiline rows={4} placeholder="+254712345678&#10;+254798765432" value={form.recipients} onChange={e => setForm(p => ({ ...p, recipients: e.target.value }))} required />
          <TextField label="Schedule (optional)" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleCreate} disabled={actionLoading || !form.name || !form.message_body || !form.recipients}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Create Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!confirmSend} title={`Send "${confirmSend?.name}"?`} description="This will immediately queue messages to all recipients. Units will be deducted." confirmLabel="Send Campaign" onConfirm={handleSend} onClose={() => setConfirmSend(null)} loading={actionLoading} />
      <ConfirmDialog open={!!confirmDelete} title={`Delete "${confirmDelete?.name}"?`} description="This action cannot be undone." confirmLabel="Delete" danger onConfirm={handleDelete} onClose={() => setConfirmDelete(null)} loading={actionLoading} />
    </Box>
  );
}
