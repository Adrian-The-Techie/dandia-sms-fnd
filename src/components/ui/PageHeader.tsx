import { Box, Typography, Button } from '@mui/material';
import React, { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void; icon?: ReactNode } | ReactNode;
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
        <Box sx={{ mt: 0.5, flexShrink: 0, display: 'flex', gap: 1 }}>
          {React.isValidElement(action) ? action : (
            <Button
              variant="contained"
              onClick={(action as any).onClick}
              startIcon={(action as any).icon}
              size="small"
            >
              {(action as any).label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
