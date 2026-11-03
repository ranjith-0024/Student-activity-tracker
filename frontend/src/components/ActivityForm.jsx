import { useRef, useState } from 'react';
import { Box, Button, CircularProgress, Grid, InputAdornment, TextField } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

const EMPTY = { name: '', activity: '', hours: '' };
const NUMERIC = /^\d*\.?\d*$/;

export function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Student name is required.';
  else if (values.name.trim().length > 100) errors.name = 'Student name must be at most 100 characters.';

  if (!values.activity.trim()) errors.activity = 'Activity is required.';
  else if (values.activity.trim().length > 150) errors.activity = 'Activity must be at most 150 characters.';

  const raw = String(values.hours).trim();
  if (!raw) errors.hours = 'Hours is required.';
  else if (!NUMERIC.test(raw) || raw === '.' || !Number.isFinite(Number(raw))) errors.hours = 'Hours must be a valid number.';
  else if (Number(raw) <= 0) errors.hours = 'Hours must be greater than zero.';
  else if (Number(raw) > 8760) errors.hours = 'Hours must not exceed 8760.';
  return errors;
}

/**
 * Controlled form for a new activity. `onSubmit(payload)` must return a promise;
 * resolve → form is cleared, reject with `{ fieldErrors }` → errors shown inline.
 */
export default function ActivityForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const edited = useRef({});

  const handleChange = (field) => (e) => {
    let { value } = e.target;
    if (field === 'hours' && !NUMERIC.test(value)) return; // only allow digits and one dot
    edited.current[field] = true;
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const handleBlur = (field) => () => {
    // Opening the dialog moves focus and fires blur before the user types.
    // Only validate a field once they have edited it; Save still checks every field.
    if (!edited.current[field]) return;
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, activity: true, hours: true });
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        activity: values.activity.trim(),
        hours: Number(values.hours),
      });
      setValues(EMPTY);
      setErrors({});
      setTouched({});
      edited.current = {};
    } catch (err) {
      if (err?.fieldErrors) setErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (f) => (touched[f] ? errors[f] : undefined);

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField
            label="Student Name"
            placeholder="e.g. Rahul Sharma"
            fullWidth
            required
            value={values.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            error={Boolean(fieldError('name'))}
            helperText={fieldError('name') || ' '}
            disabled={submitting}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            label="Activity"
            placeholder="e.g. Football"
            fullWidth
            required
            value={values.activity}
            onChange={handleChange('activity')}
            onBlur={handleBlur('activity')}
            error={Boolean(fieldError('activity'))}
            helperText={fieldError('activity') || ' '}
            disabled={submitting}
            inputProps={{ maxLength: 150 }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Hours"
            placeholder="e.g. 2.5"
            fullWidth
            required
            value={values.hours}
            onChange={handleChange('hours')}
            onBlur={handleBlur('hours')}
            error={Boolean(fieldError('hours'))}
            helperText={fieldError('hours') || ' '}
            disabled={submitting}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ endAdornment: <InputAdornment position="end">hrs</InputAdornment> }}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
        <Button
          color="inherit"
          disabled={submitting}
          onClick={() => {
            setValues(EMPTY);
            setErrors({});
            setTouched({});
            edited.current = {};
            onCancel?.();
          }}
        >
          {onCancel ? 'Cancel' : 'Clear'}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
          sx={{ minWidth: 150 }}
        >
          {submitting ? 'Saving…' : 'Save activity'}
        </Button>
      </Box>
    </Box>
  );
}
