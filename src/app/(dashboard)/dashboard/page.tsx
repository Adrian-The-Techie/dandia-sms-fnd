'use client';
import { useEffect, useState } from 'react';
import { Grid, Paper, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Skeleton, Divider } from '@mui/material';
import { Send, CheckCircle2, XCircle, Zap, BarChart2, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { smsService } from '@/lib/services/sms';
import { billingService } from '@/lib/services/billing';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';

const MOCK_CHART = [
  { day: 'Mon', sent: 3200, delivered: 3100 },
  { day: 'Tue', sent: 4800, delivered: 4600 },
  { day: 'Wed', sent: 2900, delivered: 2750 },
  { day: 'Thu', sent: 6100, delivered: 5900 },
  { day: 'Fri', sent: 5400, delivered: 5300 },
  { day: 'Sat', sent: 1800, delivered: 1750 },
  { day: 'Sun', sent: 2100, delivered: 2050 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      smsService.analytics().then(r => setStats(r.data)).catch(() => { }),
      smsService.messages({ status: undefined }).then(r => setMessages((r.data.results ?? r.data).slice(0, 6))).catch(() => { }),
      billingService.balance().then(r => setBalance(r.data.unit_balance)).catch(() => { }),
    ]).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Messages', value: stats?.total_messages ?? 0, icon: <Send size={16} />, accent: 'blue' as const },
    { label: 'Delivered', value: stats?.delivered_count ?? 0, icon: <CheckCircle2 size={16} />, accent: 'green' as const },
    { label: 'Failed', value: stats?.failed_count ?? 0, icon: <XCircle size={16} />, accent: 'red' as const },
    { label: 'Unit Balance', value: balance ?? stats?.unit_balance ?? 0, icon: <Zap size={16} />, accent: 'slate' as const },
  ];

  return (
    <Box>
      <PageHeader
        title={`Good ${new Date().getHours() <= 12 ? 'morning' : new Date().getHours() <= 18 ? 'afternoon' : 'evening'}${user?.first_name ? `, ${user.first_name}` : ''}.`}
        subtitle="Here's an overview of your SMS activity."
      />

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k) => (
          <Grid item xs={12} sm={6} md={4} key={k.label}>
            {loading ? (
              <Skeleton variant="rectangular" height={112} sx={{ borderRadius: 1 }} />
            ) : (
              <StatCard {...k} value={k.value.toLocaleString()} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Chart + Quick actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h3" sx={{ fontSize: '0.9375rem' }}>Message Volume</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[['#0A66C2', 'Sent'], ['#2B9348', 'Delivered']].map(([c, l]) => (
                  <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{l}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A66C2" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#0A66C2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2B9348" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#2B9348" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: 'none', fontSize: 12 }} />
                  <Area type="monotone" dataKey="sent" stroke="#0A66C2" strokeWidth={2} fill="url(#gSent)" />
                  <Area type="monotone" dataKey="delivered" stroke="#2B9348" strokeWidth={2} fill="url(#gDel)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h3" sx={{ fontSize: '0.9375rem', mb: 2.5 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Send size={15} />}
                component={Link}
                href="/send"
                sx={{ justifyContent: 'flex-start', py: 1.25 }}
              >
                Send Single SMS
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BarChart2 size={15} />}
                component={Link}
                href="/send/bulk"
                sx={{ justifyContent: 'flex-start', py: 1.25 }}
              >
                Send Bulk SMS
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Zap size={15} />}
                component={Link}
                href="/campaigns"
                sx={{ justifyContent: 'flex-start', py: 1.25 }}
              >
                New Campaign
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CheckCircle2 size={15} />}
                component={Link}
                href="/topup"
                sx={{ justifyContent: 'flex-start', py: 1.25 }}
              >
                Top Up Units
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent messages table */}
      <Paper>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: '0.9375rem' }}>Recent Messages</Typography>
          <Button component={Link} href="/history" endIcon={<ArrowRight size={14} />} size="small" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            View all
          </Button>
        </Box>
        <Divider />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Recipient</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton width={j === 1 ? 200 : 80} /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary', fontSize: '0.875rem' }}>
                  No messages sent yet.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => (
                <TableRow key={m.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{m.recipient}</TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.content}
                    </Typography>
                  </TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{m.units_used}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {new Date(m.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
