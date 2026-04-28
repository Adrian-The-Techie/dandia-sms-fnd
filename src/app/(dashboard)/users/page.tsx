'use client';
import { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert, CircularProgress,
  IconButton, Tooltip, Divider, Chip
} from '@mui/material';
import { Plus, RotateCcw, UserX, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { usersService, CreateUserPayload } from '@/lib/services/users';
import { orgsService } from '@/lib/services/organisations';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Org Admin',
  user: 'User',
};

export default function UsersPage() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Omit<CreateUserPayload, 'organisation'> & { organisation: string }>({
    email: '', role: 'user', first_name: '', last_name: '', organisation: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      usersService.list().then(r => setUsers(r.data.results ?? r.data)).catch(() => {}),
      isSuperAdmin ? orgsService.list().then(r => setOrgs(r.data.results ?? r.data)).catch(() => {}) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    setActionLoading(true); setError('');
    try {
      const payload: CreateUserPayload = { ...form };
      if (!form.organisation) delete payload.organisation;
      await usersService.create(payload);
      setOpen(false);
      setForm({ email: '', role: 'user', first_name: '', last_name: '', organisation: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? JSON.stringify(err.response?.data ?? 'Failed to invite user.'));
    } finally { setActionLoading(false); }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setActionLoading(true);
    try { await usersService.deactivate(deactivateTarget.id); load(); } catch {}
    finally { setActionLoading(false); setDeactivateTarget(null); }
  };

  const handleResend = async (id: string) => {
    try { await usersService.resendInvite(id); } catch {}
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage user access and roles."
        action={{ label: 'Invite User', onClick: () => setOpen(true), icon: <Plus size={15} /> }}
      />

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name / Email</TableCell>
              <TableCell>Role</TableCell>
              {isSuperAdmin && <TableCell>Organisation</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ border: 0 }}>
                <EmptyState icon={<Users />} title="No users yet" description="Invite your first team member." action={{ label: 'Invite User', onClick: () => setOpen(true) }} />
              </TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : '—'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{u.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ROLE_LABELS[u.role] ?? u.role}
                    size="small"
                    sx={{
                      height: 20, fontSize: '0.7rem', fontWeight: 600,
                      bgcolor: u.role === 'super_admin' ? '#EFF6FF' : u.role === 'org_admin' ? '#F5F3FF' : '#F8FAFC',
                      color: u.role === 'super_admin' ? '#1D4ED8' : u.role === 'org_admin' ? '#7C3AED' : '#64748B',
                    }}
                  />
                </TableCell>
                {isSuperAdmin && (
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{u.organisation_name ?? '—'}</TableCell>
                )}
                <TableCell>
                  {u.is_active ? (
                    u.invite_accepted ? <StatusBadge status="delivered" /> : <StatusBadge status="pending" />
                  ) : (
                    <StatusBadge status="failed" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end' }}>
                    {!u.invite_accepted && u.is_active && (
                      <Tooltip title="Resend invite">
                        <IconButton size="small" onClick={() => handleResend(u.id)}>
                          <RotateCcw size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {u.is_active && (
                      <Tooltip title="Deactivate user">
                        <IconButton size="small" color="error" onClick={() => setDeactivateTarget(u)}>
                          <UserX size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Invite dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Invite User</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error" sx={{ fontSize: '0.8125rem' }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="First name" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
            <TextField label="Last name" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
          </Box>
          <TextField label="Email address" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <TextField select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as any }))}>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="org_admin">Org Admin</MenuItem>
            {isSuperAdmin && <MenuItem value="super_admin">Super Admin</MenuItem>}
          </TextField>
          {isSuperAdmin && (
            <TextField select label="Organisation" value={form.organisation} onChange={e => setForm(p => ({ ...p, organisation: e.target.value }))}>
              <MenuItem value="">— None —</MenuItem>
              {orgs.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleCreate} disabled={actionLoading || !form.email || !form.role}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={`Deactivate ${deactivateTarget?.email}?`}
        description="This user will lose access immediately. This can be reversed by an administrator."
        confirmLabel="Deactivate"
        danger
        onConfirm={handleDeactivate}
        onClose={() => setDeactivateTarget(null)}
        loading={actionLoading}
      />
    </Box>
  );
}
