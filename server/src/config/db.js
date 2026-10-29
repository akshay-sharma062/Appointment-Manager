const mongoose = require('mongoose');
const dns = require('node:dns');

// Configure reliable DNS servers (Google + Cloudflare) for Atlas SRV lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in restricted environments
}

// Cache connection across serverless invocations (e.g. Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(uri) {
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    if (isVercel) {
      const msg = 'MONGODB_URI is missing in Vercel Environment Variables. Please add your MongoDB Atlas connection string.';
      console.warn(`[MongoDB Warning]: ${msg}`);
      const err = new Error(msg);
      err.code = 'ERR_MISSING_MONGODB_URI';
      throw err;
    }
    // Fallback to Atlas default or localhost
    return connectDB('mongodb://127.0.0.1:27017/appointment_manager');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
      })
      .then((conn) => {
        console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
        return conn;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`[MongoDB] Connection error: ${err.message}`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
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
  const isMissingUri = Boolean(process.env.VERCEL) && !process.env.MONGODB_URI;

  return {
    state: readyStates[stateCode] || 'unknown',
    connected: stateCode === 1,
    databaseName: mongoose.connection.name || 'appointment_manager',
    ...(isMissingUri && { error: 'MONGODB_URI is not set in Vercel Environment Variables' }),
  };
}

module.exports = {
  connectDB,
  getDbStatus,
};
