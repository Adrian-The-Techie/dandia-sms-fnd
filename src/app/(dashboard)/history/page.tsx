'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, CircularProgress, Divider, Select, MenuItem, FormControl,
  InputLabel, Pagination, TextField, Button, InputAdornment, Dialog
} from '@mui/material';
import { Search, X } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { smsService } from '@/lib/services/sms';

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dates, setDates] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const load = useCallback(() => {
    setLoading(true);
    smsService.messages({ status: status || undefined, start_date: dates.start, end_date: dates.end })
      .then(r => {
        const data = r.data.results ?? r.data;
        const all = status || search
          ? data.filter((m: any) =>
              (!search || m.recipient.includes(search) || m.content.toLowerCase().includes(search.toLowerCase()))
            )
          : data;
        setCount(r.data.count ?? all.length);
        setMessages(all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
      })
      .finally(() => setLoading(false));
  }, [status, search, page, dates.start, dates.end]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <Box>
      <PageHeader title="Message History" subtitle="A full log of every message sent." />

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input type="date" value={dates.start} onChange={e => { setDates(p => ({ ...p, start: e.target.value })); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #c4c4c4', color: 'rgba(0, 0, 0, 0.87)', fontSize: '14px', fontFamily: 'inherit' }} />
          <input type="date" value={dates.end} onChange={e => { setDates(p => ({ ...p, end: e.target.value })); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #c4c4c4', color: 'rgba(0, 0, 0, 0.87)', fontSize: '14px', fontFamily: 'inherit' }} />
        </Box>
        <TextField
          size="small"
          placeholder="Search recipient or content…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          sx={{ minWidth: 260 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Search size={14} color="#94A3B8" /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Button size="small" sx={{ minWidth: 'unset', p: 0, color: 'text.secondary' }} onClick={() => setSearch('')}><X size={14} /></Button>
                </InputAdornment>
              ) : null,
            }
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Recipient</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Sender ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : messages.length === 0 ? (
              <TableRow><TableCell colSpan={6} sx={{ border: 0 }}>
                <EmptyState icon={<Search size={32} />} title="No messages found" description={status || search ? 'Try adjusting your filters.' : 'Messages will appear here once sent.'} />
              </TableCell></TableRow>
            ) : messages.map((m) => (
              <TableRow key={m.id}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{m.recipient}</TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.content}</Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{m.sender_name ?? '—'}</TableCell>
                <TableCell><StatusBadge status={m.status} /></TableCell>
                <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{m.units_used ?? '—'}</TableCell>
                <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {new Date(m.created_at).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => setSelectedMessage(m)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, count)}–{Math.min(page * PAGE_SIZE, count)} of {count}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                size="small"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Details Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onClose={() => setSelectedMessage(null)} maxWidth="sm" fullWidth>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Message Details</Typography>
              <StatusBadge status={selectedMessage.status} />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Recipient</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedMessage.recipient}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Sender ID</Typography>
                <Typography variant="body2">{selectedMessage.sender_name ?? '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Content</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.content}</Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Units Used</Typography>
                  <Typography variant="body2">{selectedMessage.units_used ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Date Sent</Typography>
                  <Typography variant="body2">{new Date(selectedMessage.created_at).toLocaleString()}</Typography>
                </Box>
                {selectedMessage.delivered_at && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Date Delivered</Typography>
                    <Typography variant="body2">{new Date(selectedMessage.delivered_at).toLocaleString()}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button onClick={() => setSelectedMessage(null)} variant="outlined">Close</Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
