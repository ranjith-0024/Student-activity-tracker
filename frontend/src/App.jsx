import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Toast from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Activities from './pages/Activities.jsx';

export const PAGES = {
  dashboard: 'Dashboard',
  activities: 'Activities',
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success', key: 0 });

  const navigate = (next) => {
    setPage(next);
    setMobileOpen(false);
    window.scrollTo(0, 0);
  };

  const notify = (message, severity = 'success') => {
    setToast({ open: true, message, severity, key: Date.now() });
  };

  const pageProps = { navigate, notify };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#f4f6f8',
        backgroundImage: 'linear-gradient(180deg, #f7f9fc 0%, #f3f5f8 240px)',
      }}
    >
      <Header page={page} onMenuClick={() => setMobileOpen(true)} />
      <Sidebar page={page} navigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 1.5, sm: 2 },
          pb: 3,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64 } }} />
        <Box sx={{ width: '100%', pt: { xs: 1.5, sm: 2 } }}>
          {page === 'dashboard' && <Dashboard {...pageProps} />}
          {page === 'activities' && <Activities {...pageProps} />}
        </Box>
      </Box>

      <Toast toast={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
