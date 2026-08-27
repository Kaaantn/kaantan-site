const { getStore } = require("@netlify/blobs");

function configStore() {
  return getStore("ig-automation-configs");
}

function stateStore() {
  return getStore("ig-automation-state");
}

function rateStore() {
  return getStore("ig-automation-rate");
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
