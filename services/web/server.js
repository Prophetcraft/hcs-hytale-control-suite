const express = require("express");
const path = require("path");

const CONFIG = require("../../utils/config");
const logger = require("../../utils/logger");
const { WEB_PATH, WEB_IMAGES_PATH } = require("../../utils/paths");
const apiRouter = require("./api");

let appInstance = null;
let serverInstance = null;

async function startWebServer() {
  if (serverInstance) {
    return serverInstance;
  }

  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use("/assets/images", express.static(WEB_IMAGES_PATH));
  app.use(express.static(WEB_PATH));

  app.use(apiRouter);

  app.get("/", (_req, res) => {
    res.sendFile(path.join(WEB_PATH, "index.html"));
  });

  await new Promise((resolve) => {
    serverInstance = app.listen(CONFIG.webPort, () => {
      logger.web(`Dashboard online on port ${CONFIG.webPort}`);
      console.log(`🌐 Dashboard online on http://shortmemory.ddns.net:${CONFIG.webPort}`);
      resolve();
    });
  });

  appInstance = app;
  return serverInstance;
}

function getWebApp() {
  return appInstance;
}

function getWebServer() {
  return serverInstance;
}

module.exports = {
  startWebServer,
  getWebApp,
  getWebServer
};