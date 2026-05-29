'use client';
import { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress,
  Grid, Divider, IconButton, Tooltip
} from '@mui/material';
import { Plus, Building2, Pencil, RefreshCw, Edit2, Trash2, Coins } from 'lucide-react';
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
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', address: '', 
    contact_person: '', contact_person_role: '', contact_person_phone: '', contact_person_email: '', 
    logo: null as File | null 
  });
  const [rate, setRate] = useState('');
  
  const [editDialog, setEditDialog] = useState<any>(null);
  const [editForm, setEditForm] = useState({ 
    name: '', email: '', phone: '', address: '', 
    contact_person: '', contact_person_role: '', contact_person_phone: '', contact_person_email: '', 
    logo: null as File | null 
  });
  const [deactivateDialog, setDeactivateDialog] = useState<any>(null);

  const handleEditSubmit = async () => {
    if (!editDialog) return;
    setActionLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v as any);
      });
      await orgsService.update(editDialog.id, fd);
      setEditDialog(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to update organisation.');
    } finally { setActionLoading(false); }
  };

  const handleDeactivateSubmit = async () => {
    if (!deactivateDialog) return;
    setActionLoading(true);
    try {
      await orgsService.delete(deactivateDialog.id);
      setDeactivateDialog(null);
      load();
    } catch (err: any) {
      console.error(err);
    } finally { setActionLoading(false); }
  };

  const load = () => {
    setLoading(true);
    orgsService.list().then(r => setOrgs(r.data.results ?? r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    setActionLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v as any);
      });
      await orgsService.create(fd);
      setOpen(false);
      setForm({ 
        name: '', email: '', phone: '', address: '', 
        contact_person: '', contact_person_role: '', contact_person_phone: '', contact_person_email: '', 
        logo: null 
      });
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
    } catch { }
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
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{o.email ?? '—'}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{(o.unit_balance ?? 0).toLocaleString()}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {o.units_per_kes ? `KES ${o.units_per_kes}` : '—'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { 
                      setEditDialog(o); 
                      setEditForm({ 
                        name: o.name, 
                        email: o.email ?? '', 
                        phone: o.phone ?? '', 
                        address: o.address ?? '', 
                        contact_person: o.contact_person ?? '', 
                        contact_person_role: o.contact_person_role ?? '',
                        contact_person_phone: o.contact_person_phone ?? '',
                        contact_person_email: o.contact_person_email ?? '', 
                        logo: null 
                      }); 
                    }}>
                      <Edit2 size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Set rate">
                    <IconButton size="small" onClick={() => { setRateDialog(o); setRate(o.units_per_kes ?? ''); }}>
                      <Coins size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Deactivate">
                    <IconButton size="small" color="error" onClick={() => setDeactivateDialog(o)}>
                      <Trash2 size={14} />
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
          <TextField label="Organisation email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <TextField label="Organisation Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <TextField label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">Contact Person Details</Typography></Divider>
          <TextField label="Name" value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} />
          <TextField label="Role" value={form.contact_person_role} onChange={e => setForm(p => ({ ...p, contact_person_role: e.target.value }))} />
          <TextField label="Phone" value={form.contact_person_phone} onChange={e => setForm(p => ({ ...p, contact_person_phone: e.target.value }))} />
          <TextField label="Email" type="email" value={form.contact_person_email} onChange={e => setForm(p => ({ ...p, contact_person_email: e.target.value }))} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Logo</Typography>
            <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, logo: e.target.files?.[0] || null }))} />
          </Box>
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

      {/* Edit org dialog */}
      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Organisation</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Organisation name" required value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
          <TextField label="Organisation email" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
          <TextField label="Organisation Phone" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
          <TextField label="Address" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
          <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">Contact Person Details</Typography></Divider>
          <TextField label="Name" value={editForm.contact_person} onChange={e => setEditForm(p => ({ ...p, contact_person: e.target.value }))} />
          <TextField label="Role" value={editForm.contact_person_role} onChange={e => setEditForm(p => ({ ...p, contact_person_role: e.target.value }))} />
          <TextField label="Phone" value={editForm.contact_person_phone} onChange={e => setEditForm(p => ({ ...p, contact_person_phone: e.target.value }))} />
          <TextField label="Email" type="email" value={editForm.contact_person_email} onChange={e => setEditForm(p => ({ ...p, contact_person_email: e.target.value }))} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Update Logo</Typography>
            <input type="file" accept="image/*" onChange={e => setEditForm(p => ({ ...p, logo: e.target.files?.[0] || null }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setEditDialog(null)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleEditSubmit} disabled={actionLoading || !editForm.name}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate dialog */}
      <Dialog open={!!deactivateDialog} onClose={() => setDeactivateDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>Deactivate Organisation</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography>
            Are you sure you want to deactivate <b>{deactivateDialog?.name}</b>? They will lose access to the platform immediately.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setDeactivateDialog(null)}>Cancel</Button>
          <Button variant="contained" color="error" size="small" onClick={handleDeactivateSubmit} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
