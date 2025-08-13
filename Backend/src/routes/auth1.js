const express = require('express');
const router = express.Router();

// Password validation function
function isValidPassword(password) {
  const pattern = /^(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
  return pattern.test(password) && !password.includes(' ');
}

// Exporting router with db instance
module.exports = (db) => {
  // 📌 REGISTER route
  router.post('/register', async (req, res) => {
    const { name, email, phone_no, address, password } = req.body;

    if (!name || !email || !phone_no || !address || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long, include at least one special character and one number, and have no spaces.',
      });
    }

    try {
      const sql = `INSERT INTO users (name, email, phone_no, address, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
      const [result] = await db.promise().query(sql, [name, email, phone_no, address, password]);

      res.status(201).json({
        message: 'User registered successfully!',
        userId: result.insertId, // ✅ Send userId on registration
      });
    } catch (err) {
      console.error('Register Error:', err);
      res.status(500).json({ message: 'Database error during registration.', error: err });
    }
  });

  // 📌 LOGIN route
  router.post('/login', async (req, res) => {
    const { phone_no, password } = req.body;

    if (!phone_no || !password) {
      return res.status(400).json({ message: 'Phone number and password are required.' });
    }

    try {
      const [rows] = await db.promise().query(
        'SELECT user_id, name FROM users WHERE phone_no = ? AND password = ?',
        [phone_no, password]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid phone number or password.' });
      }

      res.status(200).json({
        message: 'Login successful',
        user_id: rows[0].user_id, // ✅ Only sending what’s needed
        name: rows[0].name,
      });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ message: 'Server error during login.' });
    }
  });

  return router;
};
