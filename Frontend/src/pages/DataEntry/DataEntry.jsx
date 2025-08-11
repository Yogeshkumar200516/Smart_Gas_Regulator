import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  IconButton, Grid
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import MachineModal from './MachineModal';
import CylinderModal from './CylinderModal';
import axios from 'axios';

export default function DataEntry() {
  const [machines, setMachines] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [showMachines, setShowMachines] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const [cylinderModalOpen, setCylinderModalOpen] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState(null);

  const userId = localStorage.getItem('userId');

  const fetchMachines = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/machines/user/${userId}`);
      setMachines(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Failed to fetch machines:', err);
    }
  };

  const fetchCylinders = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/cylinders/user/${userId}`);
      setCylinders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Failed to fetch cylinders:', err);
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchCylinders();
  }, [userId]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDeleteMachine = async (machine_id) => {
    try {
      await axios.delete(`http://localhost:5000/api/machines/${machine_id}?user_id=${userId}`);
      fetchMachines();
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert('Failed to delete machine');
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
      await axios.delete(`http://localhost:5000/api/cylinders/${cylinder_id}?user_id=${userId}`);
      fetchCylinders();
    } catch (err) {
      console.error('❌ Cylinder delete failed:', err);
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

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Cylinder Entries</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setShowMachines(!showMachines)}
            sx={{ mr: 2 }}
          >
            {showMachines ? "Hide Machines" : "Machines"}
          </Button>
          <Button variant="contained" onClick={() => setCylinderModalOpen(true)}>
            Add Cylinder
          </Button>
        </Box>
      </Box>

      {/* Cylinder cards */}
      <Grid container spacing={2}>
        {cylinders.map((cylinder) => (
          <Grid item xs={12} sm={6} md={4} key={cylinder.cylinder_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cylinder.machine_name}</Typography>
                <Typography>Gas Weight: {cylinder.gas_weight} kg</Typography>
                <Typography>
                  Replaced Date: {formatDate(cylinder.replaced_date)}
                </Typography>
                <Box mt={1}>
                  <IconButton color="primary" onClick={() => handleEditCylinder(cylinder)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteCylinder(cylinder.cylinder_id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Machines section */}
      {showMachines && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
            <Typography variant="h5">Machines</Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddMachine}
            >
              Add Machine
            </Button>
          </Box>
          <Grid container spacing={2}>
            {machines.map((machine) => (
              <Grid item xs={12} sm={6} md={4} key={machine.machine_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{machine.machine_name}</Typography>
                    <Typography>Serial: {machine.serial_number}</Typography>
                    <Typography>Location: {machine.location}</Typography>
                    <Box mt={1}>
                      <IconButton color="primary" onClick={() => handleEditMachine(machine)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteMachine(machine.machine_id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
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
