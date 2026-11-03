import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f3d73', light: '#e8eef5', dark: '#0a2a4e', contrastText: '#fff' },
    secondary: { main: '#1d4e89' },
    success: { main: '#157347' },
    warning: { main: '#b45309' },
    error: { main: '#b42318' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#101828', secondary: '#667085' },
    divider: '#e5e7eb',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: '#e8eaf0' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #e6e8ee',
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        containedPrimary: {
          backgroundColor: '#0f3d73',
          boxShadow: '0 1px 2px rgba(15, 39, 68, 0.24)',
          '&:hover': { backgroundColor: '#0c325e', boxShadow: '0 4px 10px rgba(15, 39, 68, 0.22)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#fff',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '1.5px' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 6 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, border: '1px solid #e5e7eb' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#475467',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
        },
        root: { borderColor: '#eef0f4' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        hover: {
          '&:hover': { backgroundColor: 'rgba(15, 39, 68, 0.04)' },
        },
      },
    },
  },
});

export default theme;
