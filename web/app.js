const els = {
  refreshBtn: document.getElementById("refreshBtn"),

  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  restartBtn: document.getElementById("restartBtn"),

  shutdownBtn: document.getElementById("shutdownBtn"),
  abortShutdownBtn: document.getElementById("abortShutdownBtn"),

  uploadBtn: document.getElementById("uploadBtn"),
  modFileInput: document.getElementById("modFileInput"),

  serverStatusBadge: document.getElementById("serverStatusBadge"),

  controllerRam: document.getElementById("controllerRam"),
  controllerUptime: document.getElementById("controllerUptime"),
  serverRam: document.getElementById("serverRam"),
  trackedPid: document.getElementById("trackedPid"),

  cpuLoad: document.getElementById("cpuLoad"),
  hostname: document.getElementById("hostname"),
  systemRamUsed: document.getElementById("systemRamUsed"),
  systemRamFree: document.getElementById("systemRamFree"),
  systemRamTotal: document.getElementById("systemRamTotal"),

  diskList: document.getElementById("diskList"),

  lastAction: document.getElementById("lastAction"),
  lastError: document.getElementById("lastError"),
  lastStartTime: document.getElementById("lastStartTime"),
  lastStopTime: document.getElementById("lastStopTime"),
  refreshInterval: document.getElementById("refreshInterval"),

  activeMods: document.getElementById("activeMods"),
  removedMods: document.getElementById("removedMods"),
  actionsLog: document.getElementById("actionsLog"),

  toast: document.getElementById("toast")
};

let refreshTimer = null;

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden", "toast-error", "toast-success");
  els.toast.classList.add(isError ? "toast-error" : "toast-success");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.classList.add("hidden");
  }, 3500);
}

function formatDateTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function formatUptimeMinutes(minutes) {
  if (typeof minutes !== "number") return "--";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs <= 0) return `${mins} min`;
  return `${hrs}h ${mins}m`;
}

