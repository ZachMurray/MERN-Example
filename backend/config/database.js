const mongoose = require('mongoose');

const options = {
  serverSelectionTimeoutMS: 5000,
};

let primaryMonitorTimer = null;
let isSwitching = false;

const parseRecheckIntervalMs = () => {
  const raw = process.env.MONGODB_PRIMARY_RECHECK_INTERVAL_MS;
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 15000;
  }

  return parsed;
};

const stopPrimaryMonitor = () => {
  if (primaryMonitorTimer) {
    clearInterval(primaryMonitorTimer);
    primaryMonitorTimer = null;
  }
};

const canConnectToPrimary = async (primaryUri) => {
  const probe = mongoose.createConnection(primaryUri, options);

  try {
    await probe.asPromise();
    return true;
  } catch (error) {
    return false;
  } finally {
    await probe.close().catch(() => {});
  }
};

const startPrimaryMonitor = (primaryUri) => {
  if (primaryMonitorTimer) {
    return;
  }

  const intervalMs = parseRecheckIntervalMs();
  console.log(`Primary MongoDB monitor enabled. Recheck every ${intervalMs}ms.`);

  primaryMonitorTimer = setInterval(async () => {
    if (isSwitching) {
      return;
    }

    isSwitching = true;

    try {
      const reachable = await canConnectToPrimary(primaryUri);

      if (!reachable) {
        return;
      }

      console.log('Primary MongoDB is reachable again. Switching from fallback to primary.');
      await mongoose.disconnect();
      const conn = await mongoose.connect(primaryUri, options);
      console.log(`MongoDB Connected (primary): ${conn.connection.host}`);
      stopPrimaryMonitor();
    } catch (error) {
      console.warn(`Primary MongoDB switch attempt failed: ${error.message}`);
    } finally {
      isSwitching = false;
    }
  }, intervalMs);
};

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGODB_FALLBACK_URI;

  if (!primaryUri) {
    console.error('Error connecting to MongoDB: MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(primaryUri, options);
    console.log(`MongoDB Connected (primary): ${conn.connection.host}`);
    stopPrimaryMonitor();
    return conn;
  } catch (primaryError) {
    if (!fallbackUri || fallbackUri === primaryUri) {
      console.error(`Error connecting to MongoDB: ${primaryError.message}`);
      process.exit(1);
    }

    console.warn(
      `Primary MongoDB unavailable. Falling back to internal MongoDB. Reason: ${primaryError.message}`
    );

    try {
      const conn = await mongoose.connect(fallbackUri, options);
      console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
      startPrimaryMonitor(primaryUri);
      return conn;
    } catch (fallbackError) {
      console.error(`Error connecting to MongoDB fallback: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
