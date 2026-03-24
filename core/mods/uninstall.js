const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const { MODS_PATH, REMOVED_MODS_PATH } = require("../../utils/paths");
const { removeModFromConfig } = require("./list");

function uninstallMod(modName) {
  const safeModName = String(modName || "").trim();

  if (!safeModName) {
    throw new Error("Missing modName.");
  }

  const removedFromConfig = removeModFromConfig(safeModName);

  const file = fs
    .readdirSync(MODS_PATH)
    .find((f) => f.toLowerCase().startsWith(safeModName.toLowerCase()));

  if (file) {
    fs.renameSync(
      path.join(MODS_PATH, file),
      path.join(REMOVED_MODS_PATH, file)
    );
  }

  logger.mod(`Uninstalled ${safeModName}`);

  return {
    ok: true,
    removedFromConfig,
    moved: Boolean(file)
  };
}

function deleteModPermanently(modName) {
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

  const full = path.join(REMOVED_MODS_PATH, file);

  if (fs.lstatSync(full).isDirectory()) {
    fs.rmSync(full, { recursive: true, force: true });
  } else {
    fs.unlinkSync(full);
  }

  logger.mod(`Deleted permanently ${safeModName}`);

  return {
    ok: true,
    message: `${safeModName} deleted permanently.`
  };
}

module.exports = {
  uninstallMod,
  deleteModPermanently
};