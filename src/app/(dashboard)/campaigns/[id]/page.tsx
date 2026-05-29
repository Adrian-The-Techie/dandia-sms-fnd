'use client';
import { useEffect, useState } from 'react';
import { Box, Paper, Grid, Typography, Button, Alert, CircularProgress, Divider,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton
} from '@mui/material';
import { Send, Clock, Users, ChevronLeft, Edit, MessageSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { campaignsService } from '@/lib/services/campaigns';
import { smsService } from '@/lib/services/sms';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [senderIds, setSenderIds] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({ name: '', sender_id: '', message_body: '', recipients: '', scheduled_at: '' });

  // Messages State
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const load = () => {
    setLoading(true);
    campaignsService.get(campaignId)
      .then(r => {
        setCampaign(r.data);
        setEditForm({
          name: r.data.name,
          sender_id: r.data.sender_id || '',
          message_body: r.data.message_body,
          recipients: Array.isArray(r.data.recipients) ? r.data.recipients.join('\n') : '',
          scheduled_at: r.data.scheduled_at ? r.data.scheduled_at.slice(0, 16) : ''
        });
      })
      .catch(err => setError(err.response?.data?.detail ?? 'Failed to load campaign.'))
      .finally(() => setLoading(false));

    smsService.senderIds({ status: 'approved' }).then(r => setSenderIds(r.data.results ?? r.data));
  };
  const loadMessages = () => {
    setMessagesLoading(true);
    smsService.messages({ campaign: campaignId, page: page + 1, page_size: rowsPerPage })
      .then(r => {
        setMessages(r.data.results ?? r.data);
        setMessagesTotal(r.data.count ?? r.data.length ?? 0);
      })
      .catch(console.error)
      .finally(() => setMessagesLoading(false));
  };

  useEffect(() => { load(); }, [campaignId]);
  useEffect(() => { loadMessages(); }, [campaignId, page, rowsPerPage]);

  const handleSend = async () => {
    setActionLoading(true);
    try {
      await campaignsService.send(campaignId);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to send campaign.');
    } finally {
      setActionLoading(false);
      setConfirmSend(false);
    }
  };

  const handleEdit = async () => {
    setActionLoading(true); setError('');
    try {
      const recipients = editForm.recipients.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean);
      await campaignsService.update(campaignId, { 
        ...editForm, 
        sender_id: editForm.sender_id || undefined,
        recipients, 
        scheduled_at: editForm.scheduled_at || null 
      });
      setEditOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to update campaign.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!campaign) return <Alert severity="error" sx={{ m: 3 }}>{error || 'Campaign not found'}</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button startIcon={<ChevronLeft size={16} />} size="small" onClick={() => router.push('/campaigns')} sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Back to Campaigns
        </Button>
      </Box>

      <PageHeader
        title={campaign.name}
        subtitle={`Created on ${new Date(campaign.created_at).toLocaleDateString()}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
              <Button variant="outlined" startIcon={<Edit size={15} />} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            )}
            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
              <Button variant="contained" startIcon={<Send size={15} />} onClick={() => setConfirmSend(true)}>
                Send Now
              </Button>
            )}
          </Box>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontSize: '1.0625rem', mb: 3 }}>Message details</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Status</Typography>
                <StatusBadge status={campaign.status} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Scheduled At</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={14} color="#64748B" />
                  {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : 'Immediate'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Message Content</Typography>
                <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                    {campaign.message_body}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                  {campaign.message_body.length} characters
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h3" sx={{ fontSize: '1.0625rem', mb: 3 }}>Audience & Delivery</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{ width: 48, height: 48, bgcolor: 'primary.light', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#0A66C2" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{campaign.total_recipients ?? 0}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total recipients</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" sx={{ mb: 2 }}>Delivery Stats</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Delivered</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {campaign.delivered_count ?? 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Failed</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {campaign.failed_count ?? 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Pending</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {(campaign.total_recipients ?? 0) - ((campaign.delivered_count ?? 0) + (campaign.failed_count ?? 0))}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" sx={{ fontSize: '1.0625rem', mb: 2 }}>Message History</Typography>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Recipient</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivered At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messagesLoading ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : messages.length === 0 ? (
                <TableRow><TableCell colSpan={4} sx={{ border: 0 }}>
                  <EmptyState icon={<MessageSquare />} title="No messages yet" description="Messages will appear here once the campaign is sent." />
                </TableCell></TableRow>
              ) : messages.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{m.recipient}</TableCell>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.content}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{m.delivered_at ? new Date(m.delivered_at).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={messagesTotal}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>
      </Box>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Campaign</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Campaign name" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required />
          <TextField select label="Sender ID" value={editForm.sender_id} onChange={e => setEditForm(p => ({ ...p, sender_id: e.target.value }))}>
            {senderIds.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="Message" multiline rows={4} value={editForm.message_body} onChange={e => setEditForm(p => ({ ...p, message_body: e.target.value }))} required />
          <TextField label="Recipients (one per line)" multiline rows={4} value={editForm.recipients} onChange={e => setEditForm(p => ({ ...p, recipients: e.target.value }))} required />
          <TextField label="Schedule (optional)" type="datetime-local" value={editForm.scheduled_at} onChange={e => setEditForm(p => ({ ...p, scheduled_at: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleEdit} disabled={actionLoading || !editForm.name || !editForm.message_body || !editForm.recipients}>
            {actionLoading ? <CircularProgress size={14} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmSend}
        title={`Send "${campaign.name}"?`}
        description="This will immediately queue messages to all recipients. Units will be deducted from your balance."
        confirmLabel="Send Now"
        onConfirm={handleSend}
        onClose={() => setConfirmSend(false)}
        loading={actionLoading}
      />
    </Box>
  );
}
