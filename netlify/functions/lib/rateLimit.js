const { rateStore } = require("./blobs");

const MAX_PER_HOUR = parseInt(process.env.IG_MAX_MESSAGES_PER_HOUR || "80", 10);

function hourBucket() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}`;
}

// Returns true if sending is allowed (and increments the counter).
async function allowSend() {
  const store = rateStore();
  const key = `hour:${hourBucket()}`;
  const current = (await store.get(key, { type: "json" })) || { count: 0 };
  if (current.count >= MAX_PER_HOUR) return false;
  await store.setJSON(key, { count: current.count + 1 });
  return true;
}

module.exports = { allowSend };
