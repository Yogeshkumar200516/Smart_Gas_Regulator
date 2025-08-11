import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebaseConfig";

export default function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.clear();
    console.log("🔍 Setting up Firebase realtime listener...");

    // 🔑 IMPORTANT: Updated ref path based on your data nesting
    const sensorRef = ref(db, "1/sensorData");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("📡 Realtime Firebase Data:", data);

          setSensorData(data);

          // Update weight history with last 10 readings
          if (data.currentWeight !== undefined && data.currentWeight !== null) {
            setWeightHistory((prev) => [
              ...prev.slice(-9), // Keep last 9 items
              {
                time: new Date().toLocaleTimeString(),
                weight: data.currentWeight,
              },
            ]);
          }
        } else {
          console.warn("⚠ No data found at path '1/sensorData'");
          setSensorData(null);
          setWeightHistory([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("❌ Firebase read failed:", error);
        setLoading(false);
      }
    );

    return () => {
      console.log("🛑 Unsubscribing from Firebase listener");
      unsubscribe();
    };
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Tare Weight */}
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <CardContent>
                <Typography variant="h6">Tare Weight</Typography>
                <Typography variant="h4">
                  {sensorData?.tareWeight ?? "--"} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gas Content Weight */}
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: "#2e7d32", color: "#fff" }}>
              <CardContent>
                <Typography variant="h6">Gas Content Weight</Typography>
                <Typography variant="h4">
                  {sensorData?.gasContentWeight ?? "--"} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Weight */}
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: "#0288d1", color: "#fff" }}>
              <CardContent>
                <Typography variant="h6">Current Weight</Typography>
                <Typography variant="h4">
                  {sensorData?.currentWeight ?? "--"} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gas Leak */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                backgroundColor: sensorData?.gasLeakDetected
                  ? "#d32f2f"
                  : "#388e3c",
                color: "#fff",
              }}
            >
              <CardContent>
                <Typography variant="h6">Gas Leak</Typography>
                <Typography variant="h4">
                  {sensorData?.gasLeakDetected ? "Detected" : "Safe"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weight History Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weight History
                </Typography>
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={weightHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#1976d2"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Debug Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Raw Firebase Data (Debug)
                </Typography>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(sensorData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
