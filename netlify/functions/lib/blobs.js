const { getStore } = require("@netlify/blobs");

// Automatic context injection for @netlify/blobs is unreliable for CommonJS
// functions bundled outside Netlify's own build pipeline (MissingBlobsEnvironmentError).
// Fall back to explicit siteID/token when provided. Site ID is not secret (it's
// the project's public API ID, same one shown in status badge URLs).
const SITE_ID = process.env.SITE_ID || "2a87c684-840b-4d92-b789-a1feec354fc2";

function storeOptions(name) {
  if (process.env.NETLIFY_BLOBS_TOKEN) {
    return { name, siteID: SITE_ID, token: process.env.NETLIFY_BLOBS_TOKEN };
  }
  return name;
}

function configStore() {
  return getStore(storeOptions("ig-automation-configs"));
}

function stateStore() {
  return getStore(storeOptions("ig-automation-state"));
}

function rateStore() {
  return getStore(storeOptions("ig-automation-rate"));
}

const CONFIGS_KEY = "configs";

async function getConfigs() {
  const data = await configStore().get(CONFIGS_KEY, { type: "json" });
  return data || { fallbackWord: "", posts: [] };
}

async function saveConfigs(configs) {
  await configStore().setJSON(CONFIGS_KEY, configs);
}

async function getState(commentId) {
  return stateStore().get(`state:${commentId}`, { type: "json" });
}

async function setState(commentId, state) {
  await stateStore().setJSON(`state:${commentId}`, {
    ...state,
    last_checked_at: new Date().toISOString(),
  });
}

// Lists comment states for the panel's analytics view. Capped since Blobs
// listing has no server-side filtering — fine at this project's volume.
async function listStates(limit = 500) {
  const store = stateStore();
  const { blobs } = await store.list({ prefix: "state:" });
  const keys = blobs.slice(-limit).map((b) => b.key);
  const items = await Promise.all(
    keys.map(async (key) => {
      const data = await store.get(key, { type: "json" });
      return data ? { commentId: key.slice("state:".length), ...data } : null;
    })
  );
  return items.filter(Boolean);
}

module.exports = {
  configStore,
  stateStore,
  rateStore,
  getConfigs,
  saveConfigs,
  getState,
  setState,
  listStates,
};
