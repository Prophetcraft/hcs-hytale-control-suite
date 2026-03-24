module.exports = {
  startedAt: Date.now(),
  lastStartTime: null,
  lastStopTime: null,
  lastAction: "idle",
  lastError: null,
  status: "IDLE",
  shutdownTimers: []
};