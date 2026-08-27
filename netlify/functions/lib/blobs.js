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

module.exports = {
  configStore,
  stateStore,
  rateStore,
  getConfigs,
  saveConfigs,
  getState,
  setState,
};
