const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const logger = require("../../utils/logger");
const { MODS_PATH } = require("../../utils/paths");
const { addModToConfig } = require("./list");

function normalizeModName(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim()
    .toLowerCase();
}

function installUploadedMod(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file uploaded."));
    }

    try {
      const originalName = file.originalname;
      const uploadedPath = file.path;
      let cleanModName = normalizeModName(originalName);

      if (originalName.toLowerCase().endsWith(".zip")) {
        const targetDir = path.join(MODS_PATH, cleanModName);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        exec(
          `powershell -Command "Expand-Archive -LiteralPath '${uploadedPath}' -DestinationPath '${targetDir}' -Force"`,
          { windowsHide: true },
          (err) => {
            if (err) {
              logger.error(`ZIP extraction failed: ${err.message}`);
              return reject(new Error(err.message));
            }

            try {
              fs.unlinkSync(uploadedPath);

              const manifestPath = path.join(targetDir, "manifest.json");

              if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

                if (manifest.id) {
                  const realId = String(manifest.id)
                    .toLowerCase()
                    .replace(":", "_");

                  const finalModDir = path.join(MODS_PATH, realId);

                  if (finalModDir !== targetDir) {
                    if (fs.existsSync(finalModDir)) {
                      fs.rmSync(finalModDir, { recursive: true, force: true });
                    }

                    fs.renameSync(targetDir, finalModDir);
                    cleanModName = realId;
                  }
                }
              }

              addModToConfig(cleanModName);
              logger.mod(`Uploaded ZIP mod ${cleanModName}`);

              return resolve({
                ok: true,
                modName: cleanModName
              });
            } catch (innerError) {
              logger.error(`Post-extract processing failed: ${innerError.message}`);
              return reject(innerError);
            }
          }
        );

        return;
      }

      addModToConfig(cleanModName);
      logger.mod(`Uploaded file mod ${cleanModName}`);

      resolve({
        ok: true,
        modName: cleanModName
      });
    } catch (error) {
      logger.error(`Upload failed: ${error.message}`);
      reject(error);
    }
  });
}

module.exports = {
  installUploadedMod,
  normalizeModName
};