'use client';
import { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress,
  Grid, Divider, IconButton, Tooltip
} from '@mui/material';
import { Plus, Building2, Pencil, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { orgsService } from '@/lib/services/organisations';

export default function OrganisationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [rateDialog, setRateDialog] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', contact_email: '' });
  const [rate, setRate] = useState('');

  const load = () => {
    setLoading(true);
    orgsService.list().then(r => setOrgs(r.data.results ?? r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    setActionLoading(true); setError('');
    try {
      await orgsService.create(form);
      setOpen(false);
      setForm({ name: '', contact_email: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to create organisation.');
    } finally { setActionLoading(false); }
  };

  const handleSetRate = async () => {
    if (!rateDialog) return;
    setActionLoading(true);
    try {
      await orgsService.setRate(rateDialog.id, Number(rate));
      load();
      setRateDialog(null);
      setRate('');
    } catch {}
    finally { setActionLoading(false); }
  };

  return (
    <Box>
      <PageHeader
        title="Organisations"
        subtitle="Manage all client organisations on the platform."
        action={{ label: 'New Organisation', onClick: () => setOpen(true), icon: <Plus size={15} /> }}
      />

      <Paper>
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Refresh"><IconButton size="small" onClick={load} disabled={loading}><RefreshCw size={15} /></IconButton></Tooltip>
        </Box>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organisation</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Unit Balance</TableCell>
              <TableCell>Rate (KES/unit)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : orgs.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ border: 0 }}>
                <EmptyState icon={<Building2 />} title="No organisations" description="Create your first organisation to get started." action={{ label: 'New Organisation', onClick: () => setOpen(true) }} />
              </TableCell></TableRow>
            ) : orgs.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, bgcolor: '#F1F5F9', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={14} color="#64748B" />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{o.contact_email ?? '—'}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{(o.unit_balance ?? 0).toLocaleString()}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {o.rate_per_unit_kes ? `KES ${o.rate_per_unit_kes}` : '—'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Set rate">
                    <IconButton size="small" onClick={() => { setRateDialog(o); setRate(o.rate_per_unit_kes ?? ''); }}>
                      <Pencil size={14} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Create org dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>New Organisation</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Organisation name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <TextField label="Contact email" type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleCreate} disabled={actionLoading || !form.name}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Set rate dialog */}
      <Dialog open={!!rateDialog} onClose={() => setRateDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Set Rate — {rateDialog?.name}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField label="Rate (KES per unit)" type="number" slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} value={rate} onChange={e => setRate(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setRateDialog(null)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleSetRate} disabled={actionLoading || !rate}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Save Rate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
