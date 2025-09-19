// routes/sensorRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/config.js"); // using your config.js

// Utility: Wrap MySQL callback API into a Promise
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// ✅ Get all machines for a user
router.get("/machines/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await query(
      "SELECT machine_id, machine_name FROM machines WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching machines:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get sensor data for a machine
router.get("/sensor/:machineId", async (req, res) => {
  try {
    const { machineId } = req.params;
    const rows = await query(
      `SELECT sensor_id, current_weight, gas_content_weight, gas_leak_detected, 
              tare_weight, timestamp 
       FROM sensor_data 
       WHERE machine_id = ? 
       ORDER BY timestamp DESC`,
      [machineId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching sensor data:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
