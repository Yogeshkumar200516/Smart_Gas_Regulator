import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton, Stack, Typography,
  useTheme, useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import API_BASE_URL from '../../context/Api';

export default function MachineModal({ open, onClose, machine, userId }) {
  const [machine_name, setMachineName] = useState('');
  const [serial_number, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
    if (!machine_name || !serial_number || !location) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      machine_name,
      serial_number,
      location,
      user_id: parseInt(userId || localStorage.getItem('userId'))
    };

    try {
      if (machine) {
        await fetch(`${API_BASE_URL}/api/machines/${machine.machine_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_BASE_URL}/api/machines`, {
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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a, #1e293b)'
            : '#fff',
        }
      }}
    >
      {/* HEADER WITH ICON */}
      <DialogTitle
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1e293b, #0f172a)'
            : 'linear-gradient(135deg, #42a5f5, #478ed1)',
          color: '#fff',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <DevicesOtherIcon />
          <Typography variant="h6">
            {machine ? 'Edit Machine' : 'Add New Machine'}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* FORM CONTENT */}
      <DialogContent sx={{ mt: 1 }}>
        <Stack spacing={2}>
          <TextField
            label="Machine Name"
            placeholder="Enter machine name"
            fullWidth
            value={machine_name}
            onChange={(e) => setMachineName(e.target.value)}
          />
          <TextField
            label="Serial Number"
            placeholder="Enter serial number"
            fullWidth
            value={serial_number}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
          <TextField
            label="Location"
            placeholder="Enter location"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Stack>
      </DialogContent>

      {/* ACTION BUTTONS */}
      <DialogActions
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
        >
          {machine ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
