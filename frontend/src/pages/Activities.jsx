import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ActivityForm from '../components/ActivityForm.jsx';
import ActivityTable from '../components/ActivityTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { activityApi, parseApiError } from '../services/api.js';
import { formatHours } from '../utils/format.js';

const ALL = '__all__';

export default function Activities({ notify }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true); // first load: skeleton rows
  const [refreshing, setRefreshing] = useState(false); // later loads: thin progress bar
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState(ALL);
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // bump to re-fetch

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (reloadKey > 0) setRefreshing(true);
      setError('');
      try {
        const data = await activityApi.list();
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) setError(parseApiError(err, 'Could not load activities.').message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  const handleCreate = async (payload) => {
    try {
      const created = await activityApi.create(payload);
      notify(`Saved "${created.activity}" for ${created.name}.`, 'success');
      setAddOpen(false);
      reload();
    } catch (err) {
      const parsed = parseApiError(err, 'Could not save the activity.');
      notify(parsed.message === 'Validation failed.' ? 'Please fix the highlighted fields.' : parsed.message, 'error');
      throw parsed;
    }
  };

  // Derived values (recomputed each render; the list is small)
  const activityTypes = [...new Set(rows.map((r) => r.activity))].sort((a, b) => a.localeCompare(b));
  const effectiveFilter = activityFilter !== ALL && !activityTypes.includes(activityFilter) ? ALL : activityFilter;
  const query = search.trim().toLowerCase();
  const filtered = rows.filter(
    (r) => (!query || r.name.toLowerCase().includes(query)) && (effectiveFilter === ALL || r.activity === effectiveFilter),
  );
  const filteredHours = filtered.reduce((sum, r) => sum + r.hours, 0);
  const isFiltering = query !== '' || effectiveFilter !== ALL;

  const confirmDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    try {
      await activityApi.remove(pending.id);
      notify(`Deleted activity #${pending.id}.`, 'success');
      setPending(null);
      reload();
    } catch (err) {
      const { message, status } = parseApiError(err, 'Could not delete the activity.');
      notify(message, 'error');
      setPending(null);
      if (status === 404) reload(); // already gone: resync the list
    } finally {
      setDeleting(false);
    }
  };

  const emptyContent = isFiltering ? (
    <EmptyState
      icon={<SearchOffRoundedIcon />}
      title="No matching activities"
      message="Try a different student name or clear the activity filter."
    />
  ) : (
    <EmptyState message="Activities you add will be listed here." actionLabel="Add activity" onAction={() => setAddOpen(true)} />
  );

  return (
    <Box>
      <PageHeader
        title="All activities"
        subtitle="Search, filter, sort and manage every activity record."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
            Add activity
          </Button>
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Card>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            bgcolor: '#f8fafc',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            size="small"
            placeholder="Search by student name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: '1 1 0', minWidth: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ width: { xs: 148, sm: 200 }, flexShrink: 0 }}>
            <InputLabel id="activity-filter-label">Activity</InputLabel>
            <Select
              labelId="activity-filter-label"
              label="Activity"
              value={effectiveFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <MenuItem value={ALL}>All activities</MenuItem>
              {activityTypes.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!loading && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexBasis: { xs: '100%', sm: 'auto' } }}>
              <Chip size="small" label={`${filtered.length} record${filtered.length === 1 ? '' : 's'}`} />
              <Chip size="small" color="primary" variant="outlined" label={`${formatHours(filteredHours)} hrs`} />
            </Box>
          )}
        </Box>

        <ActivityTable
          rows={filtered}
          loading={loading}
          refreshing={refreshing}
          onDelete={setPending}
          emptyContent={emptyContent}
        />
      </Card>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pr: 1.5 }}>
          <Box>
            Add activity
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
              Log hours a student spent on an activity.
            </Typography>
          </Box>
          <IconButton aria-label="Close" onClick={() => setAddOpen(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ActivityForm onSubmit={handleCreate} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pending)}
        loading={deleting}
        title="Delete activity?"
        message={
          pending
            ? `This will permanently remove "${pending.activity}" (${formatHours(pending.hours)} hrs) for ${pending.name}. This cannot be undone.`
            : ''
        }
        onConfirm={confirmDelete}
        onClose={() => setPending(null)}
      />
    </Box>
  );
}
