const fs = require("fs");
const path = require("path");
const CONFIG = require("./config");

const ROOT_PATH = path.join(__dirname, "..");
const RUNTIME_PATH = path.join(ROOT_PATH, "runtime");
const LOGS_PATH = path.join(RUNTIME_PATH, "logs");
const ACTION_LOG = path.join(LOGS_PATH, "actions.log");
const PID_FILE = path.join(RUNTIME_PATH, "server.pid.json");

const WEB_PATH = path.join(ROOT_PATH, "web");
const WEB_ASSETS_PATH = path.join(WEB_PATH, "assets");
const WEB_IMAGES_PATH = path.join(WEB_ASSETS_PATH, "images");
const WEB_ICONS_PATH = path.join(WEB_ASSETS_PATH, "icons");

const SERVER_PATH = CONFIG.serverPath;
const SERVER_CONFIG_PATH = CONFIG.configPath;
const MODS_PATH = path.join(SERVER_PATH, "mods");
const REMOVED_MODS_PATH = path.join(SERVER_PATH, "mods_removed");

function ensureProjectPaths() {
  fs.mkdirSync(RUNTIME_PATH, { recursive: true });
  fs.mkdirSync(LOGS_PATH, { recursive: true });
  fs.mkdirSync(MODS_PATH, { recursive: true });
  fs.mkdirSync(REMOVED_MODS_PATH, { recursive: true });
}

module.exports = {
  ROOT_PATH,
  RUNTIME_PATH,
  LOGS_PATH,
  ACTION_LOG,
  PID_FILE,
  WEB_PATH,
  WEB_ASSETS_PATH,
  WEB_IMAGES_PATH,
  WEB_ICONS_PATH,
  SERVER_PATH,
  SERVER_CONFIG_PATH,
  MODS_PATH,
  REMOVED_MODS_PATH,
  ensureProjectPaths
};