const { exec } = require("child_process");
const CONFIG = require("../../utils/config");
const logger = require("../../utils/logger");
const state = require("../state");

function clearShutdownTimers() {
  state.shutdownTimers.forEach(clearTimeout);
  state.shutdownTimers = [];
}

function scheduleSystemShutdown(minutes = Number(CONFIG.shutdownDelayMinutes || 30)) {
  if (!CONFIG.allowShutdownCommands) {
    return {
      ok: false,
      error: "Shutdown is disabled in the configuration."
    };
  }

  clearShutdownTimers();

  state.shutdownTimers.push(
    setTimeout(() => exec("shutdown /s /f /t 0"), minutes * 60 * 1000)
  );

  state.lastAction = "shutdown_scheduled";
  logger.system(`Shutdown scheduled in ${minutes} minutes.`);

  return {
    ok: true,
    message: `Shutdown scheduled in ${minutes} minutes.`
  };
}

function abortSystemShutdown() {
  clearShutdownTimers();

  try {
    exec("shutdown /a");
  } catch {}

  state.lastAction = "shutdown_aborted";
  logger.system("Shutdown aborted.");

  return {
    ok: true,
    message: "Shutdown aborted successfully."
  };
}

module.exports = {
  clearShutdownTimers,
  scheduleSystemShutdown,
  abortSystemShutdown
};