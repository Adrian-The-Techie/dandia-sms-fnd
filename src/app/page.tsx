'use client';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { Send, BarChart2, Shield, Clock, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  { icon: Send,     title: 'Bulk SMS',          desc: 'Reach thousands of recipients instantly with a single API call or through our portal.' },
  { icon: BarChart2,title: 'Campaign Analytics', desc: 'Track delivery rates, open rates and engagement with precise, real-time reporting.' },
  { icon: Shield,   title: 'Sender ID Control',  desc: 'Manage approved sender identities and ensure your messages are always trusted.' },
  { icon: Zap,      title: 'Instant Delivery',   desc: 'Direct carrier connections delivering over 99% of messages within seconds.' },
  { icon: Clock,    title: 'Scheduled Campaigns', desc: 'Plan campaigns ahead. Schedule sends to the exact minute.' },
  { icon: BarChart2,title: 'Unit-Based Billing', desc: 'Simple, transparent pricing. Top up units and pay only for what you send.' },
];

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      {/* Nav */}
      <Box component="nav" sx={{ borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 50 }}>
        <Container maxWidth="lg">
          <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, bgcolor: '#0A66C2', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={13} color="#fff" strokeWidth={2.5} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                Dandia <span style={{ color: '#0A66C2' }}>SMS</span>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Button component={Link} href="/login" variant="outlined" size="small" sx={{ px: 2 }}>
                Sign in
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Box sx={{ borderBottom: '1px solid #E2E8F0', bgcolor: '#FAFAFA' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 10, md: 16 }, maxWidth: 640 }}>
            <Typography
              variant="h1"
              sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#0F172A', mb: 3 }}
            >
              SMS infrastructure<br />
              for your organisation.
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: 500 }}>
              Dandia SMS gives your team a powerful, simple portal to send bulk messages, run campaigns and manage sender identities — backed by carrier-grade reliability.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                endIcon={<ArrowRight size={16} />}
                sx={{ px: 3, py: 1.125 }}
              >
                Access Portal
              </Button>
              <Button
                component="a"
                href="mailto:dandiaholdingsltd@gmail.com"
                variant="outlined"
                sx={{ px: 3, py: 1.125 }}
              >
                Contact Sales
              </Button>
            </Box>

            {/* Social proof strip */}
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['500M+','Messages sent'],['99.9%','Delivery uptime'],['50+','Carrier connections']].map(([val, label]) => (
                <Box key={label}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', lineHeight: 1 }}>{val}</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 } }}>
        <Box sx={{ mb: 8 }}>
          <Typography variant="overline" sx={{ color: '#0A66C2', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.7rem' }}>
            Platform
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.02em' }}>
            Everything your team needs.
          </Typography>
        </Box>

        <Grid container spacing={0}>
          {FEATURES.map((f, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Box sx={{
                p: 3.5,
                borderTop: '1px solid #E2E8F0',
                borderRight: { md: (i % 3 !== 2) ? '1px solid #E2E8F0' : 'none' },
                height: '100%',
              }}>
                <Box sx={{ mb: 2.5, color: '#0A66C2' }}><f.icon size={20} strokeWidth={1.75} /></Box>
                <Typography variant="h6" sx={{ mb: 1 }}>{f.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>{f.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid #E2E8F0', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 22, height: 22, bgcolor: '#0A66C2', borderRadius: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={11} color="#fff" strokeWidth={2.5} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0F172A' }}>
                Dandia <span style={{ color: '#0A66C2' }}>SMS</span>
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              © {new Date().getFullYear()} Dandia Holdings Ltd · Nairobi, Kenya
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
