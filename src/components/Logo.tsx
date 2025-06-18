import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
        Shop
      </Typography>
    </Box>
  );
};

export default Logo; 