const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./src/config/config.js'); // your DB connection
const userRoutes = require('./src/routes/authRoutes.js');
const machineRoutes = require('./src/routes/machines.js');
const createCylinderRoutes = require('./src/routes/cylinders.js'); // ✅ renamed

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes(db));
app.use('/api/machines', machineRoutes);
app.use('/api/cylinders', createCylinderRoutes(db)); // ✅ pass db here

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
