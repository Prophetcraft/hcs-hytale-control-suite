const logger = require("../../utils/logger");
const state = require("../state");
const { execPromise } = require("../../utils/exec");
const { loadPidInfo, clearPidInfo } = require("../../utils/pid");

let discordBotModule = null;

function registerDiscordBotModule(botModule) {
  discordBotModule = botModule;
}

async function sendServerStoppedSummary(source = "system", messageText = "Server stopped successfully.") {
  if (
    !discordBotModule ||
    typeof discordBotModule.getTargetChannel !== "function" ||
    !discordBotModule.EmbedBuilder
  ) {
    logger.warn("Discord bot module not ready. Stop summary skipped.");
    return;
  }

  try {
    const channel = discordBotModule.getTargetChannel();

    if (!channel) {
      logger.warn("Could not send stop summary: target Discord channel not found.");
      return;
    }

    const embed = new discordBotModule.EmbedBuilder()
      .setColor(0xff8b8b)
      .setTitle("🛑 Server Stopped")
      .setDescription(messageText)
      .setFooter({ text: `Source: ${source}` })
      .setTimestamp(new Date());

    await channel.send({ embeds: [embed] });
    logger.discord("Stop summary sent successfully.");
  } catch (error) {
    logger.error(`Failed to send stop summary: ${error.message}`);
  }
}

async function stopServer(source = "unknown") {
  const pidInfo = loadPidInfo();

  if (pidInfo?.pid) {
    try {
      await execPromise(`taskkill /PID ${pidInfo.pid} /T /F`);
      clearPidInfo();

      state.status = "OFFLINE";
      state.lastStopTime = new Date().toISOString();
      state.lastAction = "stop_by_pid";

      logger.server(`Server stopped via tracked PID ${pidInfo.pid}`);

      await sendServerStoppedSummary(
        source,
        "The server has been stopped successfully."
      );

      return {
        ok: true,
        message: "Server stopped using the tracked PID."
      };
    } catch (error) {
      logger.warn(`Stop via PID failed: ${error.message}`);
    }
  }

  try {
    await execPromise("taskkill /F /IM javaw.exe /T");
  } catch {
    try {
      await execPromise("taskkill /F /IM java.exe /T");
    } catch {
      state.lastAction = "stop_failed_no_process";

      return {
        ok: false,
        message: "No running server process was found."
      };
    }
  }

  clearPidInfo();

  state.status = "OFFLINE";
  state.lastStopTime = new Date().toISOString();
  state.lastAction = "stop_fallback_java";

  logger.server("Server stopped using java.exe/javaw.exe fallback.");

  await sendServerStoppedSummary(
    source,
    "The server has been stopped successfully."
  );

  return {
    ok: true,
    message: "Server stopped successfully."
  };
}

module.exports = {
  stopServer,
  sendServerStoppedSummary,
  registerDiscordBotModule
};