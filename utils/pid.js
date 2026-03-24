const fs = require("fs");
const { PID_FILE } = require("./paths");
const { execPromise } = require("./exec");

function loadPidInfo() {
  if (!fs.existsSync(PID_FILE)) return null;

  try {
    return JSON.parse(fs.readFileSync(PID_FILE, "utf8"));
  } catch {
    return null;
  }
}

function savePidInfo(data) {
  fs.writeFileSync(PID_FILE, JSON.stringify(data, null, 2), "utf8");
}

function clearPidInfo() {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
}

async function isPidAlive(pid) {
  if (!pid) return false;

  try {
    const out = await execPromise(`tasklist /FI "PID eq ${pid}" /NH`);
    return !out.toLowerCase().includes("no tasks are running");
  } catch {
    return false;
  }
}

module.exports = {
  loadPidInfo,
  savePidInfo,
  clearPidInfo,
  isPidAlive
};