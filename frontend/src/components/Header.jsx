import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { DRAWER_WIDTH } from './Sidebar.jsx';

const TITLES = {
  dashboard: 'Dashboard',
  activities: 'Activities',
};

export default function Header({ page, onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: '#e6e8ee',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64 }, px: { xs: 1.5, sm: 2 } }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 1, display: { md: 'none' } }} aria-label="Open menu">
          <MenuRoundedIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ fontSize: 15, fontWeight: 600, color: '#101828' }}>
          {TITLES[page] || 'Student Activity Tracker'}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
