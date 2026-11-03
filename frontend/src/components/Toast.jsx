import { Alert, Snackbar } from '@mui/material';

export default function Toast({ toast, onClose }) {
  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    onClose();
  };

  return (
    <Snackbar
      key={toast.key}
      open={toast.open}
      autoHideDuration={toast.severity === 'error' ? 6000 : 3500}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
        {toast.message}
      </Alert>
    </Snackbar>
  );
}
