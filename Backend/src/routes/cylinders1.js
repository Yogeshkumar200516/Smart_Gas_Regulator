const express = require('express');
const router = express.Router();

// Helper: format any date input to 'YYYY-MM-DD' string for MySQL DATE column
function formatDateToSQL(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date)) return null;
  return date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

module.exports = (db) => {
  /**
   * POST /api/cylinders
   * Add a new cylinder entry (only if machine belongs to user)
   */
  router.post('/', async (req, res) => {
    const { user_id, machine_id, gas_weight, replaced_date } = req.body;

    console.log("📩 Cylinder Add Request:", req.body);

    if (!user_id || !machine_id || !gas_weight || !replaced_date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Format date for MySQL
    const replacedDateSQL = formatDateToSQL(replaced_date);
    if (!replacedDateSQL) {
      return res.status(400).json({ message: 'Invalid replaced_date format.' });
    }

    try {
      // Verify user owns the machine
      const [check] = await db.promise().query(
        `SELECT 1 FROM machines WHERE machine_id = ? AND user_id = ?`,
        [machine_id, user_id]
      );

      if (check.length === 0) {
        return res.status(403).json({ message: 'Unauthorized access to this machine.' });
      }

      const insertQuery = `
        INSERT INTO cylinders (machine_id, gas_weight, replaced_date)
        VALUES (?, ?, ?)
      `;
      await db.promise().query(insertQuery, [machine_id, gas_weight, replacedDateSQL]);

      res.status(201).json({ message: 'Cylinder entry added successfully!' });
    } catch (error) {
      console.error("❌ Error inserting cylinder:", error);
      res.status(500).json({ message: 'Database error during insert.', error: error.message });
    }
  });

  /**
   * GET /api/cylinders/user/:userId
   * Get all cylinder entries for a user
   */
  router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
      const [rows] = await db.promise().query(`
        SELECT c.*, m.machine_name
        FROM cylinders c
        JOIN machines m ON c.machine_id = m.machine_id
        WHERE m.user_id = ?
        ORDER BY c.replaced_date DESC
      `, [userId]);

      res.json(rows);
    } catch (error) {
      console.error("❌ Error fetching cylinders:", error);
      res.status(500).json({ message: 'Failed to fetch cylinder records.', error: error.message });
    }
  });

  /**
   * DELETE /api/cylinders/:id?user_id=xx
   * Delete a cylinder entry if it belongs to the user's machine
   */
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
      const [check] = await db.promise().query(
        `SELECT 1 FROM cylinders c
         JOIN machines m ON c.machine_id = m.machine_id
         WHERE c.cylinder_id = ? AND m.user_id = ?`,
        [id, user_id]
      );

      if (check.length === 0) {
        return res.status(403).json({ message: 'Unauthorized or cylinder not found.' });
      }

      await db.promise().query(`DELETE FROM cylinders WHERE cylinder_id = ?`, [id]);
      res.json({ message: 'Cylinder deleted successfully.' });
    } catch (err) {
      console.error("❌ Delete error:", err);
      res.status(500).json({ message: 'Failed to delete cylinder.', error: err.message });
    }
  });

  /**
   * PUT /api/cylinders/:id
   * Update a cylinder entry
   */
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, machine_id, gas_weight, replaced_date } = req.body;

    if (!user_id || !machine_id || gas_weight === undefined || !replaced_date) {
      return res.status(400).json({ message: 'All fields are required: user_id, machine_id, gas_weight, replaced_date.' });
    }

    // Format date for MySQL
    const replacedDateSQL = formatDateToSQL(replaced_date);
    if (!replacedDateSQL) {
      return res.status(400).json({ message: 'Invalid replaced_date format.' });
    }

    try {
      const [check] = await db.promise().query(
        `SELECT 1 FROM machines WHERE machine_id = ? AND user_id = ?`,
        [machine_id, user_id]
      );

      if (check.length === 0) {
        return res.status(403).json({ message: 'Unauthorized machine access.' });
      }

      await db.promise().query(
        `UPDATE cylinders SET machine_id = ?, gas_weight = ?, replaced_date = ? WHERE cylinder_id = ?`,
        [machine_id, gas_weight, replacedDateSQL, id]
      );

      res.json({ message: 'Cylinder updated successfully.' });
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({ message: 'Failed to update cylinder.', error: err.message });
    }
  });

  return router;
};
