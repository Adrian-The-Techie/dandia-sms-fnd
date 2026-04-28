import { Box, Typography, Button } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
      <Box>
        <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary', mb: subtitle ? 0.5 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          startIcon={action.icon}
          size="small"
          sx={{ mt: 0.5, flexShrink: 0 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
