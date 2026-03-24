const state = require("../state");
const { stopServer } = require("./stop");
const { startServer } = require("./start");

async function restartServer(source = "unknown") {
  const stop = await stopServer();

  await new Promise((resolve) => setTimeout(resolve, 2500));

  const start = await startServer(source);

  state.lastAction = "restart_completed";

  return {
    ok: true,
    message: `Restart completed. Stop: ${stop.message} | Start: ${start.message}`
  };
}

module.exports = {
  restartServer
};