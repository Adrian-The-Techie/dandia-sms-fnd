'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Grid, Paper, Box, Typography, TextField, Button, MenuItem,
  Alert, CircularProgress, Divider, Chip
} from '@mui/material';
import { Send, Upload, X, Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { smsService } from '@/lib/services/sms';

const MAX_CHARS = 918;

function parseRecipients(raw: string): string[] {
  return [...new Set(
    raw.split(/[\n,;]+/)
      .map(r => r.trim().replace(/\s+/g, ''))
      .filter(Boolean)
      .map(r => (r.startsWith('+') ? r : '+254' + r.replace(/^0/, '')))
  )];
}

export default function BulkSMSPage() {
  const [senderIds, setSenderIds] = useState<any[]>([]);
  const [form, setForm] = useState({ sender_id: '', label: '', content: '' });
  const [rawRecipients, setRawRecipients] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    smsService.senderIds({ status: 'approved' })
      .then(r => {
        const list = r.data.results ?? r.data;
        setSenderIds(list);
        if (list.length) setForm(p => ({ ...p, sender_id: list[0].id }));
      })
      .finally(() => setFetching(false));
  }, []);

  const recipients = parseRecipients(rawRecipients);
  const charCount = form.content.length;
  const units = recipients.length * Math.max(1, Math.ceil(charCount / 160));

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setRawRecipients(prev => prev + '\n' + (ev.target?.result as string ?? ''));
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) { setError('Add at least one recipient.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await smsService.sendBulk({ ...form, recipients });
      setSuccess(`Bulk job submitted — ${recipients.length} recipients queued.`);
      setRawRecipients('');
      setForm(p => ({ ...p, label: '', content: '' }));
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to send. Check your unit balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Bulk SMS" subtitle="Send a message to multiple recipients at once." />

      <Grid container spacing={3}>
        {/* Form */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3.5 }}>
            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2.5 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Sender ID</Typography>
                    <TextField select value={form.sender_id} onChange={e => setForm(p => ({ ...p, sender_id: e.target.value }))} disabled={fetching} required>
                      {fetching ? <MenuItem disabled>Loading…</MenuItem>
                        : senderIds.length === 0 ? <MenuItem disabled>No approved IDs</MenuItem>
                        : senderIds.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Campaign Label</Typography>
                    <TextField
                      placeholder="e.g. April Promo"
                      value={form.label}
                      onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                      required
                    />
                  </Grid>
                </Grid>

                {/* Recipients */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">Recipients</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      {recipients.length > 0 && (
                        <Chip size="small" label={`${recipients.length} numbers`} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                      )}
                      <input ref={fileRef} type="file" accept=".csv,.txt" hidden onChange={handleCSV} />
                      <Button size="small" startIcon={<Upload size={12} />} sx={{ fontSize: '0.75rem', py: 0.25 }} onClick={() => fileRef.current?.click()}>
                        Import CSV
                      </Button>
                      {rawRecipients && (
                        <Button size="small" startIcon={<X size={12} />} color="error" sx={{ fontSize: '0.75rem', py: 0.25 }} onClick={() => setRawRecipients('')}>
                          Clear
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <TextField
                    multiline
                    rows={5}
                    placeholder={"Paste numbers here, one per line:\n+254712345678\n+254798765432"}
                    value={rawRecipients}
                    onChange={e => setRawRecipients(e.target.value)}
                    sx={{ fontFamily: 'monospace' }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                    Separate by new lines, commas, or semicolons. Local numbers (07xx) will be converted automatically.
                  </Typography>
                </Box>

                {/* Message */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">Message</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {charCount} chars · {Math.max(1, Math.ceil(charCount / 160))} SMS/recipient
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
                    disabled={loading || !form.sender_id || !form.label || !form.content || recipients.length === 0}
                    sx={{ minWidth: 160 }}
                  >
                    Send to {recipients.length || '—'} recipients
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Summary */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 76 }}>
            <Typography variant="h3" sx={{ fontSize: '0.9375rem', mb: 2.5 }}>Send Summary</Typography>
            {[
              ['Recipients',     recipients.length > 0 ? `${recipients.length} numbers` : '—'],
              ['Messages/person', Math.max(1, Math.ceil(charCount / 160))],
              ['Total units',    units > 0 ? units.toLocaleString() : '—'],
              ['Characters',     `${charCount} / ${MAX_CHARS}`],
            ].map(([k, v]) => (
              <Box key={String(k)} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{k}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
              </Box>
            ))}
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Users size={14} color="#64748B" style={{ flexShrink: 0, marginTop: 2 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Messages are deducted from your organisation's unit balance. Ensure you have sufficient units before sending.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
