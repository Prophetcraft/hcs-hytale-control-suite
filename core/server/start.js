const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const CONFIG = require("../../utils/config");
const logger = require("../../utils/logger");
const state = require("../state");
const { SERVER_PATH } = require("../../utils/paths");
const { savePidInfo } = require("../../utils/pid");
const { waitForServerOnline } = require("./status");

let discordBotModule = null;

function registerDiscordBotModule(botModule) {
  discordBotModule = botModule;
}

async function sendServerStartedSummary(source = "system") {
  if (
    !discordBotModule ||
    typeof discordBotModule.getTargetChannel !== "function" ||
    !discordBotModule.EmbedBuilder
  ) {
    logger.warn("Discord bot module not ready. Startup summary skipped.");
    return;
  }

  try {
    const channel = discordBotModule.getTargetChannel();

    if (!channel) {
      logger.warn("Could not send startup summary: target Discord channel not found.");
      return;
    }

    let mods = [];
    try {
      const { getActiveMods } = require("../mods/list");
      mods = getActiveMods();
    } catch {
      mods = [];
    }

    const modCount = mods.length;
    const maxShown = 20;
    const shownMods = mods.slice(0, maxShown);
    const extraCount = Math.max(0, modCount - maxShown);

    const descriptionParts = [
      "The server is now online.",
      "",
      `**Loaded mods:** ${modCount}`
    ];

    if (shownMods.length) {
      descriptionParts.push("", shownMods.map((mod) => `• ${mod}`).join("\n"));
    } else {
      descriptionParts.push("", "No active mods were found in the current configuration.");
    }

    if (extraCount > 0) {
      descriptionParts.push("", `...and ${extraCount} more.`);
    }

    const embed = new discordBotModule.EmbedBuilder()
      .setColor(0x6fff9b)
      .setTitle("✅ Server Started Successfully")
      .setDescription(descriptionParts.join("\n"))
      .setFooter({ text: `Source: ${source}` })
      .setTimestamp(new Date());

    await channel.send({ embeds: [embed] });
    logger.discord("Startup summary sent successfully.");
  } catch (error) {
    logger.error(`Failed to send startup summary: ${error.message}`);
  }
}

async function startServer(source = "unknown", interactionReply = null) {
  const { getJavaProcessStats } = require("./status");
  const javaStats = await getJavaProcessStats();

  if (javaStats.online) {
    state.lastAction = "start_skipped_already_online";
    return {
      ok: true,
      message: "Server is already online."
    };
  }

  const serverExePath = path.join(SERVER_PATH, CONFIG.serverExe);

  if (!fs.existsSync(serverExePath)) {
    throw new Error(`Server executable not found: ${serverExePath}`);
  }

  state.status = "STARTING";
  state.lastAction = "start_requested";

  const child = spawn("cmd.exe", ["/c", CONFIG.serverExe], {
    cwd: SERVER_PATH,
    detached: true,
    windowsHide: true,
    stdio: "ignore"
  });

  child.unref();

  savePidInfo({
    pid: child.pid,
    startedAt: new Date().toISOString()
  });

  state.lastStartTime = new Date().toISOString();
  state.lastError = null;

  logger.server(`Start requested from ${source} - tracked PID ${child.pid}`);

  setTimeout(async () => {
    try {
      const online = await waitForServerOnline(90000, 3000);

      if (online) {
        state.status = "ONLINE";
        state.lastAction = "start_confirmed_online";

        await sendServerStartedSummary(source);

        if (interactionReply && typeof interactionReply === "function") {
          interactionReply(
            "✅ Server is now online. A startup summary with loaded mods has been sent to Discord."
          );
        }
      } else {
        state.status = "ERROR";
        state.lastError = "Server startup confirmation timed out.";
        logger.warn("Server startup timed out before confirmation.");
      }
    } catch (error) {
      state.status = "ERROR";
      state.lastError = error.message;
      logger.error(`Startup follow-up failed: ${error.message}`);
    }
  }, 1500);

  return {
    ok: true,
    message: "Server start requested. A confirmation message will be sent after the server finishes loading.",
    pid: child.pid
  };
}

module.exports = {
  startServer,
  sendServerStartedSummary,
  registerDiscordBotModule
};