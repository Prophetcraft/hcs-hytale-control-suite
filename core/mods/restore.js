const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const { MODS_PATH, REMOVED_MODS_PATH } = require("../../utils/paths");
const { addModToConfig } = require("./list");

function restoreMod(modName) {
  const safeModName = String(modName || "").trim();

  if (!safeModName) {
    throw new Error("Missing modName.");
  }

  const file = fs
    .readdirSync(REMOVED_MODS_PATH)
    .find((f) => f.toLowerCase().startsWith(safeModName.toLowerCase()));

  if (!file) {
    throw new Error("Mod not found in removed mods.");
  }

  fs.renameSync(
    path.join(REMOVED_MODS_PATH, file),
    path.join(MODS_PATH, file)
  );

  addModToConfig(safeModName);
  logger.mod(`Restored ${safeModName}`);

  return {
    ok: true,
    message: `${safeModName} restored successfully.`
  };
}

module.exports = {
  restoreMod
};