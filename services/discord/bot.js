const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const CONFIG = require("../../utils/config");
const logger = require("../../utils/logger");
const state = require("../../core/state");

const {
  startServer,
  registerDiscordBotModule: registerStartDiscordModule
} = require("../../core/server/start");

const {
  stopServer,
  registerDiscordBotModule: registerStopDiscordModule
} = require("../../core/server/stop");
const { restartServer } = require("../../core/server/restart");
const {
  scheduleSystemShutdown,
  abortSystemShutdown,
  clearShutdownTimers
} = require("../../core/system/shutdown");

let clientInstance = null;

function isAuthorized(message) {
  if (
    !CONFIG.allowedDiscordUserIds ||
    !Array.isArray(CONFIG.allowedDiscordUserIds) ||
    !CONFIG.allowedDiscordUserIds.length
  ) {
    return true;
  }

  return CONFIG.allowedDiscordUserIds.includes(message.author.id);
}

function getTargetChannel() {
  try {
    return clientInstance?.channels?.cache?.get(CONFIG.targetChannelId) || null;
  } catch {
    return null;
  }
}

function bindDiscordModuleToServerCore() {
  const botBridge = {
    getTargetChannel,
    EmbedBuilder
  };

  registerStartDiscordModule(botBridge);
  registerStopDiscordModule(botBridge);
}

async function startDiscordBot() {
  if (clientInstance) {
    return clientInstance;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.on("messageCreate", async (message) => {
    console.log(
      `[DISCORD] message from ${message.author.tag} in #${message.channel.id}: ${message.content}`
    );

    if (message.author.bot) return;

    if (message.channel.id !== CONFIG.targetChannelId) {
      console.log(
        `[DISCORD] ignored channel. Expected: ${CONFIG.targetChannelId}, received: ${message.channel.id}`
      );
      return;
    }

    if (!isAuthorized(message)) {
      logger.discord(`Unauthorized user: ${message.author.id}`);
      return void message.reply("⛔ You are not authorized to use this command.");
    }

    const cmd = message.content.trim().toLowerCase();
    console.log(`[DISCORD] recognized command: ${cmd}`);

    try {
      if (cmd === "!start") {
        const result = await startServer("discord");
        return void message.reply(`🚀 ${result.message}`);
      }

      if (cmd === "!stop") {
  const result = await stopServer("discord");
        return void message.reply(`${result.ok ? "✅" : "⚠️"} ${result.message}`);
      }

      if (cmd === "!restart") {
        const result = await restartServer("discord");
        return void message.reply(`🔄 ${result.message}`);
      }

      if (cmd === "!webmod") {
        const embed = new EmbedBuilder()
          .setColor(0x00e5ff)
          .setTitle("🌐 HCS Dashboard")
          .setURL(CONFIG.dashboardPublicUrl)
          .setDescription(
            "Open the web dashboard for server status, resources, and mod management."
          );

        return void message.reply({ embeds: [embed] });
      }

      if (cmd === "!shut") {
        if (!CONFIG.allowShutdownCommands) {
          return void message.reply("⛔ Shutdown is disabled in the configuration.");
        }

        clearShutdownTimers();

        const minutes = Number(CONFIG.shutdownDelayMinutes || 30);
        const result = scheduleSystemShutdown(minutes);

        if (!result.ok) {
          return void message.reply(`⚠️ ${result.error}`);
        }

        await message.reply(`🖥️ Shutdown scheduled in ${minutes} minutes.`);
        logger.system(`Shutdown scheduled from Discord (${message.author.tag})`);

        if (minutes >= 15) {
          state.shutdownTimers.push(
            setTimeout(
              () => message.channel.send("⏳ 15 minutes remaining."),
              Math.max(0, (minutes - 15) * 60 * 1000)
            )
          );
        }

        if (minutes >= 5) {
          state.shutdownTimers.push(
            setTimeout(
              () => message.channel.send("⏳ 5 minutes remaining."),
              Math.max(0, (minutes - 5) * 60 * 1000)
            )
          );
        }

        if (minutes >= 1) {
          state.shutdownTimers.push(
            setTimeout(
              () => message.channel.send("⚠️ 1 minute remaining."),
              Math.max(0, (minutes - 1) * 60 * 1000)
            )
          );
        }

        return;
      }

      if (cmd === "!abort") {
        const result = abortSystemShutdown();
        logger.system(`Shutdown aborted from Discord (${message.author.tag})`);
        return void message.reply(`✅ ${result.message}`);
      }
    } catch (error) {
      state.lastError = error.message;
      logger.error(`Command ${cmd} failed: ${error.message}`);
      return void message.reply(`⚠️ Error: ${error.message}`);
    }
  });

  client.once("clientReady", () => {
    state.lastAction = "controller_ready";
    logger.boot(`Controller online as ${client.user.tag}`);
    console.log(`✅ ${CONFIG.controllerName} online as ${client.user.tag}`);
  });

  await client.login(CONFIG.token);

  clientInstance = client;
  bindDiscordModuleToServerCore();

  return clientInstance;
}

function getDiscordClient() {
  return clientInstance;
}

module.exports = {
  startDiscordBot,
  getDiscordClient,
  getTargetChannel,
  EmbedBuilder
};