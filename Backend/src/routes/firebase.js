// /backend/routes/machines.js

const express = require("express");
const router = express.Router();
const db = require("../config/config.js"); // Your MySQL connection

// GET all machines
router.get("/", async (req, res) => {
  try {
    const [machines] = await db.execute(
      "SELECT machine_id, machine_name FROM machines"
    );
    res.json(machines);
  } catch (err) {
    console.error("Error fetching machines:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET daily gas usage for a specific machine (last 30 days)
router.get("/:machineId/usage", async (req, res) => {
  const { machineId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT DATE(recorded_at) AS date,
              MAX(current_weight) - MIN(current_weight) AS usage
       FROM sensor_data
       WHERE machine_id = ?
       GROUP BY DATE(recorded_at)
       ORDER BY date DESC
       LIMIT 30`,
      [machineId]
    );

    // Format usage data: { date: 'YYYY-MM-DD', usage: number }
    const usageData = rows.map(({ date, usage }) => ({
      date: date.toISOString().split("T")[0],
      usage: usage < 0 ? 0 : parseFloat(usage.toFixed(2)),
    }));

    res.json(usageData.reverse()); // Send oldest first
  } catch (err) {
    console.error("Error fetching usage data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
