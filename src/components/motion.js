import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

// Small motion helpers for the public pages. Everything here is switched off for people who
// ask their device to reduce motion.
export const noMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none !important', transition: 'none !important', opacity: 1, transform: 'none !important' } };

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const popIn = keyframes`
  0%   { opacity: 0; transform: translateY(14px) scale(0.92); }
  70%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

export const drawDown = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;

export const drawAcross = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.35); }
  50%      { box-shadow: 0 0 0 10px rgba(52, 211, 153, 0); }
`;

// Plays an entrance animation once, after `delay` ms, when the page loads.
export const enter = (delay = 0, animation = fadeUp, duration = 700) => ({
  opacity: 0,
  animation: `${animation} ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms forwards`,
  ...noMotion,
});

// Fades its children up the first time they scroll into view.
export function Reveal({ children, delay = 0, sx, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return undefined;
    if (!('IntersectionObserver' in window)) { setShown(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); observer.disconnect(); }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(24px)',
        transition: `opacity 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        ...noMotion,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
