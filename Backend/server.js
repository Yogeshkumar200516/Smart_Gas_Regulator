// server.js (Main backend file)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const db = require('./src/config/config.js'); // MySQL connection (promise-based)
const userRoutes = require('./src/routes/authRoutes.js');
const machineRoutes = require('./src/routes/machines.js');
const createCylinderRoutes = require('./src/routes/cylinders.js');
const firebaseRoutes = require('./src/routes/firebase.js');
const sensorRoutes = require("./src/routes/sensorRoutes.js");

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, 'src/config/serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://flame-shield-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const firebaseDb = admin.database();

function listenFirebaseToMySQL() {
  const machinesRef = firebaseDb.ref("machines");

  machinesRef.on("child_changed", async (snapshot) => {
    console.log("🔔 Firebase child_changed event triggered");
    const machineId = snapshot.key;
    const machineData = snapshot.val();

    console.log(`Machine ID: ${machineId}`);
    console.log("Data snapshot:", JSON.stringify(machineData, null, 2));

    if (machineData.sensorData) {
      console.log("sensorData found, attempting DB insert...");
      try {
        const sql = `
          INSERT INTO sensor_data 
            (machine_id, current_weight, gas_content_weight, gas_leak_detected, tare_weight, recorded_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const timestamp = machineData.sensorData.timestamp
          ? new Date(machineData.sensorData.timestamp * 1000)
          : new Date();

        await db.execute(sql, [
          machineId,
          machineData.sensorData.currentWeight,
          machineData.sensorData.gasContentWeight,
          machineData.sensorData.gasLeakDetected ? 1 : 0,
          machineData.sensorData.tareWeight,
          timestamp,
        ]);

        console.log(`✅ Synced sensor data for machine ${machineId} at ${timestamp.toISOString()}`);
      } catch (error) {
        console.error("❌ Error syncing sensor data:", error);
      }
    } else {
      console.log("No sensorData found for this machine.");
    }
  });

  // Optional: listen for new machines added (initial data)
  machinesRef.on("child_added", async (snapshot) => {
    console.log("🔔 Firebase child_added event triggered");
    // You can handle insert or initial sync here if needed
  });
}

listenFirebaseToMySQL();

// API routes
app.use('/api/users', userRoutes(db));
app.use('/api/machines', machineRoutes);
app.use('/api/cylinders', createCylinderRoutes(db));
app.use('/api/firebase', firebaseRoutes);
app.use("/api/sensors", sensorRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
