const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "config", "controller.config.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log("controller.config.json not found.");
    process.exit(1);
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  let config;

  try {
    config = JSON.parse(raw);
  } catch (error) {
    console.log("Invalid JSON inside controller.config.json");
    console.log(error.message);
    process.exit(1);
  }

  // ===== DEBUG CONFIG =====
console.log("[CONFIG] Loaded from:", CONFIG_PATH);
console.log("[CONFIG] serverPath:", config.serverPath);
console.log("[CONFIG] configPath:", config.configPath);
  // ========================

  const required = [
    "token",
    "targetChannelId",
    "serverPath",
    "configPath",
    "serverExe",
    "webPort",
    "dashboardPublicUrl"
  ];

  const missing = required.filter(
    (key) => !config[key] || String(config[key]).includes("PUT_")
  );

  if (missing.length) {
    console.log("Incomplete configuration. Missing fields:", missing.join(", "));
    process.exit(1);
  }

  config.controllerName = config.controllerName || "HCS Controller";
  config.statusRefreshMs = Number(config.statusRefreshMs || 3000);
  config.shutdownDelayMinutes = Number(config.shutdownDelayMinutes || 30);
  config.allowShutdownCommands = Boolean(config.allowShutdownCommands);
  config.allowedDiscordUserIds = Array.isArray(config.allowedDiscordUserIds)
    ? config.allowedDiscordUserIds
    : [];

  return config;
}

module.exports = loadConfig();