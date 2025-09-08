import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Tooltip,
  Divider,
  Paper,
  useTheme,
  CardActions,
  Stack,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Storage,
  LocalGasStation,
  Inventory2Outlined,
} from "@mui/icons-material";
import MachineModal from "./MachineModal";
import CylinderModal from "./CylinderModal";
import axios from "axios";
import API_BASE_URL from "../../context/Api";

export default function DataEntry() {
  const [machines, setMachines] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [showMachines, setShowMachines] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const [cylinderModalOpen, setCylinderModalOpen] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const userId = localStorage.getItem("userId");

  const fetchMachines = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/user/${userId}`);
      setMachines(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch machines:", err);
    }
  };

  const fetchCylinders = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cylinders/user/${userId}`);
      setCylinders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch cylinders:", err);
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchCylinders();
  }, [userId]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString();
  };

  const handleDeleteMachine = async (machine_id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/machines/${machine_id}?user_id=${userId}`);
      fetchMachines();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete machine");
    }
  };

  const handleEditMachine = (machine) => {
    setSelectedMachine(machine);
    setModalOpen(true);
  };

  const handleAddMachine = () => {
    setSelectedMachine(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedMachine(null);
    fetchMachines();
  };

  const handleDeleteCylinder = async (cylinder_id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cylinders/${cylinder_id}?user_id=${userId}`);
      fetchCylinders();
    } catch (err) {
      console.error("❌ Cylinder delete failed:", err);
      alert("Failed to delete cylinder.");
    }
  };

  const handleEditCylinder = (cylinder) => {
    setSelectedCylinder(cylinder);
    setCylinderModalOpen(true);
  };

  const handleCylinderModalClose = () => {
    setCylinderModalOpen(false);
    setSelectedCylinder(null);
    fetchCylinders();
  };

  const cardStyle = {
    height: "100%",
    borderRadius: 4,
    background: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(255,255,255,0.75)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
  };

  const EmptyState = ({ icon: Icon, text }) => (
    <Box
      sx={{
        py: 4,
        width: "100%",
        textAlign: "center",
        opacity: 0.7,
      }}
    >
      <Icon sx={{ fontSize: 48, mb: 1, color: "text.secondary" }} />
      <Typography variant="body1">{text}</Typography>
    </Box>
  );

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Header */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #1e3c72, #2a5298)"
            : "linear-gradient(135deg, #42a5f5, #478ed1)",
          color: "#fff",
          boxShadow: 6,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Typography variant="h4" fontWeight="bold" sx={{ display: "flex", alignItems: "center" }}>
            <LocalGasStation sx={{ mr: 1 }} /> Cylinder & Machine Management
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => setShowMachines(!showMachines)}
              sx={{
                color: "#fff",
                borderColor: "#fff",
                fontWeight: 600,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
            >
              {showMachines ? "Hide Machines" : "View Machines"}
            </Button>
            <Button
              variant="contained"
              onClick={() => setCylinderModalOpen(true)}
              startIcon={<Add />}
              sx={{
                fontWeight: 600,
                borderRadius: 3,
                backgroundColor: "#ffb300",
                "&:hover": { backgroundColor: "#ffa000" },
              }}
            >
              Add Cylinder
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Cylinders Section */}
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", mb: 2 }}
      >
        <Inventory2Outlined sx={{ mr: 1 }} /> Cylinders
      </Typography>
      <Grid container spacing={3}>
        {cylinders.length === 0 ? (
          <Grid item xs={12}>
            <EmptyState
              icon={Inventory2Outlined}
              text='No cylinders found. Click "Add Cylinder" to create one.'
            />
          </Grid>
        ) : (
          cylinders.map((cylinder) => (
            <Grid item xs={12} sm={6} md={4} key={cylinder.cylinder_id}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {cylinder.machine_name}
                  </Typography>
                  <Typography>
                    Gas Weight: <strong>{cylinder.gas_weight} kg</strong>
                  </Typography>
                  <Typography>
                    Replaced Date: {formatDate(cylinder.replaced_date)}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <Tooltip title="Edit Cylinder">
                    <IconButton color="primary" onClick={() => handleEditCylinder(cylinder)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Cylinder">
                    <IconButton color="error" onClick={() => handleDeleteCylinder(cylinder.cylinder_id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Machines Section */}
      {showMachines && (
        <>
          <Divider sx={{ my: 4 }} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            mb={2}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ display: "flex", alignItems: "center" }}>
              <Storage sx={{ mr: 1 }} /> Machines
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddMachine}
              sx={{
                borderRadius: 3,
                backgroundColor: "#66bb6a",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#57a05a" },
              }}
            >
              Add Machine
            </Button>
          </Stack>
          <Grid container spacing={3}>
            {machines.length === 0 ? (
              <Grid item xs={12}>
                <EmptyState icon={Storage} text='No machines found. Click "Add Machine" to create one.' />
              </Grid>
            ) : (
              machines.map((machine) => (
                <Grid item xs={12} sm={6} md={4} key={machine.machine_id}>
                  <Card sx={cardStyle}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {machine.machine_name}
                      </Typography>
                      <Typography>Serial: {machine.serial_number}</Typography>
                      <Typography>Location: {machine.location}</Typography>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <Tooltip title="Edit Machine">
                        <IconButton color="primary" onClick={() => handleEditMachine(machine)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Machine">
                        <IconButton color="error" onClick={() => handleDeleteMachine(machine.machine_id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </>
      )}

      {/* Modals */}
      <MachineModal
        open={modalOpen}
        onClose={handleModalClose}
        machine={selectedMachine}
        userId={userId}
      />
      <CylinderModal
        open={cylinderModalOpen}
        onClose={handleCylinderModalClose}
        userId={userId}
        machines={machines}
        cylinders={cylinders}
        editingCylinder={selectedCylinder}
      />
    </Box>
  );
}