// /backend/services/firebaseSync.js
const admin = require("firebase-admin");
const db = require("../config/db");

function initFirebase(serviceAccountPath, databaseURL) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    databaseURL,
  });
}

async function insertSensorData(machineId, data) {
  const sql = `
    INSERT INTO sensor_data 
      (machine_id, current_weight, gas_content_weight, gas_leak_detected, tare_weight, recorded_at) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const timestamp = data.timestamp ? new Date(data.timestamp * 1000) : new Date();

  await db.execute(sql, [
    machineId,
    data.currentWeight,
    data.gasContentWeight,
    data.gasLeakDetected,
    data.tareWeight,
    timestamp,
  ]);
}

function listenFirebaseToMySQL() {
  const database = admin.database();
  const machinesRef = database.ref("machines");

  machinesRef.on("child_changed", async (snapshot) => {
    const machineId = snapshot.key;
    const machineData = snapshot.val();

    if (machineData.sensorData) {
      try {
        await insertSensorData(machineId, machineData.sensorData);
        console.log(`Synced sensor data for machine ${machineId}`);
      } catch (error) {
        console.error("Error syncing sensor data:", error);
      }
    }
  });
}

module.exports = { initFirebase, listenFirebaseToMySQL };
