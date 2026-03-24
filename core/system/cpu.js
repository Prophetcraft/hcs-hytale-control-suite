const { execPromise } = require("../../utils/exec");

async function getCpuLoad() {
  try {
    const out = await execPromise("wmic cpu get loadpercentage /value");
    const raw = (out.split("=")[1] || "0").trim();
    return `${raw}%`;
  } catch {
    return "0%";
  }
}

module.exports = {
  getCpuLoad
};