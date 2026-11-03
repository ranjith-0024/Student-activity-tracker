import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CardHeader, Grid, Skeleton } from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import SummaryCard from '../components/SummaryCard.jsx';
import ActivityTable from '../components/ActivityTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { activityApi, parseApiError, summaryApi } from '../services/api.js';
import { formatHours } from '../utils/format.js';

const CHART_COLORS = ['#0d9488', '#d97706', '#db2777', '#7c3aed', '#0284c7', '#65a30d', '#ea580c', '#0f3d73'];
const EMPTY_SUMMARY = { total_entries: 0, total_students: 0, total_hours: 0, most_active_user: null };

function ChartCard({ title, subtitle, loading, empty, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subtitle}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
        subheaderTypographyProps={{ variant: 'caption' }}
        sx={{
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiCardHeader-content': { minWidth: 0 },
        }}
      />
      <CardContent sx={{ height: 300 }}>
        {loading ? (
          <Skeleton variant="rounded" height="100%" />
        ) : empty ? (
          <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
            <EmptyState title="No data yet" message="Charts appear once activities are added." icon={<BarChartRoundedIcon />} />
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/** Group long tails into "Others" so the pie stays readable. */
function topN(rows, key, n = 6) {
  if (rows.length <= n) return rows;
  const head = rows.slice(0, n - 1);
  const rest = rows.slice(n - 1).reduce((sum, r) => sum + r.hours, 0);
  return [...head, { [key]: 'Others', hours: Math.round(rest * 100) / 100 }];
}

export default function Dashboard({ navigate }) {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [recent, setRecent] = useState([]);
  const [students, setStudents] = useState([]);
  const [activityHours, setActivityHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0); // bump to re-fetch

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [s, acts, byStudent, byActivity] = await Promise.all([
          summaryApi.get(),
          activityApi.list(),
          summaryApi.byStudent(),
          summaryApi.byActivity(),
        ]);
        if (cancelled) return;
        setSummary(s);
        setRecent(acts.slice(0, 5));
        setStudents(byStudent);
        setActivityHours(byActivity);
      } catch (err) {
        if (!cancelled) setError(parseApiError(err, 'Could not load dashboard data.').message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const topStudentHours = students[0]?.hours;
  const pieData = topN(activityHours, 'activity');

  const cards = [
    { title: 'Total Activities', value: summary.total_entries, icon: <AssignmentRoundedIcon />, color: 'primary', caption: 'Records logged' },
    { title: 'Total Students', value: summary.total_students, icon: <GroupsRoundedIcon />, color: 'secondary', caption: 'Unique students' },
    { title: 'Total Hours', value: formatHours(summary.total_hours), icon: <ScheduleRoundedIcon />, color: 'success', caption: 'Across all activities' },
    {
      title: 'Most Active Student',
      value: summary.most_active_user || '—',
      icon: <EmojiEventsRoundedIcon />,
      color: 'warning',
      caption: summary.most_active_user ? `${formatHours(topStudentHours)} hours logged` : 'No activity yet',
    },
  ];

  const isEmpty = !loading && summary.total_entries === 0;

  return (
    <Box>
      <PageHeader title="Overview" subtitle="Live summary of student activity records." />

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

      <Grid container spacing={2.5}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} lg={3} key={c.title}>
            <SummaryCard {...c} loading={loading} />
          </Grid>
        ))}

        <Grid item xs={12} lg={7}>
          <ChartCard title="Hours by student" subtitle="Accumulated hours per student" loading={loading} empty={isEmpty || !students.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={students.slice(0, 8)} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} interval={0} tickFormatter={(v) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip cursor={{ fill: 'rgba(15,39,68,0.05)' }} formatter={(v) => [`${formatHours(v)} hrs`, 'Hours']} />
                <Bar dataKey="hours" fill="#0f3d73" radius={[4, 4, 0, 0]} maxBarSize={72} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <ChartCard title="Hours by activity" subtitle="Share of total hours per activity type" loading={loading} empty={isEmpty || !activityHours.length}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="hours" nameKey="activity" innerRadius="52%" outerRadius="80%" paddingAngle={3} stroke="#fff" strokeWidth={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={entry.activity} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(v, n) => [`${formatHours(v)} hrs`, n]} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Recent activities"
              subheader="The five most recently added records"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              subheaderTypographyProps={{ variant: 'caption' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
              action={
                <Button onClick={() => navigate('activities')} endIcon={<ArrowForwardRoundedIcon />} size="small">
                  View all
                </Button>
              }
            />
            <ActivityTable
              rows={recent}
              loading={loading}
              compact
              emptyContent={
                <EmptyState
                  message="Start by logging the first student activity."
                  actionLabel="Go to activities"
                  onAction={() => navigate('activities')}
                />
              }
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
