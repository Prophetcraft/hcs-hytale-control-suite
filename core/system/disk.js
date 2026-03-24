const { execPromise } = require("../../utils/exec");

async function getDiskInfo() {
  try {
    const out = await execPromise("wmic logicaldisk get size,freespace,caption");
    const lines = out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const disks = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/).filter(Boolean);

      if (parts.length < 3) continue;

      const caption = parts[0];
      const free = Number(parts[1] || 0);
      const size = Number(parts[2] || 0);
      const used = size - free;

      disks.push({
        drive: caption,
        total: `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`,
        used: `${(used / 1024 / 1024 / 1024).toFixed(1)} GB`,
        free: `${(free / 1024 / 1024 / 1024).toFixed(1)} GB`
      });
    }

    return disks;
  } catch {
    return [];
  }
}

module.exports = {
  getDiskInfo
};