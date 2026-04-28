'use client';
import { useEffect, useState } from 'react';
import { Box, Paper, Grid, Typography, Button, Alert, CircularProgress, Divider } from '@mui/material';
import { Send, Clock, Users, ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { campaignsService } from '@/lib/services/campaigns';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    campaignsService.get(campaignId)
      .then(r => setCampaign(r.data))
      .catch(err => setError(err.response?.data?.detail ?? 'Failed to load campaign.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [campaignId]);

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
          (campaign.status === 'draft' || campaign.status === 'scheduled') ? {
            label: 'Send Now',
            icon: <Send size={15} />,
            onClick: () => setConfirmSend(true)
          } : undefined
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontSize: '1.0625rem', mb: 3 }}>Message details</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Status</Typography>
                <StatusBadge status={campaign.status} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Scheduled At</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={14} color="#64748B" />
                  {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : 'Immediate'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
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

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h3" sx={{ fontSize: '1.0625rem', mb: 3 }}>Audience & Delivery</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{ width: 48, height: 48, bgcolor: 'primary.light', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#0A66C2" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{campaign.recipient_count ?? 0}</Typography>
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
                  {campaign.pending_count ?? 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
