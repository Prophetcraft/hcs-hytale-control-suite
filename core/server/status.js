const os = require("os");
const CONFIG = require("../../utils/config");
const state = require("../state");
const { execPromise } = require("../../utils/exec");
const { loadPidInfo, isPidAlive } = require("../../utils/pid");
const { getCpuLoad } = require("../system/cpu");
const { getControllerRam, getSystemRam } = require("../system/ram");
const { getDiskInfo } = require("../system/disk");

async function getJavaProcessStats() {
  try {
    const out = await execPromise("tasklist /NH /FO CSV");
    const lines = out.split(/\r?\n/).filter(Boolean);

    const javaLine = lines.find((line) => {
      const lower = line.toLowerCase();
      return lower.includes("java.exe") || lower.includes("javaw.exe");
    });

    if (!javaLine) {
      return {
        online: false,
        ram: "OFF",
        processName: null
      };
    }

    const cols = javaLine.split('","').map((c) => c.replace(/^"|"$/g, ""));
    const processName = cols[0] || "java.exe";
    const mem = cols[4] ? cols[4].replace(/[^\d]/g, "") : "0";
    const ram = mem ? `${(parseInt(mem, 10) / 1024).toFixed(1)} MB` : "0 MB";

    return {
      online: true,
      ram,
      processName
    };
  } catch {
    return {
      online: false,
      ram: "OFF",
      processName: null
    };
  }
}

async function waitForServerOnline(timeoutMs = 90000, intervalMs = 3000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const javaStats = await getJavaProcessStats();

    if (javaStats.online) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

async function getOverview() {
  const cpuLoad = await getCpuLoad();
  const javaStats = await getJavaProcessStats();
  const pidInfo = loadPidInfo();
  const pidAlive = pidInfo ? await isPidAlive(pidInfo.pid) : false;
  const disk = await getDiskInfo();

  return {
    controller: {
      ram: getControllerRam(),
      uptimeMinutes: Math.floor(process.uptime() / 60)
    },
    server: {
      status: javaStats.online
        ? "ONLINE"
        : state.status === "STARTING"
          ? "STARTING"
          : "OFFLINE",
      ram: javaStats.ram,
      processName: javaStats.processName,
      trackedPid: pidInfo?.pid || null,
      trackedPidAlive: pidAlive,
      lastStartTime: state.lastStartTime,
      lastStopTime: state.lastStopTime
    },
    system: {
      cpuLoad,
      ram: getSystemRam(),
      disk,
      hostname: os.hostname()
    },
    meta: {
      controllerName: CONFIG.controllerName,
      lastAction: state.lastAction,
      lastError: state.lastError,
      dashboardPublicUrl: CONFIG.dashboardPublicUrl,
      statusRefreshMs: CONFIG.statusRefreshMs
    }
  };
}

module.exports = {
  getJavaProcessStats,
  waitForServerOnline,
  getOverview
};