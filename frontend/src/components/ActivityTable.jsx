import { useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { colorFor, formatDate, formatHours, initials } from '../utils/format.js';

const COLUMNS = [
  { id: 'id', label: 'ID', sortable: true, width: '10%' },
  { id: 'name', label: 'Student Name', sortable: true, width: '22%' },
  { id: 'activity', label: 'Activity', sortable: true, width: '22%' },
  { id: 'hours', label: 'Hours', sortable: true, align: 'right', width: '12%' },
  { id: 'created_at', label: 'Created Date', sortable: true, width: '22%' },
];
const ACTIONS_WIDTH = '12%';

function compare(a, b, key) {
  const va = a[key];
  const vb = b[key];
  if (typeof va === 'number' && typeof vb === 'number') return va - vb;
  return String(va ?? '').localeCompare(String(vb ?? ''), undefined, { sensitivity: 'base' });
}

/**
 * Reusable activity table.
 * - `compact`: no sort/pagination/actions (used for "recent activities").
 * - `onDelete`: when provided, an Actions column with a delete button is shown.
 * - `refreshing`: shows a thin progress bar while data is re-fetched in place.
 */
export default function ActivityTable({
  rows,
  loading,
  refreshing = false,
  onDelete,
  compact = false,
  emptyContent = null,
  defaultRowsPerPage = 10,
}) {
  const [orderBy, setOrderBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const sorted = compact
    ? rows
    : [...rows].sort((a, b) => (order === 'asc' ? 1 : -1) * compare(a, b, orderBy) || b.id - a.id);

  const maxPage = Math.max(0, Math.ceil(sorted.length / rowsPerPage) - 1);
  const safePage = Math.min(page, maxPage);
  const visible = compact ? sorted : sorted.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  const showActions = Boolean(onDelete);
  const colCount = COLUMNS.length + (showActions ? 1 : 0);

  const handleSort = (id) => {
    if (orderBy === id) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setOrderBy(id);
      setOrder(id === 'name' || id === 'activity' ? 'asc' : 'desc');
    }
  };

  const pagination = !compact && !loading && sorted.length > 0 && (
    <TablePagination
      component="div"
      count={sorted.length}
      page={safePage}
      onPageChange={(_, p) => setPage(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      rowsPerPageOptions={[5, 10, 25, 50]}
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        '& .MuiTablePagination-toolbar': { minHeight: 52, px: { xs: 1, sm: 2 } },
        '& .MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } },
      }}
    />
  );

  return (
    <Box>
      <Box sx={{ height: 3 }}>{refreshing && !loading && <LinearProgress sx={{ height: 3 }} />}</Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Stack spacing={1.25} sx={{ p: 1.5 }}>
            {Array.from({ length: compact ? 3 : 4 }).map((_, i) => (
              <Skeleton key={`card-sk-${i}`} variant="rounded" height={92} />
            ))}
          </Stack>
        ) : visible.length === 0 ? (
          emptyContent
        ) : (
          <Stack spacing={1.25} sx={{ p: 1.5 }}>
            {visible.map((row) => (
              <Box
                key={row.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: `3px solid ${colorFor(row.name)}`,
                  bgcolor: '#fff',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 600, bgcolor: colorFor(row.name) }}>
                  {initials(row.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {row.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{row.id}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                    <Chip label={row.activity} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatHours(row.hours)} hrs
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                    {formatDate(row.created_at)}
                  </Typography>
                </Box>
                {showActions && (
                  <Tooltip title="Delete activity">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(row)}
                      aria-label={`Delete activity ${row.id}`}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Stack>
        )}
        {pagination}
      </Box>

      <TableContainer sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'hidden' }}>
        <Table
          size={compact ? 'small' : 'medium'}
          sx={{
            width: '100%',
            tableLayout: 'fixed',
            '& .MuiTableCell-root': { px: 2, borderColor: 'divider' },
            '& .MuiTableCell-body': { py: 1.5 },
            '& .MuiTableCell-head': { py: 1.25 },
          }}
        >
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{ width: col.width, whiteSpace: 'nowrap' }}
                  sortDirection={!compact && orderBy === col.id ? order : false}
                >
                  {!compact && col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="right" sx={{ width: ACTIONS_WIDTH }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount} sx={{ borderBottom: 0 }}>
                  {emptyContent}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              visible.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>#{row.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 600, bgcolor: colorFor(row.name) }}>
                        {initials(row.name)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                        {row.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.activity} size="small" variant="outlined" sx={{ fontWeight: 500, maxWidth: 220 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {formatHours(row.hours)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{formatDate(row.created_at)}</TableCell>
                  {showActions && (
                    <TableCell align="right">
                      <Tooltip title="Delete activity">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(row)}
                          aria-label={`Delete activity ${row.id}`}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{pagination}</Box>
    </Box>
  );
}
