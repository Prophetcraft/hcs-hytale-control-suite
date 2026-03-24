const express = require("express");
const multer = require("multer");
const path = require("path");

const CONFIG = require("../../utils/config");
const logger = require("../../utils/logger");
const { MODS_PATH } = require("../../utils/paths");

const { getOverview } = require("../../core/server/status");
const { startServer } = require("../../core/server/start");
const { stopServer } = require("../../core/server/stop");
const { restartServer } = require("../../core/server/restart");

const {
  cleanConfigDuplicates,
  getActiveMods,
  getRemovedMods
} = require("../../core/mods/list");

const { installUploadedMod } = require("../../core/mods/install");
const { uninstallMod, deleteModPermanently } = require("../../core/mods/uninstall");
const { restoreMod } = require("../../core/mods/restore");

const {
  scheduleSystemShutdown,
  abortSystemShutdown
} = require("../../core/system/shutdown");

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, MODS_PATH),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-()\s]/g, "_");
      cb(null, safe);
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 512
  }
});

router.get("/api/overview", async (_req, res) => {
  try {
    const overview = await getOverview();
    res.json(overview);
  } catch (error) {
    logger.error(`Overview failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/api/mods", (_req, res) => {
  try {
    cleanConfigDuplicates();

    res.json({
      active: getActiveMods(),
      removed: getRemovedMods()
    });
  } catch (error) {
    logger.error(`Mods listing failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/api/actions", (_req, res) => {
  try {
    const actions = logger.readActions(25);
    res.json({ actions });
  } catch (error) {
    logger.error(`Actions read failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/api/server/start", async (_req, res) => {
  try {
    const result = await startServer("dashboard");
    res.json(result);
  } catch (error) {
    logger.error(`Start failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/api/server/stop", async (_req, res) => {
  try {
    const result = await stopServer();
    res.json(result);
  } catch (error) {
    logger.error(`Stop failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/api/server/restart", async (_req, res) => {
  try {
    const result = await restartServer("dashboard");
    res.json(result);
  } catch (error) {
    logger.error(`Restart failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/api/system/shutdown", (_req, res) => {
  try {
    const result = scheduleSystemShutdown(
      Number(CONFIG.shutdownDelayMinutes || 30)
    );

    if (!result.ok) {
      return res.status(403).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error(`Shutdown schedule failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/api/system/abort-shutdown", (_req, res) => {
  try {
    const result = abortSystemShutdown();
    res.json(result);
  } catch (error) {
    logger.error(`Abort shutdown failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/api/mods/uninstall", (req, res) => {
  try {
    const modName = String(req.body.modName || "").trim();

    if (!modName) {
      return res.status(400).json({ ok: false, error: "Missing modName." });
    }

    const result = uninstallMod(modName);
    res.json(result);
  } catch (error) {
    logger.error(`Uninstall failed: ${error.message}`);
    res.status(
      error.message === "Missing modName." ? 400 : 500
    ).json({ ok: false, error: error.message });
  }
});

router.post("/api/mods/restore", (req, res) => {
  try {
    const modName = String(req.body.modName || "").trim();

    if (!modName) {
      return res.status(400).json({ ok: false, error: "Missing modName." });
    }

    const result = restoreMod(modName);
    res.json(result);
  } catch (error) {
    logger.error(`Restore failed: ${error.message}`);
    const status = error.message === "Missing modName."
      ? 400
      : error.message === "Mod not found in removed mods."
        ? 404
        : 500;

    res.status(status).json({ ok: false, error: error.message });
  }
});

router.post("/api/mods/delete-permanent", (req, res) => {
  try {
    const modName = String(req.body.modName || "").trim();

    if (!modName) {
      return res.status(400).json({ ok: false, error: "Missing modName." });
    }

    const result = deleteModPermanently(modName);
    res.json(result);
  } catch (error) {
    logger.error(`Permanent delete failed: ${error.message}`);
    const status = error.message === "Missing modName."
      ? 400
      : error.message === "Mod not found in removed mods."
        ? 404
        : 500;

    res.status(status).json({ ok: false, error: error.message });
  }
});

router.post("/upload", upload.single("modFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file uploaded." });
    }

    const result = await installUploadedMod(req.file);
    res.json(result);
  } catch (error) {
    logger.error(`Upload endpoint failed: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;