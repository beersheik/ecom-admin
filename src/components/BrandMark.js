import React from 'react';
import { Box, Typography } from '@mui/material';
import { APP_NAME, BRAND_FILL, SERIF } from '../theme';

// The eMall logo: a serif "e" on a solid emerald tile, optionally followed by the name.
export default function BrandMark({ size = 38, showName = true, nameColor = '#FAF7F2', caption, captionColor = 'rgba(250,247,242,0.6)' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          width: size, height: size, borderRadius: size * 0.26 + 'px', flexShrink: 0,
          bgcolor: BRAND_FILL, color: '#fff',
          display: 'grid', placeItems: 'center',
          fontFamily: SERIF, fontWeight: 700, fontSize: size * 0.66, lineHeight: 1,
          pb: size * 0.06 + 'px',
        }}
      >
        e
      </Box>
      {showName && (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: nameColor, fontFamily: SERIF, fontWeight: 700, fontSize: size * 0.5, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {APP_NAME}
          </Typography>
          {caption && (
            <Typography noWrap sx={{ color: captionColor, fontSize: 11.5, mt: 0.25 }}>{caption}</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
