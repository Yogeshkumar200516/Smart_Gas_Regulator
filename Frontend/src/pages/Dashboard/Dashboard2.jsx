// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebaseConfig";
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
} from "@mui/material";
import { LocalGasStation, WarningAmber, Scale } from "@mui/icons-material";

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const sensorRef = ref(db, "machines/123/sensorData");
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        setSensorData(snapshot.val());
      } else {
        setSensorData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!sensorData) {
    return (
      <Typography variant="h6" sx={{ p: 3 }}>
        Loading sensor data...
      </Typography>
    );
  }

  const { currentWeight, gasContentWeight, gasLeakDetected, tareWeight, timestamp } = sensorData;
  const gasPercentage = ((gasContentWeight / tareWeight) * 100).toFixed(1);

  return (
    <Box p={3}>
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
          Last Updated: {new Date(timestamp * 1000).toLocaleString()}
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
                {currentWeight} kg
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
                <LocalGasStation color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Gas Content</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {gasContentWeight} kg
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Number(gasPercentage)}
                sx={{ mt: 2, height: 8, borderRadius: 5 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {gasPercentage}% Full
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
                  color={gasLeakDetected ? "error" : "disabled"}
                  sx={{ fontSize: 40, mr: 2 }}
                />
                <Typography variant="h6">Gas Leak Status</Typography>
              </Box>
              <Chip
                label={gasLeakDetected ? "Leak Detected!" : "Safe"}
                color={gasLeakDetected ? "error" : "success"}
                variant="filled"
                sx={{ fontSize: "1rem", fontWeight: "bold" }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
