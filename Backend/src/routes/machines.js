const express = require('express');
const router = express.Router();
const db = require('../config/config.js');

// POST: Add a new machine
router.post('/', (req, res) => {
  const { user_id, machine_name, serial_number, location } = req.body;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ error: 'Invalid or missing user_id' });
  }

  const sql = 'INSERT INTO machines (user_id, machine_name, serial_number, location) VALUES (?, ?, ?, ?)';
  db.query(sql, [parseInt(user_id), machine_name, serial_number, location], (err, result) => {
    if (err) {
      console.error('❌ Error inserting machine:', err);
      return res.status(500).json({ error: 'Failed to add machine' });
    }
    res.status(201).json({ message: '✅ Machine added successfully', machine_id: result.insertId });
  });
});

// PUT: Update machine (ownership validated)
router.put('/:machine_id', (req, res) => {
  const machine_id = parseInt(req.params.machine_id);
  const { user_id, machine_name, serial_number, location } = req.body;

  if (!user_id || isNaN(user_id) || !machine_id || isNaN(machine_id)) {
    return res.status(400).json({ error: 'Invalid user_id or machine_id' });
  }

  const checkSql = 'SELECT user_id FROM machines WHERE machine_id = ?';
  db.query(checkSql, [machine_id], (err, results) => {
    if (err) {
      console.error('❌ Error checking machine ownership:', err);
      return res.status(500).json({ error: 'Failed to update machine' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    if (parseInt(results[0].user_id) !== parseInt(user_id)) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this machine' });
    }

    const updateSql = 'UPDATE machines SET machine_name = ?, serial_number = ?, location = ? WHERE machine_id = ?';
    db.query(updateSql, [machine_name, serial_number, location, machine_id], (err2) => {
      if (err2) {
        console.error('❌ Error updating machine:', err2);
        return res.status(500).json({ error: 'Failed to update machine' });
      }
      res.json({ message: '✅ Machine updated successfully' });
    });
  });
});

// GET: Get all machines by user
router.get('/user/:user_id', (req, res) => {
  const user_id = parseInt(req.params.user_id);

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ error: 'Invalid or missing user_id' });
  }

  const sql = 'SELECT * FROM machines WHERE user_id = ?';
  db.query(sql, [user_id], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching machines:', err);
      return res.status(500).json({ error: 'Failed to fetch machines' });
    }
    res.json(rows);
  });
});

// DELETE: Delete machine (only if user owns it and no linked cylinders)
router.delete('/:machine_id', (req, res) => {
  const machine_id = parseInt(req.params.machine_id);
  const user_id = parseInt(req.query.user_id);

  if (!user_id || isNaN(user_id) || !machine_id || isNaN(machine_id)) {
    return res.status(400).json({ error: 'Missing or invalid user_id or machine_id' });
  }

  console.log(`Delete request for machine_id: ${machine_id} by user_id: ${user_id}`);

  // First check ownership
  const checkSql = 'SELECT user_id FROM machines WHERE machine_id = ?';
  db.query(checkSql, [machine_id], (err, results) => {
    if (err) {
      console.error('❌ Error checking machine ownership:', err);
      return res.status(500).json({ error: 'Failed to delete machine' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    if (parseInt(results[0].user_id) !== user_id) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this machine' });
    }

    // Check if cylinder is using this machine
    const usageCheckSql = 'SELECT * FROM cylinders WHERE machine_id = ?';
    db.query(usageCheckSql, [machine_id], (err2, cylinderResults) => {
      if (err2) {
        console.error('❌ Error checking cylinder usage:', err2);
        return res.status(500).json({ error: 'Failed to check cylinder usage' });
      }

      if (cylinderResults.length > 0) {
        return res.status(409).json({ error: 'Machine is in use by a cylinder and cannot be deleted.' });
      }

      // Safe to delete
      const deleteSql = 'DELETE FROM machines WHERE machine_id = ?';
      db.query(deleteSql, [machine_id], (err3) => {
        if (err3) {
          console.error('❌ Error deleting machine:', err3);
          return res.status(500).json({ error: 'Failed to delete machine' });
        }
        console.log(`Machine ${machine_id} deleted successfully.`);
        res.json({ message: '✅ Machine deleted successfully' });
      });
    });
  });
});

module.exports = router;
