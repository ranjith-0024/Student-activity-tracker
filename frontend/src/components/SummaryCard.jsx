import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';

const ACCENTS = {
  primary: { bar: '#0f3d73', bg: '#e8eef5', fg: '#0f3d73' },
  secondary: { bar: '#1d4e89', bg: '#e7f0f8', fg: '#1d4e89' },
  success: { bar: '#157347', bg: '#e8f6ee', fg: '#157347' },
  warning: { bar: '#b45309', bg: '#fef4e6', fg: '#b45309' },
};

export default function SummaryCard({ title, value, icon, color = 'primary', caption, loading }) {
  const accent = ACCENTS[color] || ACCENTS.primary;

  return (
    <Card sx={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ height: 3, bgcolor: accent.bar }} />
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              noWrap
              sx={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary' }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={90} height={44} />
            ) : (
              <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: 26, sm: 30 } }} noWrap title={String(value)}>
                {value}
              </Typography>
            )}
            {caption && (
              <Typography variant="caption" color="text.secondary">
                {caption}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              bgcolor: accent.bg,
              color: accent.fg,
              boxShadow: 'inset 0 0 0 1px rgba(15, 39, 68, 0.06)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
