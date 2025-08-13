// src/pages/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

// Helpers
const formatDateTime = (ts) => (ts ? new Date(ts * 1000).toLocaleString() : "-");
const toHourLabel = (ts) => {
  const d = new Date(ts * 1000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
};
const toDayKey = (ts) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};
const round1 = (num) => Math.round((Number(num) + Number.EPSILON) * 10) / 10;
const clampPct = (v) => Math.max(0, Math.min(100, v));
const cardSx = (isDark) => ({
  borderRadius: 4,
  background: isDark ? "rgba(255,255,255,0.05)" : "#f7f7f9",
  boxShadow: 3,
  height: "100%",
});

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // State
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  // Fetch all machines + check if each has sensor data
  useEffect(() => {
    if (!userId) return;

    async function fetchMachinesWithData() {
      try {
        const res = await fetch(`http://localhost:5000/api/sensors/machines/${userId}`);
        const machineList = await res.json();

        // For each machine, check sensor data availability
        const machinesWithData = await Promise.all(
          machineList.map(async (m) => {
            try {
              const resp = await fetch(`http://localhost:5000/api/sensors/sensor/${m.machine_id}`);
              const sensorData = await resp.json();
              return {
                ...m,
                hasData: Array.isArray(sensorData) && sensorData.length > 0,
              };
            } catch (e) {
              // On error, consider no data
              return { ...m, hasData: false };
            }
          })
        );

        setMachines(machinesWithData);

        // Select first machine that has data, fallback to empty
        const firstWithData = machinesWithData.find((m) => m.hasData);
        setSelectedMachine(firstWithData ? firstWithData.machine_id : "");
      } catch (err) {
        console.error("Error fetching machines:", err);
      }
    }

    fetchMachinesWithData();
  }, [userId]);

  // Fetch sensor data for selected machine (history)
  useEffect(() => {
    if (!selectedMachine) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/sensors/sensor/${selectedMachine}`)
      .then((res) => res.json())
      .then((rows) => {
        setHistory(Array.isArray(rows) ? [...rows].reverse() : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sensor data:", err);
        setLoading(false);
      });
  }, [selectedMachine]);

  if (!userId) {
    return (
      <Typography variant="h6" sx={{ p: 3 }}>
        Please log in to view dashboard.
      </Typography>
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const latest = history.length ? history[history.length - 1] : null;
  const live = latest ?? {
    current_weight: 0,
    gas_content_weight: 0,
    tare_weight: 1,
    gas_leak_detected: false,
    timestamp: nowSec,
  };

  const gasPct = useMemo(() => {
    const raw = (Number(live.gas_content_weight) / Number(live.tare_weight || 1)) * 100;
    return clampPct(round1(raw));
  }, [live]);

  const historyPlusLive = useMemo(() => {
    const base = Array.isArray(history) ? [...history] : [];
    if (!base.length || base[base.length - 1]?.timestamp !== live.timestamp) {
      base.push({
        timestamp: live.timestamp,
        current_weight: Number(live.current_weight),
        gas_content_weight: Number(live.gas_content_weight),
        tare_weight: Number(live.tare_weight),
        gas_leak_detected: Boolean(live.gas_leak_detected),
      });
    }
    return base;
  }, [history, live]);

  const last24hData = useMemo(() => {
    const cutoff = (Date.now() - 24 * 3600 * 1000) / 1000;
    const filtered = historyPlusLive.filter((r) => r.timestamp >= cutoff);
    if (filtered.length < 2) {
      return [
        { time: toHourLabel(nowSec - 1800), gasPct },
        { time: toHourLabel(nowSec), gasPct },
      ];
    }
    return filtered.map((r) => ({
      time: toHourLabel(r.timestamp),
      gasPct: clampPct(round1((r.gas_content_weight / (r.tare_weight || 1)) * 100)),
    }));
  }, [historyPlusLive, gasPct, nowSec]);

  const weeklyUsage = useMemo(() => {
    const byDay = new Map();
    historyPlusLive.forEach((r) => {
      const key = toDayKey(r.timestamp);
      const item = byDay.get(key);
      if (!item || r.timestamp > item.timestamp) {
        byDay.set(key, { timestamp: r.timestamp, gasContentWeight: r.gas_content_weight });
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
    return out.length ? out.slice(-7) : [{ day: toDayKey(nowSec), usage: 0 }];
  }, [historyPlusLive, nowSec]);

  const compositionData = useMemo(
    () =>
      historyPlusLive.slice(-100).map((r) => ({
        time: toHourLabel(r.timestamp),
        gas: round1(r.gas_content_weight),
        tare: round1(r.tare_weight),
      })),
    [historyPlusLive]
  );

  const leakByDay = useMemo(() => {
    const map = new Map();
    historyPlusLive.forEach((r) => {
      if (r.gas_leak_detected) {
        const key = toDayKey(r.timestamp);
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    const arr = Array.from(map.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => (a.day < b.day ? -1 : 1));
    return arr.length ? arr.slice(-14) : [{ day: toDayKey(nowSec), count: 0 }];
  }, [historyPlusLive, nowSec]);

  const avgDailyUsage = useMemo(() => {
    return weeklyUsage.length
      ? round1(weeklyUsage.reduce((acc, r) => acc + r.usage, 0) / weeklyUsage.length)
      : 0;
  }, [weeklyUsage]);

  const estDaysLeft = useMemo(() => {
    return avgDailyUsage > 0
      ? round1((live.gas_content_weight || 0) / avgDailyUsage)
      : "—";
  }, [avgDailyUsage, live.gas_content_weight]);

  const pieColors = isDark ? ["#4fc3f7", "#37474f"] : ["#42a5f5", "#e0e0e0"];

  // ---- UI ----
  return (
    <Box p={3} sx={{ pb: 6 }}>
      {/* Machine Selector */}
      <Grid container justifyContent="flex-end">
  <FormControl sx={{ mb: 3, minWidth: 250 }}>
    <InputLabel>Select Machine</InputLabel>
    <Select
      value={selectedMachine}
      label="Select Machine"
      onChange={(e) => setSelectedMachine(e.target.value)}
    >
      {machines.map((m) => (
        <MenuItem
          key={m.machine_id}
          value={m.machine_id}
          disabled={!m.hasData}
        >
          {m.machine_name || `Machine ${m.machine_id}`}{" "}
          {!m.hasData && "(Not connected with cylinder)"}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

      {loading ? (
        <Typography variant="h6" sx={{ p: 3 }}>
          Loading sensor data...
        </Typography>
      ) : !latest ? (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            background: isDark ? "rgba(255,255,255,0.05)" : "#f9f9f9",
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="text.secondary">
            Machine not connected to any cylinder yet.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Ready to connect a cylinder for live monitoring.
          </Typography>
        </Paper>
      ) : (
        <>
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
            <Stack
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography
                  fontWeight="bold"
                  sx={{
                    textShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    fontSize: { xs: "20px", sm: "26px", md: "28px" },
                  }}
                >
                  Cylinder Monitoring Dashboard
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Last Updated: {formatDateTime(live.timestamp)}
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
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack spacing={0}>
                    <Typography variant="caption">Est. Days Left</Typography>
                    <Typography variant="h6" fontWeight="600">
                      {typeof estDaysLeft === "number"
                        ? `${estDaysLeft} days`
                        : "—"}
                    </Typography>
                  </Stack>
                  <Speed />
                </Stack>
              </Card>
            </Stack>
          </Paper>

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 3, width: '100%', display: 'flex', flexDirection: {xs: 'column', sm: 'row'} }}>
  {/* Current Weight */}
  <Grid item sx={{width: {xs: '100%', sm: '23.5%'}}}>
    <Card sx={cardSx(isDark)}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Scale color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h6">Current Weight</Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {round1(live.current_weight)} kg
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="body2" color="text.secondary">
          Includes cylinder + gas weight.
        </Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Gas Content */}
  <Grid item sx={{width: {xs: '100%', sm: '23.5%'}}}>
    <Card sx={cardSx(isDark)}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <LocalGasStation color="success" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h6">Gas Content</Typography>
        </Box>
        <Typography variant="h4" color="success.main" fontWeight="bold">
          {round1(live.gas_content_weight)} kg
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

  {/* Tare Weight */}
  <Grid item sx={{width: {xs: '100%', sm: '23.5%'}}}>
    <Card sx={cardSx(isDark)}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Scale color="secondary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h6">Cylinder Weight</Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold" color="secondary.main">
          {round1(live.tare_weight)} kg
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="body2" color="text.secondary">
          Weight of the full cylinder with gas.
        </Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Gas Leak Status */}
  <Grid item sx={{width: {xs: '100%', sm: '23.5%'}}}>
    <Card sx={cardSx(isDark)}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <WarningAmber
            color={live.gas_leak_detected ? "error" : "disabled"}
            sx={{ fontSize: 40, mr: 2 }}
          />
          <Typography variant="h6">Gas Leak Status</Typography>
        </Box>
        <Chip
          label={
            live.gas_leak_detected
              ? "Leak Detected!"
              : loading
              ? "—"
              : "Safe"
          }
          color={live.gas_leak_detected ? "error" : "success"}
          variant="filled"
          sx={{ fontSize: "1rem", fontWeight: "bold" }}
        />
      </CardContent>
    </Card>
  </Grid>
</Grid>

          {/* Row 2: Gauge + 24h Line */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Donut Gauge */}
            <Grid item xs={12} md={4} sx={{ width: { xs: "100%", sm: "32%" } }}>
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
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.75 }}
                            >
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
            <Grid item xs={12} md={8} sx={{ width: { xs: "100%", sm: "66%" } }}>
              <Card sx={cardSx(isDark)}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Timeline sx={{ opacity: 0.7 }} />
                    <Typography variant="h6">Last 24 Hours — Gas Level (%)</Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Higher frequency points indicate more readings captured.
                  </Typography>

                  <Box sx={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={last24hData}
                        margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
                      >
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
                        <ReferenceLine
                          y={20}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                        />
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
          <Grid container spacing={3} sx={{ mb: 5, width: "100%" }}>
            {/* 7-Day Usage */}
            <Grid item xs={12} md={6} lg={4} sx={{ width: { xs: "100%", sm: "32%" } }}>
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
                      <BarChart
                        data={weeklyUsage}
                        margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
                      >
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
            <Grid item xs={12} md={6} lg={4} sx={{ width: { xs: "100%", sm: "32%" } }}>
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
                      <AreaChart
                        data={compositionData}
                        margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
                      >
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
                          formatter={(v, n) => [`${v} kg`, n === "gas" ? "Gas" : "Tare"]}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="gas"
                          stroke="#42a5f5"
                          fill="url(#gasGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="tare"
                          stroke="#66bb6a"
                          fill="url(#tareGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Leak Events Timeline */}
            <Grid item xs={12} lg={4} sx={{ width: { xs: "100%", sm: "32%" } }}>
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
                      <BarChart
                        data={leakByDay}
                        margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
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
        </>
      )}
    </Box>
  );
}
