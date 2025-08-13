// src/pages/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebaseConfig";

// ===== MUI =====
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  useTheme,
  Paper,
  Divider,
  Stack,
  Tooltip as MuiTooltip,
  Skeleton,
} from "@mui/material";
import {
  LocalGasStation,
  WarningAmber,
  Scale,
  Speed,
  Timeline,
  Equalizer,
} from "@mui/icons-material";

// ===== Recharts =====
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";

// ----------------- Helpers -----------------
const formatDateTime = (tsSeconds) => {
  if (!tsSeconds) return "-";
  const d = new Date(tsSeconds * 1000);
  return d.toLocaleString();
};

const toHourLabel = (ts) => {
  const d = new Date(ts * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const toDayKey = (ts) => {
  const d = new Date(ts * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const round1 = (num) => Math.round((Number(num) + Number.EPSILON) * 10) / 10;
const clampPct = (v) => Math.max(0, Math.min(100, v));

const cardSx = (isDark) => ({
  borderRadius: 4,
  background: isDark ? "rgba(255,255,255,0.05)" : "#f7f7f9",
  boxShadow: 3,
  height: "100%",
});

// ----------------- Component -----------------
export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Live + history state (always declared in same order)
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);

  // Subscriptions (run once)
  useEffect(() => {
    const sensorRef = ref(db, "machines/123/sensorData");
    const unsubLive = onValue(sensorRef, (snapshot) => {
      setSensorData(snapshot.exists() ? snapshot.val() : null);
    });

    const historyRef = ref(db, "machines/123/history");
    const unsubHist = onValue(historyRef, (snapshot) => {
      if (!snapshot.exists()) {
        setHistory([]);
        return;
      }
      const raw = snapshot.val();
      const rows = Object.entries(raw).map(([k, v]) => {
        const tsFromKey = Number.isFinite(Number(k)) ? Number(k) : null;
        const ts = v?.timestamp ?? tsFromKey ?? 0;
        return {
          timestamp: ts,
          currentWeight: Number(v?.currentWeight ?? 0),
          gasContentWeight: Number(v?.gasContentWeight ?? 0),
          tareWeight: Number(v?.tareWeight ?? 0),
          gasLeakDetected: Boolean(v?.gasLeakDetected ?? false),
        };
      });
      rows.sort((a, b) => a.timestamp - b.timestamp);
      setHistory(rows);
    });

    return () => {
      unsubLive();
      unsubHist();
    };
  }, []);

  // ---- IMPORTANT: no early return before hooks below ----
  // Use **safe defaults** so all hooks run every render.
  const nowSec = Math.floor(Date.now() / 1000);
  const live = sensorData ?? {
    currentWeight: 0,
    gasContentWeight: 0,
    tareWeight: 1, // avoid /0
    gasLeakDetected: false,
    timestamp: nowSec,
  };
  const loading = sensorData === null;

  // Live derived values
  const gasPct = useMemo(() => {
    const raw = (Number(live.gasContentWeight) / Number(live.tareWeight || 1)) * 100;
    return clampPct(round1(raw));
  }, [live.gasContentWeight, live.tareWeight]);

  // Merge history + live as last point
  const historyPlusLive = useMemo(() => {
    const base = Array.isArray(history) ? history.slice() : [];
    if (!base.length || base[base.length - 1]?.timestamp !== live.timestamp) {
      base.push({
        timestamp: live.timestamp,
        currentWeight: Number(live.currentWeight),
        gasContentWeight: Number(live.gasContentWeight),
        tareWeight: Number(live.tareWeight),
        gasLeakDetected: Boolean(live.gasLeakDetected),
      });
    }
    return base;
  }, [history, live]);

  // Charts data (all computed every render)
  const last24hData = useMemo(() => {
    const cutoff = (Date.now() - 24 * 3600 * 1000) / 1000;
    const filtered = historyPlusLive.filter((r) => r.timestamp >= cutoff);
    if (filtered.length < 2) {
      const now = Math.floor(Date.now() / 1000);
      return [
        { time: toHourLabel(now - 1800), gasPct },
        { time: toHourLabel(now), gasPct },
      ];
    }
    return filtered.map((r) => ({
      time: toHourLabel(r.timestamp),
      gasPct: clampPct(round1((r.gasContentWeight / (r.tareWeight || 1)) * 100)),
    }));
  }, [historyPlusLive, gasPct]);

  const weeklyUsage = useMemo(() => {
    const byDay = new Map();
    historyPlusLive.forEach((r) => {
      const key = toDayKey(r.timestamp);
      const item = byDay.get(key);
      if (!item || r.timestamp > item.timestamp) {
        byDay.set(key, { timestamp: r.timestamp, gasContentWeight: r.gasContentWeight });
      }
    });
    const days = Array.from(byDay.entries())
      .map(([day, v]) => ({ day, ...v }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const out = [];
    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1];
      const curr = days[i];
      const usage = Math.max(0, round1(prev.gasContentWeight - curr.gasContentWeight));
      out.push({ day: curr.day, usage });
    }
    if (out.length === 0) {
      const today = toDayKey(nowSec);
      return [
        { day: today, usage: 0 },
        { day: today, usage: 0 },
      ];
    }
    return out.slice(-7);
  }, [historyPlusLive, nowSec]);

  const compositionData = useMemo(() => {
    const arr = historyPlusLive.slice(-100);
    if (!arr.length) return [];
    return arr.map((r) => ({
      time: toHourLabel(r.timestamp),
      gas: round1(r.gasContentWeight),
      tare: round1(r.tareWeight),
    }));
  }, [historyPlusLive]);

  const leakByDay = useMemo(() => {
    const map = new Map();
    historyPlusLive.forEach((r) => {
      if (r.gasLeakDetected) {
        const key = toDayKey(r.timestamp);
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    const arr = Array.from(map.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => (a.day < b.day ? -1 : 1));

    if (arr.length === 0) {
      const today = toDayKey(nowSec);
      return [
        { day: today, count: 0 },
        { day: today, count: 0 },
      ];
    }
    return arr.slice(-14);
  }, [historyPlusLive, nowSec]);

  const avgDailyUsage = useMemo(() => {
    if (!weeklyUsage.length) return 0;
    const sum = weeklyUsage.reduce((acc, r) => acc + r.usage, 0);
    return round1(sum / weeklyUsage.length);
  }, [weeklyUsage]);

  const estDaysLeft = useMemo(() => {
    if (!avgDailyUsage || avgDailyUsage <= 0) return "—";
    return round1((live.gasContentWeight || 0) / avgDailyUsage);
  }, [avgDailyUsage, live.gasContentWeight]);

  const pieColors = isDark ? ["#4fc3f7", "#37474f"] : ["#42a5f5", "#e0e0e0"];

  // ------------- UI -------------
  return (
    <Box p={3} sx={{ pb: 6 }}>
      {/* Header */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #0f172a, #1e293b)"
            : "linear-gradient(135deg, #42a5f5, #478ed1)",
          color: "#fff",
        }}
      >
        <Stack sx={{justifyContent: 'space-between', alignItems: 'center', display: 'flex', flexDirection: {xs: 'column', sm: 'row'}}}>
          <Box sx={{mb: 2}}>
            <Typography
              fontWeight="bold"
              sx={{ textShadow: "0 2px 6px rgba(0,0,0,0.25)", fontSize: {xs: '20px', sm: '26px', md: '28px'} }}
            >
              Cylinder Monitoring Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Last Updated: {loading ? <em>Loading…</em> : formatDateTime(live.timestamp)}
            </Typography>
          </Box>

          <Card
            elevation={0}
            sx={{
              px: 2,
              py: 1.2,
              borderRadius: 3,
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              minWidth: 200,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack spacing={0}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Est. Days Left
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {typeof estDaysLeft === "number" ? `${estDaysLeft} days` : "—"}
                </Typography>
              </Stack>
              <Speed />
            </Stack>
          </Card>
        </Stack>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3, width: '100%', display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, }}>
        {/* Current Weight */}
        <Grid item xs={12} sm={6} md={4} sx={{width: {xs: '100%', sm: '32%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Scale color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Current Weight</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {loading ? <Skeleton width={120} /> : `${round1(live.currentWeight)} kg`}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Includes cylinder + gas weight.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gas Content */}
        <Grid item xs={12} sm={6} md={4} sx={{width: {xs: '100%', sm: '32%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocalGasStation color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Gas Content</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {loading ? <Skeleton width={120} /> : `${round1(live.gasContentWeight)} kg`}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={gasPct}
                sx={{ mt: 2, height: 8, borderRadius: 5 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {gasPct}% Full
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Leak Status */}
        <Grid item xs={12} sm={6} md={4} sx={{width: {xs: '100%', sm: '32%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningAmber
                  color={live.gasLeakDetected ? "error" : "disabled"}
                  sx={{ fontSize: 40, mr: 2 }}
                />
                <Typography variant="h6">Gas Leak Status</Typography>
              </Box>
              <Chip
                label={live.gasLeakDetected ? "Leak Detected!" : loading ? "—" : "Safe"}
                color={live.gasLeakDetected ? "error" : "success"}
                variant="filled"
                sx={{ fontSize: "1rem", fontWeight: "bold" }}
              />
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Realtime indicator based on latest sensor event.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Gauge + 24h Line */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Donut Gauge */}
        <Grid item xs={12} md={4} sx={{width: {xs: '100%', sm: '32%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Equalizer sx={{ opacity: 0.7 }} />
                <Typography variant="h6">Live Gas Level</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Gauge shows remaining gas vs empty capacity.
              </Typography>

              <Box sx={{ height: 260, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: "Gas", value: gasPct },
                        { name: "Empty", value: clampPct(100 - gasPct) },
                      ]}
                      innerRadius="60%"
                      outerRadius="85%"
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                    >
                      <Cell fill={pieColors[0]} />
                      <Cell fill={pieColors[1]} />
                    </Pie>
                    <Legend verticalAlign="bottom" height={24} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                      formatter={(v, n) => [`${round1(Number(v))}%`, n]}
                    />
                    <foreignObject x="35%" y="38%" width="30%" height="30%">
                      <Box
                        sx={{
                          textAlign: "center",
                          lineHeight: 1.1,
                          color: isDark ? "#e2e8f0" : "#263238",
                        }}
                      >
                        <Typography variant="h5" fontWeight="700">
                          {gasPct}%
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.75 }}>
                          Remaining
                        </Typography>
                      </Box>
                    </foreignObject>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 24h Gas % Line */}
        <Grid item xs={12} md={8} sx={{width: {xs: '100%', sm: '66%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Timeline sx={{ opacity: 0.7 }} />
                <Typography variant="h6">Last 24 Hours — Gas Level (%)</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Higher frequency points indicate more readings captured.
              </Typography>

              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last24hData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                      formatter={(v) => [`${v}%`, "Gas Level"]}
                    />
                    <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 4" />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="gasPct"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Weekly Usage + Composition + Leak Timeline */}
      <Grid container spacing={3} sx={{ mb: 5, width: '100%' }}>
        {/* 7-Day Usage */}
        <Grid item xs={12} md={6} lg={4} sx={{width: {xs: '100%', sm: '32%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Equalizer sx={{ opacity: 0.7 }} />
                <Typography variant="h6">7-Day Daily Usage (kg)</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Computed as day-over-day gas decrease.
              </Typography>

              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyUsage} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                      formatter={(v) => [`${v} kg`, "Usage"]}
                    />
                    <Legend />
                    <Bar dataKey="usage" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Composition Over Time */}
        <Grid item xs={12} md={6} lg={4} sx={{width: {xs: '100%', sm: '32%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Equalizer sx={{ opacity: 0.7 }} />
                <Typography variant="h6">Weight Composition Over Time</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Tracks tare vs gas weight trend.
              </Typography>

              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={compositionData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#42a5f5" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="tareGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#66bb6a" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#66bb6a" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                      formatter={(v, n) => [`${v} kg`, n === "gas" ? "Gas" : "Tare"]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="gas"
                      stroke="#42a5f5"
                      fillOpacity={1}
                      fill="url(#gasGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="tare"
                      stroke="#66bb6a"
                      fillOpacity={1}
                      fill="url(#tareGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Leak Events Timeline */}
        <Grid item xs={12} lg={4} sx={{width: {xs: '100%', sm: '32%'}}}>
          <Card sx={cardSx(isDark)}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <WarningAmber sx={{ opacity: 0.7 }} />
                <Typography variant="h6">Leak Events (last 14 days)</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Count of leak detections per day.
              </Typography>

              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leakByDay} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                      formatter={(v) => [`${v}`, "Leak Count"]}
                    />
                    <Legend />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4} textAlign="center" sx={{ opacity: 0.75 }}>
        <MuiTooltip title="Uses live sensor feed and optional history path for analytics">
          <Typography variant="caption">
            Powered by Flame Shield • Theme aware • User-friendly
          </Typography>
        </MuiTooltip>
      </Box>
    </Box>
  );
}
