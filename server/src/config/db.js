const mongoose = require('mongoose');

let isConnected = false;

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment_manager';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`[MongoDB] Connection error: ${err.message}`);
    throw err;
  }
}

function getDbStatus() {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: readyStates[stateCode] || 'unknown',
    connected: stateCode === 1,
    databaseName: mongoose.connection.name || null,
  };
}

module.exports = {
  connectDB,
  getDbStatus,
};

