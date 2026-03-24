const os = require("os");

function formatBytesMb(num) {
  return `${(num / 1024 / 1024).toFixed(1)} MB`;
}

function getControllerRam() {
  return formatBytesMb(process.memoryUsage().rss);
}

function getSystemRam() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    total: formatBytesMb(total),
    used: formatBytesMb(used),
    free: formatBytesMb(free)
  };
}

module.exports = {
  formatBytesMb,
  getControllerRam,
  getSystemRam
};