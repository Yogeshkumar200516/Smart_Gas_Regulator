import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, IconButton
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

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

        // ✅ Format date to yyyy-MM-dd (MySQL-safe)
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
      replaced_date: replacedDate, // ✅ Format is now correct
    };

    try {
      if (editingCylinder) {
        await axios.put(
          `http://localhost:5000/api/cylinders/${editingCylinder.cylinder_id}`,
          payload
        );
      } else {
        await axios.post('http://localhost:5000/api/cylinders', payload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save cylinder:', err.response?.data || err.message);
      alert("Failed to save cylinder.");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this cylinder?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/cylinders/${editingCylinder.cylinder_id}`, {
        params: { user_id: userId }
      });
      onClose();
    } catch (err) {
      console.error('❌ Delete failed:', err.response?.data || err.message);
      alert("Failed to delete cylinder.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {editingCylinder ? "Edit Cylinder" : "Add Cylinder"}
        {editingCylinder && (
          <IconButton
            onClick={handleDelete}
            color="error"
            style={{ float: 'right' }}
            title="Delete Cylinder"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Gas Weight (kg)"
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
                style={{
                  opacity: isUsed ? 0.5 : 1,
                  pointerEvents: isUsed ? 'none' : 'auto',
                }}
              >
                {m.machine_name} ({m.serial_number}) {isUsed ? ' - In Use' : ''}
              </MenuItem>
            );
          })}
        </TextField>

        {machines.length > 0 &&
          machines.every(m => usedMachineIds.has(m.machine_id) && m.machine_id !== machineId) && (
            <p style={{ color: 'red', fontSize: '0.9rem' }}>
              All machines are currently in use. Please wait until one is available.
            </p>
          )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {editingCylinder ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
