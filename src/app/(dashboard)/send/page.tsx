'use client';
import { useEffect, useState } from 'react';
import { Grid, Paper, Box, Typography, TextField, Button, MenuItem, Alert, CircularProgress, Divider } from '@mui/material';
import { Send, IdCard } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import PhonePreview from '@/components/ui/PhonePreview';
import { smsService } from '@/lib/services/sms';

const MAX_CHARS = 918;
const SMS_UNIT = 160;

export default function SendSMSPage() {
  const [senderIds, setSenderIds] = useState<any[]>([]);
  const [form, setForm] = useState({ sender_id: '', recipient: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    smsService.senderIds({ status: 'approved' })
      .then(r => {
        const list = r.data.results ?? r.data;
        setSenderIds(list);
        if (list.length) setForm(p => ({ ...p, sender_id: list[0].id }));
      })
      .finally(() => setFetching(false));
  }, []);

  const charCount = form.content.length;
  const units = Math.max(1, Math.ceil(charCount / SMS_UNIT));
  const senderName = senderIds.find(s => s.id === form.sender_id)?.name ?? 'DANDIA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await smsService.sendSingle(form);
      setSuccess('Message sent successfully.');
      setForm(p => ({ ...p, recipient: '', content: '' }));
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to send. Check your unit balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Send SMS" subtitle="Send an instant message to a single recipient." />

      <Grid container spacing={3}>
        {/* Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3.5 }}>
            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2.5 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Sender ID */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Sender ID</Typography>
                  <TextField
                    select
                    value={form.sender_id}
                    onChange={e => setForm(p => ({ ...p, sender_id: e.target.value }))}
                    disabled={fetching}
                    required
                    slotProps={{ select: { displayEmpty: true } }}
                  >
                    {fetching ? (
                      <MenuItem disabled>Loading…</MenuItem>
                    ) : senderIds.length === 0 ? (
                      <MenuItem disabled>No approved Sender IDs</MenuItem>
                    ) : (
                      senderIds.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)
                    )}
                  </TextField>
                  {!fetching && senderIds.length === 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      You need an approved Sender ID to send messages. <a href="/sender-ids" style={{ color: '#0A66C2' }}>Request one →</a>
                    </Typography>
                  )}
                </Box>

                {/* Recipient */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Recipient</Typography>
                  <TextField
                    placeholder="+254 7XX XXX XXX"
                    value={form.recipient}
                    onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))}
                    required
                    slotProps={{ htmlInput: { inputMode: 'tel' } }}
                  />
                </Box>

                {/* Message */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">Message</Typography>
                    <Typography variant="caption" sx={{ color: charCount > MAX_CHARS ? 'error.main' : 'text.secondary' }}>
                      {charCount}/{MAX_CHARS} · <strong>{units}</strong> unit{units !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <TextField
                    multiline
                    rows={5}
                    placeholder="Type your message…"
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    required
                    slotProps={{ htmlInput: { maxLength: MAX_CHARS } }}
                  />
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Send size={15} />}
                    disabled={loading || !form.sender_id || !form.recipient || !form.content}
                    sx={{ minWidth: 140 }}
                  >
                    Send Message
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid size={{ xs: 12, md: 5 }}>
          <PhonePreview content={form.content} sender={senderName} />
        </Grid>
      </Grid>
    </Box>
  );
}
