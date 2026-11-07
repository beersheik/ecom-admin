import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BrandMark from './BrandMark';
import { drawAcross, drawDown, enter, float, noMotion, popIn } from './motion';
import { APP_NAME, INK, INK_2, SAFFRON } from '../theme';

// What eMall is, shared by the landing page and the login page.

// The three ideas behind eMall, shown next to the sign-in form.
export const STEPS = [
  { title: 'Every business gets its own store', body: 'Its own name, logo, products, prices and payment account (Razorpay or UPI).' },
  { title: 'Shoppers buy from that store', body: 'On its website or installed app. Orders and payments go straight to that business.' },
  { title: 'Run them all from here', body: 'Super admins see every store. Store admins see only their own.' },
];

// Example stores (illustration only, not real data).
const EXAMPLE_STORES = [
  { name: 'Silk House', kind: 'Fashion', color: '#f472b6' },
  { name: 'Fresh Mart', kind: 'Groceries', color: '#fbbf24' },
  { name: 'Gadget Hub', kind: 'Electronics', color: '#60a5fa' },
];

// eMall at the top, with separate stores hanging off it.
// A faint mall floor plan (corridor grid with shop units) for ink backgrounds.
const floorPlanSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'>
<g fill='none' stroke='%23FAF7F2' stroke-opacity='0.05' stroke-width='1'>
<path d='M0 40H240M0 120H240M0 200H240M40 0V240M120 0V240M200 0V240'/>
</g>
<g fill='none' stroke='%23FAF7F2' stroke-opacity='0.085' stroke-width='1'>
<rect x='8' y='8' width='64' height='24' rx='2'/><rect x='80' y='8' width='32' height='24' rx='2'/>
<rect x='128' y='48' width='64' height='64' rx='2'/><rect x='8' y='128' width='24' height='64' rx='2'/>
<rect x='48' y='136' width='64' height='56' rx='2'/><rect x='208' y='128' width='24' height='104' rx='2'/>
<rect x='128' y='208' width='64' height='24' rx='2'/>
</g></svg>`;
export const FLOOR_PLAN_BG = `url("data:image/svg+xml;utf8,${floorPlanSvg.replace(/\n/g, '')}")`;

// A dot that runs down a connector line, like an order flowing to a store.
const travel = keyframes`
  0%   { top: -4px; opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { top: calc(100% - 2px); opacity: 0; }
`;

// A shop unit "switching on": its colour stripe sweeps across.
const lightUp = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

// The "open" indicator on the platform: a flat pulse, no glow.
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.35; transform: scale(0.75); }
`;

const UNIT_BORDER = 'rgba(250,247,242,0.14)';
const LINE_COLOR = 'rgba(250,247,242,0.22)';

// eMall at the top, with separate shop units below it. With `animate`, the corridors draw
// themselves, the units open one by one, and orders (saffron dots) flow into them.
export function StoresDiagram({ animate = false, delay = 0 }) {
  const at = (ms) => delay + ms;
  const run = (sx) => (animate ? { ...sx, ...noMotion } : {});
  const vertical = (height, ms) => ({
    width: 2, height, bgcolor: LINE_COLOR, position: 'relative', overflow: 'visible',
    ...run({ transformOrigin: 'top', transform: 'scaleY(0)', animation: `${drawDown} 350ms ease-out ${at(ms)}ms forwards` }),
  });

  return (
    <Box aria-hidden sx={{ mt: 4.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', ...run(enter(at(0), popIn, 600)) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.25, borderRadius: 2.5, bgcolor: INK_2, border: `1px solid ${UNIT_BORDER}` }}>
          <BrandMark size={28} showName={false} />
          <Box>
            <Typography sx={{ color: '#FAF7F2', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{APP_NAME} platform</Typography>
            <Typography sx={{ color: 'rgba(250,247,242,0.62)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: SAFFRON, ...run({ animation: `${pulse} 2s ease-in-out ${at(2200)}ms infinite` }) }} />
              one admin · one login
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* corridors: down from the platform, across, then down to each unit */}
      <Box sx={{ mx: 'auto', ...vertical(18, 500) }} />
      <Box sx={{
        mx: 'auto', width: 'calc(100% * 2 / 3 + 2px)', height: 2, bgcolor: LINE_COLOR,
        ...run({ transform: 'scaleX(0)', animation: `${drawAcross} 450ms ease-out ${at(800)}ms forwards` }),
      }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: { xs: 1, sm: 1.5 } }}>
        {EXAMPLE_STORES.map((store, i) => (
          <Box key={store.name} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
            <Box sx={vertical(16, 1200)}>
              {animate && (
                <Box sx={{
                  position: 'absolute', left: -2, width: 6, height: 6, borderRadius: '50%', bgcolor: SAFFRON, opacity: 0,
                  animation: `${travel} 1.6s ease-in ${at(2400 + i * 500)}ms infinite`,
                  '@media (prefers-reduced-motion: reduce)': { display: 'none' },
                }} />
              )}
            </Box>
            <Box sx={{ width: '100%', ...run(enter(at(1350 + i * 160), popIn, 650)) }}>
              <Box sx={{
                position: 'relative', overflow: 'hidden', width: '100%', p: { xs: 1, sm: 1.5 }, pt: { xs: 1.5, sm: 2 },
                borderRadius: 2, bgcolor: INK_2, border: `1px solid ${UNIT_BORDER}`,
                ...run({ animation: `${float} 5s ease-in-out ${at(2200 + i * 700)}ms infinite` }),
              }}>
                {/* the unit's colour stripe: sweeps on when the shop "opens" */}
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: store.color, transformOrigin: 'left',
                  ...run({ transform: 'scaleX(0)', animation: `${lightUp} 500ms ease-out ${at(1700 + i * 160)}ms forwards` }),
                }} />
                <Typography sx={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10, letterSpacing: '0.08em', color: 'rgba(250,247,242,0.6)', mb: 0.75 }}>
                  UNIT {String(i + 1).padStart(2, '0')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: { xs: 22, sm: 26 }, height: { xs: 22, sm: 26 }, borderRadius: 1.5, bgcolor: store.color, color: INK, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {store.name[0]}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: 13, color: '#FAF7F2' }}>{store.name}</Typography>
                    <Typography noWrap sx={{ fontSize: 11, color: 'rgba(250,247,242,0.62)' }}>{store.kind}</Typography>
                  </Box>
                </Box>
                {/* the tags don't fit on narrow phones */}
                <Box sx={{ mt: 1.25, display: { xs: 'none', sm: 'flex' }, flexWrap: 'wrap', gap: 0.5 }}>
                  {['Products', 'Orders', 'Payments'].map(t => (
                    <Box key={t} component="span" sx={{ fontSize: 10.5, fontWeight: 600, px: 0.75, py: 0.25, borderRadius: 1, border: `1px solid ${UNIT_BORDER}`, color: 'rgba(250,247,242,0.8)' }}>{t}</Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Typography sx={{ textAlign: 'center', color: 'rgba(250,247,242,0.62)', fontSize: 12.5, mt: 1.5, ...run(enter(at(2000))) }}>
        + room for as many stores as you need
      </Typography>
    </Box>
  );
}
