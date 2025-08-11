import React, { useState, useEffect } from 'react';
import {
  Modal, Box, TextField, Button, Typography, Stack
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// ...imports unchanged
export default function MachineModal({ open, onClose, machine, userId }) {
  const [machine_name, setMachineName] = useState('');
  const [serial_number, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (machine) {
      setMachineName(machine.machine_name);
      setSerialNumber(machine.serial_number);
      setLocation(machine.location);
    } else {
      setMachineName('');
      setSerialNumber('');
      setLocation('');
    }
  }, [machine]);

  const handleSubmit = async () => {
    if (!machine_name || !serial_number || !location) return;

    const payload = {
      machine_name,
      serial_number,
      location,
      user_id: parseInt(userId || localStorage.getItem('userId'))
    };

    try {
      if (machine) {
        // PUT request
        await fetch(`http://localhost:5000/api/machines/${machine.machine_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // POST request
        await fetch('http://localhost:5000/api/machines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      onClose();
    } catch (error) {
      console.error('Error submitting machine:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {machine ? 'Edit Machine' : 'Add New Machine'}
        </Typography>
        <Stack spacing={2}>
          <TextField label="Machine Name" fullWidth value={machine_name} onChange={(e) => setMachineName(e.target.value)} />
          <TextField label="Serial Number" fullWidth value={serial_number} onChange={(e) => setSerialNumber(e.target.value)} />
          <TextField label="Location" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} />
          <Button variant="contained" onClick={handleSubmit}>
            {machine ? 'Update' : 'Add'}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
