import { createTheme } from '@mui/material/styles';

export const APP_NAME = 'eMall';

// ---- The "mall" identity -------------------------------------------------------------
// Warm paper + deep ink neutrals, emerald for actions, saffron as the second accent.
// Flat: hierarchy comes from type, colour and borders, not shadows or gradients.
// Every text/background pair below meets WCAG AA (4.5:1) — check before changing.
export const INK = '#1C1F1D';          // text, dark surfaces (sidebar, hero)
export const INK_2 = '#2A2E2B';        // raised surfaces on ink
export const PAPER = '#FAF7F2';        // page background
export const LINE = '#E7E1D6';         // borders and dividers on paper
export const MUTED = '#575C58';        // secondary text on paper (6.4:1)
export const BRAND = { main: '#047857', light: '#10B981', dark: '#065F46' }; // white on main 5.5:1
export const SAFFRON = '#E0A100';      // accent: use behind INK text or on ink, never as text on paper
export const SERIF = '"Fraunces", Georgia, "Times New Roman", serif';
// Use with SERIF wherever numbers appear (stats, step numbers).
export const SERIF_NUMS = { fontFamily: SERIF, fontVariantNumeric: 'lining-nums tabular-nums' };

// Kept for the few places that need a single brand fill (logo tile, avatars, step numbers).
export const BRAND_FILL = BRAND.main;

export const SIDEBAR = {
  bg: INK,
  text: 'rgba(250,247,242,0.72)',
  activeBg: 'rgba(16,185,129,0.14)',
  activeText: '#6EE7B7',
};

// Elevation 1–4 (cards, buttons, app bars) is flat; higher levels stay for things that
// really sit on top of the page: menus, popovers and dialogs.
const base = createTheme();
const shadows = base.shadows.map((s, i) => (i > 0 && i <= 4 ? 'none' : s));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { ...BRAND, contrastText: '#fff' },
    secondary:  { main: SAFFRON, light: '#F2C14E', dark: '#B07E00', contrastText: INK },
    success:    { main: '#15803D', contrastText: '#fff' },
    info:       { main: '#0369A1', contrastText: '#fff' },
    warning:    { main: '#B45309', contrastText: '#fff' },
    error:      { main: '#B91C1C', contrastText: '#fff' },
    background: { default: PAPER, paper: '#ffffff' },
    divider: LINE,
    text: { primary: INK, secondary: MUTED, disabled: '#7A7F7B' },
  },
  shadows,
  typography: {
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    // Fraunces only for large display headings; UI text stays Inter for legibility.
    // Lining numerals: Fraunces defaults to old-style figures, which sit below the line in stats.
    h1: { fontFamily: SERIF, fontVariantNumeric: 'lining-nums', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: SERIF, fontVariantNumeric: 'lining-nums', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: SERIF, fontVariantNumeric: 'lining-nums', fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontFamily: SERIF, fontVariantNumeric: 'lining-nums', fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, transition: 'background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out' },
        outlined: { borderColor: LINE, '&:hover': { borderColor: INK } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: `1px solid ${LINE}` } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: MUTED, fontSize: 12.5, backgroundColor: '#F6F2EA' },
        root: { borderColor: LINE },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiOutlinedInput: { styleOverrides: { notchedOutline: { borderColor: '#D9D2C5' } } },
  },
});

// The card every page sits in: hairline warm border on white, no shadow.
export const cardSx = {
  borderRadius: 3,
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
  overflow: 'hidden',
};

export default theme;
