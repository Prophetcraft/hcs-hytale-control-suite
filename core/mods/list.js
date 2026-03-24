const fs = require("fs");
const CONFIG = require("../../utils/config");
const logger = require("../../utils/logger");
const {
  SERVER_CONFIG_PATH,
  REMOVED_MODS_PATH
} = require("../../utils/paths");

function readServerConfig() {
  const raw = fs.readFileSync(SERVER_CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}

function writeServerConfig(config) {
  fs.writeFileSync(
    SERVER_CONFIG_PATH,
    JSON.stringify(config, null, 2),
    "utf8"
  );
}

function ensureModsObject(config) {
  if (!config.Mods || typeof config.Mods !== "object") {
    config.Mods = {};
  }
}

function cleanConfigDuplicates() {
  try {
    const config = readServerConfig();
    const currentMods = config.Mods || {};
    const seen = new Set();
    const cleaned = {};

    for (const key of Object.keys(currentMods)) {
      const lower = key.toLowerCase();

      if (!seen.has(lower)) {
        seen.add(lower);
        cleaned[key] = currentMods[key];
      }
    }

    config.Mods = cleaned;
    writeServerConfig(config);
  } catch (error) {
    logger.error(`Config cleanup failed: ${error.message}`);
  }
}

function getActiveMods() {
  const config = readServerConfig();

  return Object.keys(config.Mods || {})
    .filter((key) => !key.toLowerCase().includes("remoteconsole"))
    .map((key) => key.split(":")[1] || key);
}

function getRemovedMods() {
  if (!fs.existsSync(REMOVED_MODS_PATH)) return [];

  return fs.readdirSync(REMOVED_MODS_PATH).map((name) =>
    name.replace(/\.[^/.]+$/, "")
  );
}

function addModToConfig(modName) {
  const config = readServerConfig();
  ensureModsObject(config);

  config.Mods[`hytale:${modName.toLowerCase()}`] = { Enabled: true };

  writeServerConfig(config);
}

function removeModFromConfig(modName) {
  const config = readServerConfig();
  ensureModsObject(config);

  const key = Object.keys(config.Mods).find((k) =>
    k.toLowerCase().endsWith(modName.toLowerCase())
  );

  if (key) {
    delete config.Mods[key];
    writeServerConfig(config);
    return true;
  }

  return false;
}

module.exports = {
  readServerConfig,
  writeServerConfig,
  ensureModsObject,
  cleanConfigDuplicates,
  getActiveMods,
  getRemovedMods,
  addModToConfig,
  removeModFromConfig
};