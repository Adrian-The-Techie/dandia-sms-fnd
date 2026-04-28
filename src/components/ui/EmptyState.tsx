import { Box, Typography, Button } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 4 }}>
      <Box sx={{ fontSize: '2rem', color: '#CBD5E1', mb: 2, display: 'flex', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ color: 'text.primary', mb: 0.75 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 340, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="contained" size="small" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
