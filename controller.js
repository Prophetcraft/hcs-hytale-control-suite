const { startWebServer } = require("./services/web/server");
const { startDiscordBot } = require("./services/discord/bot");
const logger = require("./utils/logger");
const CONFIG = require("./utils/config");
const state = require("./core/state");

async function bootstrap() {
  try {
    state.lastAction = "controller_booting";
    logger.info(`Starting ${CONFIG.controllerName || "HCS Controller"}...`);

    await startWebServer();
    await startDiscordBot();

    state.status = "IDLE";
    state.lastAction = "controller_ready";

    logger.boot(
      `${CONFIG.controllerName || "HCS Controller"} fully started on web port ${CONFIG.webPort}`
    );
  } catch (error) {
    state.status = "ERROR";
    state.lastError = error.message;
    logger.error(`Bootstrap failed: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();