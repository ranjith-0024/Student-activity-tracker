import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

export const DRAWER_WIDTH = 248;

const NAV_ITEMS = [
  { label: 'Dashboard', key: 'dashboard', icon: <DashboardRoundedIcon /> },
  { label: 'Activities', key: 'activities', icon: <ListAltRoundedIcon /> },
];

function SidebarContent({ page, navigate }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          height: 64,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: 'rgba(255,255,255,0.16)',
            color: '#fff',
            width: 36,
            height: 36,
            borderRadius: 2,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
          }}
        >
          <InsightsRoundedIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ lineHeight: 1.2, color: '#fff' }}>
            Activity Tracker
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)' }}>
            Student records
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{ px: 3, pt: 2, pb: 1, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.06em' }}
      >
        MENU
      </Typography>

      <List sx={{ px: 1.5 }}>
        {NAV_ITEMS.map((item) => {
          const active = page === item.key;
          return (
            <ListItemButton
              key={item.key}
              selected={active}
              onClick={() => navigate(item.key)}
              aria-current={active ? 'page' : undefined}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                py: 1.05,
                color: 'rgba(255,255,255,0.78)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 38 },
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  boxShadow: 'inset 3px 0 0 #93c5fd',
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
            </ListItemButton>
          );
        })}
      </List>

    </Box>
  );
}

export default function Sidebar({ page, navigate, mobileOpen, onClose }) {
  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    borderRight: 'none',
    color: '#fff',
    background: 'linear-gradient(180deg, #16375a 0%, #0f2744 42%, #0c2138 100%)',
  };

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        <SidebarContent page={page} navigate={navigate} />
      </Drawer>
      <Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': paperSx }}>
        <SidebarContent page={page} navigate={navigate} />
      </Drawer>
    </Box>
  );
}
