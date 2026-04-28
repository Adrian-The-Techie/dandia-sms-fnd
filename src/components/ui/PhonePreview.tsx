import { Box, Typography } from '@mui/material';

interface Props { content: string; sender?: string; }

export default function PhonePreview({ content, sender = 'DANDIA' }: Props) {
  return (
    <Box sx={{
      bgcolor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: 3,
      p: 2.5,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94A3B8', mb: 2, display: 'block', textAlign: 'center' }}>
        Preview
      </Typography>
      {/* Phone frame */}
      <Box sx={{
        mx: 'auto',
        width: 220,
        bgcolor: '#FFFFFF',
        border: '6px solid #1E293B',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Status bar */}
        <Box sx={{ bgcolor: '#F1F5F9', py: 0.5, px: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#334155' }}>9:41</Typography>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#334155' }}>●●● ■</Typography>
        </Box>
        {/* Header */}
        <Box sx={{ bgcolor: '#0A66C2', py: 1, px: 1.5 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff', textAlign: 'center' }}>{sender}</Typography>
        </Box>
        {/* Message bubble area */}
        <Box sx={{ flexGrow: 1, p: 1.5, bgcolor: '#F8FAFC', minHeight: 120 }}>
          {content ? (
            <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px 12px 12px 2px', p: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#0F172A', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {content}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', mt: 0.5, textAlign: 'right' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', textAlign: 'center', mt: 4 }}>
              Message preview appears here
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
