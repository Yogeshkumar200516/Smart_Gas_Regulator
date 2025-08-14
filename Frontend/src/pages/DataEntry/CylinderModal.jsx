import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, IconButton, useTheme, useMediaQuery, Typography, Stack
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import API_BASE_URL from '../../context/Api';

export default function CylinderModal({
  open,
  onClose,
  userId,
  machines = [],
  cylinders = [],
  editingCylinder = null,
}) {
  const [gasWeight, setGasWeight] = useState('');
  const [replacedDate, setReplacedDate] = useState('');
  const [machineId, setMachineId] = useState('');

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const usedMachineIds = new Set(
    cylinders
      .filter(c => !editingCylinder || c.cylinder_id !== editingCylinder.cylinder_id)
      .map(c => c.machine_id)
  );

  useEffect(() => {
    if (open) {
      if (editingCylinder) {
        setGasWeight(editingCylinder.gas_weight);
        setMachineId(editingCylinder.machine_id);

        const isoDate = new Date(editingCylinder.replaced_date);
        const formatted = isoDate.toISOString().split('T')[0];
        setReplacedDate(formatted);
      } else {
        setGasWeight('');
        setReplacedDate('');
        setMachineId('');
      }
    }
  }, [open, editingCylinder]);

  const handleSubmit = async () => {
    if (!machineId || !gasWeight || !replacedDate) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      user_id: userId,
      machine_id: machineId,
      gas_weight: gasWeight,
      replaced_date: replacedDate,
    };

    try {
      if (editingCylinder) {
        await axios.put(
          `${API_BASE_URL}/api/cylinders/${editingCylinder.cylinder_id}`,
          payload
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/cylinders`, payload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save cylinder:', err.response?.data || err.message);
      alert("Failed to save cylinder.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this cylinder?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/cylinders/${editingCylinder.cylinder_id}`, {
        params: { user_id: userId }
      });
      onClose();
    } catch (err) {
      console.error('❌ Delete failed:', err.response?.data || err.message);
      alert("Failed to delete cylinder.");
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
          p: { xs: 1, sm: 0 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a, #1e293b)'
            : '#fff'
        }
      }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalGasStationIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            {editingCylinder ? "Edit Cylinder" : "Add New Cylinder"}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          {editingCylinder && (
            <IconButton
              onClick={handleDelete}
              sx={{ color: theme.palette.error.main }}
              title="Delete Cylinder"
            >
              <DeleteIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose} title="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Form Content */}
      <DialogContent sx={{ mt: 1 }}>
        <TextField
          label="Gas Weight (kg)"
          placeholder="Enter gas weight"
          fullWidth
          type="number"
          margin="normal"
          value={gasWeight}
          onChange={e => setGasWeight(e.target.value)}
        />
        <TextField
          label="Replaced Date"
          fullWidth
          type="date"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={replacedDate}
          onChange={e => setReplacedDate(e.target.value)}
        />
        <TextField
          select
          fullWidth
          label="Select Machine"
          margin="normal"
          value={machineId}
          onChange={e => setMachineId(e.target.value)}
        >
          {machines.map((m) => {
            const isUsed = usedMachineIds.has(m.machine_id);
            return (
              <MenuItem
                key={m.machine_id}
                value={m.machine_id}
                disabled={isUsed}
                sx={{ opacity: isUsed ? 0.5 : 1 }}
              >
                {m.machine_name} ({m.serial_number})
                {isUsed ? ' - In Use' : ''}
              </MenuItem>
            );
          })}
        </TextField>

        {machines.length > 0 &&
          machines.every(m => usedMachineIds.has(m.machine_id) && m.machine_id !== machineId) && (
            <Typography sx={{ color: 'error.main', fontSize: '0.9rem', mt: 1 }}>
              All machines are currently in use. Please wait until one is available.
            </Typography>
          )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2,
          justifyContent: 'space-between'
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
          {editingCylinder ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
