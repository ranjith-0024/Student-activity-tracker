import { Box, Button, Typography } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

/** `onAction` is optional; when given with `actionLabel`, a button is shown. */
export default function EmptyState({ title = 'No activities yet', message, actionLabel, onAction, icon }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          mx: 'auto',
          mb: 2,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.light',
          color: 'primary.main',
        }}
      >
        {icon || <InboxRoundedIcon />}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360, mx: 'auto' }}>
          {message}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" sx={{ mt: 2.5 }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
