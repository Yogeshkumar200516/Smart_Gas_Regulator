// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { LocalGasStation, WarningAmber, Scale } from "@mui/icons-material";

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get logged in user
  const user = JSON.parse(localStorage.getItem("user")); // must contain user_id
  const userId = user?.user_id;

  // ✅ Fetch machines list for this user
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/sensors/machines/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setMachines(data);
        if (data.length > 0) {
          setSelectedMachine(data[0].machine_id); // default first machine
        }
      })
      .catch((err) => console.error("Error fetching machines:", err));
  }, [userId]);

  // ✅ Fetch sensor data whenever selected machine changes
  useEffect(() => {
    if (!selectedMachine) return;

    setLoading(true);
    fetch(`http://localhost:5000/api/sensors/sensor/${selectedMachine}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSensorData(data[0]); // latest record
        } else {
          setSensorData(null);
        }
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

  return (
    <Box p={3}>
      {/* Machine Selector */}
      <FormControl sx={{ mb: 3, minWidth: 250 }}>
        <InputLabel>Select Machine</InputLabel>
        <Select
          value={selectedMachine}
          label="Select Machine"
          onChange={(e) => setSelectedMachine(e.target.value)}
        >
          {machines.map((m) => (
            <MenuItem key={m.machine_id} value={m.machine_id}>
              {m.machine_name || `Machine ${m.machine_id}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Loading State */}
      {loading ? (
        <Typography variant="h6" sx={{ p: 3 }}>
          Loading sensor data...
        </Typography>
      ) : sensorData === null ? (
        // No sensor data case
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
        // Sensor data available
        <>
          {/* Header */}
          <Paper
            elevation={4}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: isDark
                ? "linear-gradient(135deg, #1e3c72, #2a5298)"
                : "linear-gradient(135deg, #42a5f5, #478ed1)",
              color: "#fff",
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Cylinder Monitoring Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Last Updated:{" "}
              {new Date(sensorData.timestamp * 1000).toLocaleString()}
            </Typography>
          </Paper>

          {/* Data Cards */}
          <Grid container spacing={3}>
            {/* Current Weight */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f5f5f5",
                  boxShadow: 3,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Scale color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6">Current Weight</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {sensorData.current_weight} kg
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Gas Content */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f5f5f5",
                  boxShadow: 3,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocalGasStation
                      color="success"
                      sx={{ fontSize: 40, mr: 2 }}
                    />
                    <Typography variant="h6">Gas Content</Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {sensorData.gas_content_weight} kg
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Number(
                      ((sensorData.gas_content_weight /
                        sensorData.tare_weight) *
                        100).toFixed(1)
                    )}
                    sx={{ mt: 2, height: 8, borderRadius: 5 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {(
                      (sensorData.gas_content_weight /
                        sensorData.tare_weight) *
                      100
                    ).toFixed(1)}
                    % Full
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Gas Leak Status */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f5f5f5",
                  boxShadow: 3,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <WarningAmber
                      color={
                        sensorData.gas_leak_detected ? "error" : "disabled"
                      }
                      sx={{ fontSize: 40, mr: 2 }}
                    />
                    <Typography variant="h6">Gas Leak Status</Typography>
                  </Box>
                  <Chip
                    label={
                      sensorData.gas_leak_detected
                        ? "Leak Detected!"
                        : "Safe"
                    }
                    color={
                      sensorData.gas_leak_detected ? "error" : "success"
                    }
                    variant="filled"
                    sx={{ fontSize: "1rem", fontWeight: "bold" }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
