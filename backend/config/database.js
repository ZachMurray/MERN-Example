const mongoose = require('mongoose');

const options = {
  serverSelectionTimeoutMS: 5000,
};

let primaryMonitorTimer = null;
let isSwitching = false;
let isIntentionalDisconnect = false;
let listenersAttached = false;
let activeTarget = null;

let currentPrimaryUri = null;
let currentFallbackUri = null;

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

const connectToTarget = async (uri, label) => {
  if (mongoose.connection.readyState !== 0) {
    isIntentionalDisconnect = true;
    await mongoose.disconnect().catch(() => {});
    isIntentionalDisconnect = false;
  }

  const conn = await mongoose.connect(uri, options);
  activeTarget = label;
  return conn;
};

const failoverToFallback = async (reason) => {
  if (!currentFallbackUri || currentFallbackUri === currentPrimaryUri) {
    console.error(`Primary MongoDB lost and no valid fallback is configured. Reason: ${reason}`);
    process.exit(1);
  }

  if (isSwitching) {
    return;
  }

  isSwitching = true;

  try {
    console.warn(`Primary MongoDB lost during runtime. Switching to fallback. Reason: ${reason}`);
    const conn = await connectToTarget(currentFallbackUri, 'fallback');
    console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
    startPrimaryMonitor(currentPrimaryUri);
  } catch (error) {
    console.error(`Runtime failover to fallback failed: ${error.message}`);
    process.exit(1);
  } finally {
    isSwitching = false;
  }
};

const attachConnectionListeners = () => {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;

  mongoose.connection.on('disconnected', () => {
    if (isIntentionalDisconnect) {
      return;
    }

    if (activeTarget === 'primary') {
      failoverToFallback('mongoose connection emitted disconnected').catch(() => {});
    }
  });

  mongoose.connection.on('error', (error) => {
    if (activeTarget === 'primary') {
      console.warn(`MongoDB connection error on primary: ${error.message}`);
    }
  });
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
      const conn = await connectToTarget(primaryUri, 'primary');
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

  currentPrimaryUri = primaryUri;
  currentFallbackUri = fallbackUri;

  attachConnectionListeners();

  if (!primaryUri) {
    console.error('Error connecting to MongoDB: MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    const conn = await connectToTarget(primaryUri, 'primary');
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
      const conn = await connectToTarget(fallbackUri, 'fallback');
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