async function apiGet(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

async function apiPost(url, body = null, isFormData = false) {
  const options = {
    method: "POST"
  };

  if (body) {
    if (isFormData) {
      options.body = body;
    } else {
      options.headers = {
        "Content-Type": "application/json"
      };
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

function renderStatusBadge(status) {
  const value = String(status || "OFFLINE").toUpperCase();

  els.serverStatusBadge.textContent = value;
  els.serverStatusBadge.classList.remove(
    "status-online",
    "status-offline",
    "status-starting",
    "status-error"
  );

  if (value === "ONLINE") {
    els.serverStatusBadge.classList.add("status-online");
    return;
  }

  if (value === "STARTING") {
    els.serverStatusBadge.classList.add("status-starting");
    return;
  }

  if (value === "ERROR") {
    els.serverStatusBadge.classList.add("status-error");
    return;
  }

  els.serverStatusBadge.classList.add("status-offline");
}

function renderDiskList(disks) {
  if (!Array.isArray(disks) || !disks.length) {
    els.diskList.innerHTML = `<div class="muted">No disk information available.</div>`;
    return;
  }

  els.diskList.innerHTML = disks
    .map(
      (disk) => `
        <div class="disk-item">
          <div class="disk-drive">${disk.drive}</div>
          <div class="disk-meta">
            <span>Total: ${disk.total}</span>
            <span>Used: ${disk.used}</span>
            <span>Free: ${disk.free}</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderMods(container, mods, type) {
  if (!Array.isArray(mods) || !mods.length) {
    container.innerHTML = `<div class="muted">No mods found.</div>`;
    return;
  }

  container.innerHTML = mods
    .map((mod) => {
      if (type === "active") {
        return `
          <div class="mod-item">
            <span>${mod}</span>
            <button class="btn btn-small btn-danger" onclick="uninstallMod('${mod}')">Uninstall</button>
          </div>
        `;
      }

      return `
        <div class="mod-item">
          <span>${mod}</span>
          <div class="mod-actions">
            <button class="btn btn-small btn-success" onclick="restoreMod('${mod}')">Restore</button>
            <button class="btn btn-small btn-danger" onclick="deleteMod('${mod}')">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderActions(actions) {
  if (!Array.isArray(actions) || !actions.length) {
    els.actionsLog.innerHTML = `<div class="muted">No actions logged yet.</div>`;
    return;
  }

  els.actionsLog.innerHTML = actions
    .map((line) => `<div class="log-line">${escapeHtml(line)}</div>`)
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function loadOverview() {
  const data = await apiGet("/api/overview");

  els.controllerRam.textContent = data.controller?.ram || "--";
  els.controllerUptime.textContent = formatUptimeMinutes(data.controller?.uptimeMinutes);
  els.serverRam.textContent = data.server?.ram || "--";
  els.trackedPid.textContent = data.server?.trackedPid ?? "--";

  renderStatusBadge(data.server?.status);

  els.cpuLoad.textContent = data.system?.cpuLoad || "--";
  els.hostname.textContent = data.system?.hostname || "--";
  els.systemRamUsed.textContent = data.system?.ram?.used || "--";
  els.systemRamFree.textContent = data.system?.ram?.free || "--";
  els.systemRamTotal.textContent = data.system?.ram?.total || "--";

  renderDiskList(data.system?.disk || []);

  els.lastAction.textContent = data.meta?.lastAction || "--";
  els.lastError.textContent = data.meta?.lastError || "--";
  els.lastStartTime.textContent = formatDateTime(data.server?.lastStartTime);
  els.lastStopTime.textContent = formatDateTime(data.server?.lastStopTime);
  els.refreshInterval.textContent = `${data.meta?.statusRefreshMs || 0} ms`;
}

async function loadMods() {
  const data = await apiGet("/api/mods");
  renderMods(els.activeMods, data.active || [], "active");
  renderMods(els.removedMods, data.removed || [], "removed");
}

async function loadActions() {
  const data = await apiGet("/api/actions");
  renderActions(data.actions || []);
}

async function refreshAll() {
  try {
    await Promise.all([loadOverview(), loadMods(), loadActions()]);
  } catch (error) {
    console.error(error);
    showToast(error.message, true);
  }
}

async function handleServerAction(url, successMessage) {
  try {
    const result = await apiPost(url);
    showToast(result.message || successMessage);
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleUpload() {
  const file = els.modFileInput.files?.[0];

  if (!file) {
    showToast("Please select a mod file first.", true);
    return;
  }

  const formData = new FormData();
  formData.append("modFile", file);

  try {
    const result = await apiPost("/upload", formData, true);
    showToast(`Uploaded: ${result.modName || "mod"}`);
    els.modFileInput.value = "";
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function uninstallMod(modName) {
  try {
    const result = await apiPost("/api/mods/uninstall", { modName });
    showToast(result.moved ? `Uninstalled ${modName}` : `Removed ${modName} from config`);
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function restoreMod(modName) {
  try {
    const result = await apiPost("/api/mods/restore", { modName });
    showToast(result.message || `Restored ${modName}`);
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteMod(modName) {
  const confirmed = window.confirm(`Delete ${modName} permanently?`);
  if (!confirmed) return;

  try {
    const result = await apiPost("/api/mods/delete-permanent", { modName });
    showToast(result.message || `Deleted ${modName}`);
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

function bindEvents() {
  els.refreshBtn.addEventListener("click", refreshAll);

  els.startBtn.addEventListener("click", () =>
    handleServerAction("/api/server/start", "Server start requested.")
  );

  els.stopBtn.addEventListener("click", () =>
    handleServerAction("/api/server/stop", "Server stopped.")
  );

  els.restartBtn.addEventListener("click", () =>
    handleServerAction("/api/server/restart", "Server restarted.")
  );

  els.shutdownBtn.addEventListener("click", () =>
    handleServerAction("/api/system/shutdown", "Shutdown scheduled.")
  );

  els.abortShutdownBtn.addEventListener("click", () =>
    handleServerAction("/api/system/abort-shutdown", "Shutdown aborted.")
  );

  els.uploadBtn.addEventListener("click", handleUpload);
}

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshAll, 4000);
}

window.uninstallMod = uninstallMod;
window.restoreMod = restoreMod;
window.deleteMod = deleteMod;

bindEvents();
refreshAll();
startAutoRefresh();