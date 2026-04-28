import { Chip } from '@mui/material';

type StatusType =
  | 'sent' | 'delivered' | 'failed' | 'pending'     // messages
  | 'approved' | 'rejected'                           // sender IDs
  | 'draft' | 'scheduled' | 'sending' | 'completed'  // campaigns
  | 'confirmed'                                        // topup

const MAP: Record<string, { label: string; bg: string; color: string }> = {
  sent:       { label: 'Sent',       bg: '#EFF6FF', color: '#1D4ED8' },
  delivered:  { label: 'Delivered',  bg: '#F0FDF4', color: '#15803D' },
  failed:     { label: 'Failed',     bg: '#FEF2F2', color: '#B91C1C' },
  pending:    { label: 'Pending',    bg: '#FFFBEB', color: '#B45309' },
  approved:   { label: 'Approved',   bg: '#F0FDF4', color: '#15803D' },
  rejected:   { label: 'Rejected',   bg: '#FEF2F2', color: '#B91C1C' },
  draft:      { label: 'Draft',      bg: '#F8FAFC', color: '#64748B' },
  scheduled:  { label: 'Scheduled',  bg: '#EFF6FF', color: '#1D4ED8' },
  sending:    { label: 'Sending',    bg: '#FFFBEB', color: '#B45309' },
  completed:  { label: 'Completed',  bg: '#F0FDF4', color: '#15803D' },
  confirmed:  { label: 'Confirmed',  bg: '#F0FDF4', color: '#15803D' },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = MAP[status?.toLowerCase()] ?? { label: status, bg: '#F8FAFC', color: '#64748B' };
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.03em', border: 'none', height: 20 }}
    />
  );
}
