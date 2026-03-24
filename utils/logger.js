const fs = require("fs");
const { ACTION_LOG, ensureProjectPaths } = require("./paths");

ensureProjectPaths();

function write(type, text) {
  const line = `[${new Date().toISOString()}] [${type}] ${text}\n`;
  fs.appendFileSync(ACTION_LOG, line, "utf8");
  console.log(line.trim());
}

function readActions(limit = 20) {
  if (!fs.existsSync(ACTION_LOG)) return [];
  const text = fs.readFileSync(ACTION_LOG, "utf8").trim();
  if (!text) return [];
  const lines = text.split("\n").filter(Boolean);
  return lines.slice(-limit).reverse();
}

module.exports = {
  readActions,
  info: (text) => write("INFO", text),
  warn: (text) => write("WARN", text),
  error: (text) => write("ERROR", text),
  boot: (text) => write("BOOT", text),
  web: (text) => write("WEB", text),
  system: (text) => write("SYSTEM", text),
  server: (text) => write("SERVER", text),
  discord: (text) => write("DISCORD", text),
  mod: (text) => write("MOD", text)
};