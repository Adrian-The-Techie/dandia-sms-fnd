import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: string;
  deltaUp?: boolean;
  accent?: 'blue' | 'green' | 'red' | 'slate';
}

const ACCENTS = {
  blue:  { bg: 'rgba(10,102,194,0.08)', color: '#0A66C2' },
  green: { bg: 'rgba(43,147,72,0.08)',  color: '#2B9348' },
  red:   { bg: 'rgba(225,34,40,0.08)',  color: '#E12228' },
  slate: { bg: '#F1F5F9',              color: '#64748B' },
};

export default function StatCard({ label, value, icon, delta, deltaUp, accent = 'blue' }: Props) {
  const a = ACCENTS[accent];
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
        {icon ? (
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        ) : <span />}
        {delta && (
          <Typography variant="caption" sx={{ color: deltaUp ? '#2B9348' : '#64748B', fontWeight: 600, bgcolor: deltaUp ? 'rgba(43,147,72,0.08)' : '#F1F5F9', px: 1, py: 0.25, borderRadius: 1 }}>
            {delta}
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.875rem', fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
        {value}
      </Typography>
    </Paper>
  );
}
