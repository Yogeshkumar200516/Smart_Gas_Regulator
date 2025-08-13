// src/pages/History/History.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardHeader, CardContent,
  FormControl, InputLabel, Select, MenuItem, Chip, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Stack, Button,
  CircularProgress, useTheme
} from '@mui/material';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import GasMeterIcon from '@mui/icons-material/GasMeter';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const API = {
  machines:        '/api/machines',                              // -> [{id,name}]
  replacements:    (id) => `/api/history/replacements?machineId=${id}`,
  usage:           (id) => `/api/history/usage?machineId=${id}`,
  leaks:           (id) => `/api/history/leaks?machineId=${id}`,
  valveOps:        (id) => `/api/history/valves?machineId=${id}`,
  alerts:          (id) => `/api/history/alerts?machineId=${id}`,
};

function SectionCard({ icon, title, action, children }) {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
      <CardHeader
        avatar={icon}
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>}
        action={action}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>{children}</CardContent>
    </Card>
  );
}

function SimpleTable({ columns, rows, emptyText = 'No records' }) {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell key={c.field} sx={{ fontWeight: 700 }}>{c.headerName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4, opacity: 0.7 }}>
                {emptyText}
              </TableCell>
            </TableRow>
          ) : rows.map((r, i) => (
            <TableRow key={r.id ?? i}>
              {columns.map((c) => (
                <TableCell key={c.field}>
                  {typeof c.render === 'function' ? c.render(r[c.field], r) : r[c.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default function History() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [machineId, setMachineId] = useState('');
  const [replacements, setReplacements] = useState([]);
  const [usage, setUsage] = useState([]);
  const [leaks, setLeaks] = useState([]);
  const [valves, setValves] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // 1) Load machines once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API.machines);
        const data = await res.json();
        setMachines(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length) {
          setMachineId(String(data[0].id));
        }
      } catch {
        setMachines([]);
      }
    })();
  }, []);

  // 2) Load all history blocks for selected machine
  useEffect(() => {
    if (!machineId) return;
    setLoading(true);
    const go = async () => {
      try {
        const [
          rRes, uRes, lRes, vRes, aRes
        ] = await Promise.all([
          fetch(API.replacements(machineId)),
          fetch(API.usage(machineId)),
          fetch(API.leaks(machineId)),
          fetch(API.valveOps(machineId)),
          fetch(API.alerts(machineId)),
        ]);

        const [r,u,l,v,a] = await Promise.all([
          rRes.json(), uRes.json(), lRes.json(), vRes.json(), aRes.json()
        ]);

        setReplacements(Array.isArray(r) ? r : []);
        setUsage(Array.isArray(u) ? u : []);
        setLeaks(Array.isArray(l) ? l : []);
        setValves(Array.isArray(v) ? v : []);
        setAlerts(Array.isArray(a) ? a : []);
      } catch {
        setReplacements([]); setUsage([]); setLeaks([]); setValves([]); setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    go();
  }, [machineId]);

  // Small helpers for chips
  const leakChip = (severity='') => {
    const lvl = String(severity).toLowerCase();
    const color = lvl === 'critical' ? 'error' : (lvl === 'minor' ? 'warning' : 'default');
    return <Chip size="small" label={severity || '—'} color={color} variant="outlined" />;
  };
  const alertChip = (type='') => (
    <Chip size="small" label={type?.replace(/_/g,' ') || '—'} color="warning" variant="outlined" />
  );
  const valveChip = (action='') => {
    const a = String(action).toUpperCase();
    const color = a === 'OPEN' ? 'success' : (a === 'CLOSE' ? 'default' : 'info');
    return <Chip size="small" label={a} color={color} variant="outlined" />;
  };

  const machineOptions = useMemo(
    () => machines.map(m => ({ value: String(m.id), label: m.name })),
    [machines]
  );

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 6 }}>
      {/* Header row */}
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          History
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="machine-select-label">Select Machine</InputLabel>
            <Select
              labelId="machine-select-label"
              value={machineId}
              label="Select Machine"
              onChange={(e) => setMachineId(e.target.value)}
            >
              {machineOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              // simple CSV export of the five sections together
              const rows = [
                ['SECTION','DATE/TIME','COL1','COL2','COL3','COL4'],
                ...replacements.map(r => ['Replacement', r.replaced_at ?? r.date_time, r.cylinder_brand, `${r.gas_weight_kg ?? r.weight} kg`, r.note ?? '', '']),
                ...usage.map(u => ['Usage', u.date, `${u.gas_used_kg ?? u.used} kg`, `${u.remaining_pct ?? u.remaining}%`, '', '']),
                ...leaks.map(l => ['Leak', l.occurred_at, l.machine_name ?? '', `Severity: ${l.severity}`, '', '']),
                ...valves.map(v => ['Valve', v.timestamp, `Action: ${v.action}`, `Source: ${v.source}`, v.reason ?? '', '']),
                ...alerts.map(a => ['Alert', a.timestamp, a.type, a.machine_name ?? '', '', '']),
              ];
              const csv = rows.map(r => r.map(x => `"${(x ?? '').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `history_machine_${machineId}.csv`; a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </Button>
        </Stack>
      </Stack>

      {loading && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      )}

      {!loading && (
        <Grid container spacing={3}>
          {/* 1) Cylinder Replacement History */}
          <Grid item xs={12} md={6}>
            <SectionCard
              icon={<HistoryToggleOffIcon color="primary" />}
              title="Cylinder Replacement History"
            >
              <SimpleTable
                columns={[
                  { field: 'replaced_at', headerName: 'Date & Time' },
                  { field: 'cylinder_brand', headerName: 'Brand' },
                  { field: 'gas_weight_kg', headerName: 'Gas Weight (kg)', render: v => (v ?? '—') },
                  { field: 'note', headerName: 'Note' },
                ]}
                rows={replacements}
                emptyText="No replacement records found."
              />
            </SectionCard>
          </Grid>

          {/* 2) Gas Usage History */}
          <Grid item xs={12} md={6}>
            <SectionCard
              icon={<GasMeterIcon color="primary" />}
              title="Gas Usage History"
            >
              <SimpleTable
                columns={[
                  { field: 'date', headerName: 'Date' },
                  { field: 'gas_used_kg', headerName: 'Used (kg)', render: v => (v ?? '—') },
                  { field: 'remaining_pct', headerName: 'Remaining (%)', render: v => (v ?? '—') },
                ]}
                rows={usage}
                emptyText="No usage records found."
              />
            </SectionCard>
          </Grid>

          {/* 3) Leak Detection Events */}
          <Grid item xs={12} md={6}>
            <SectionCard
              icon={<ReportGmailerrorredIcon color="error" />}
              title="Leak Detection Events"
            >
              <SimpleTable
                columns={[
                  { field: 'occurred_at', headerName: 'Date & Time' },
                  { field: 'severity', headerName: 'Severity', render: v => leakChip(v) },
                  { field: 'ppm', headerName: 'Concentration (ppm)', render: v => (v ?? '—') },
                  { field: 'resolved', headerName: 'Resolved', render: v => v ? <Chip size="small" color="success" label="Yes" /> : <Chip size="small" variant="outlined" label="No" /> },
                ]}
                rows={leaks}
                emptyText="No leak events recorded."
              />
            </SectionCard>
          </Grid>

          {/* 4) Valve Operation Logs */}
          <Grid item xs={12} md={6}>
            <SectionCard
              icon={<PowerSettingsNewIcon color="secondary" />}
              title="Valve Operation Logs"
            >
              <SimpleTable
                columns={[
                  { field: 'timestamp', headerName: 'Date & Time' },
                  { field: 'action', headerName: 'Action', render: v => valveChip(v) },
                  { field: 'source', headerName: 'Source' }, // MANUAL / AUTO
                  { field: 'reason', headerName: 'Reason' },
                ]}
                rows={valves}
                emptyText="No valve operations logged."
              />
            </SectionCard>
          </Grid>

          {/* 5) Alert & Buzzer Triggers */}
          <Grid item xs={12}>
            <SectionCard
              icon={<WarningAmberIcon color="warning" />}
              title="Alert & Buzzer Triggers"
              action={
                <Stack direction="row" spacing={2}>
                  <Chip label="Low Gas" size="small" variant="outlined" />
                  <Chip label="Leak" size="small" color="warning" variant="outlined" />
                  <Chip label="Flame Off" size="small" variant="outlined" />
                </Stack>
              }
            >
              <SimpleTable
                columns={[
                  { field: 'timestamp', headerName: 'Date & Time' },
                  { field: 'type', headerName: 'Alert Type', render: v => alertChip(v) },
                  { field: 'message', headerName: 'Message' },
                  { field: 'acknowledged', headerName: 'Acknowledged', render: v => v ? 'Yes' : 'No' },
                ]}
                rows={alerts}
                emptyText="No alerts triggered."
              />
            </SectionCard>
          </Grid>
        </Grid>
      )}

      <Divider sx={{ mt: 4 }} />
      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 2 }}>
        Tip: This page is filtered by the selected machine. Add machines & cylinders in Data Entry — they’ll appear here automatically once the backend endpoints return data.
      </Typography>
    </Box>
  );
}
