const { getConfigs, listStates } = require("./lib/blobs");

function requireUser(context) {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

exports.handler = async function (event, context) {
  try {
    requireUser(context);
  } catch (e) {
    return { statusCode: e.statusCode || 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const headers = { "Content-Type": "application/json" };
  const [configs, states] = await Promise.all([getConfigs(), listStates()]);

  const byPost = {};
  for (const p of configs.posts || []) {
    byPost[p.id] = {
      id: p.id,
      label: p.postLink || p.mediaId || p.id,
      dmSent: 0,
      dmFailed: 0,
      clickedGetLink: 0,
      becameFollower: 0,
      linkClicked: 0,
    };
  }

  const totals = { dmSent: 0, dmFailed: 0, clickedGetLink: 0, becameFollower: 0, linkClicked: 0 };
  const rows = [];

  for (const s of states) {
    const bucket = byPost[s.configId];
    const dmOk = !s.dmFailed;

    if (dmOk) totals.dmSent++;
    else totals.dmFailed++;
    if (s.clickedGetLink) totals.clickedGetLink++;
    if (s.becameFollower) totals.becameFollower++;
    if (s.linkClickedAt) totals.linkClicked++;

    if (bucket) {
      if (dmOk) bucket.dmSent++;
      else bucket.dmFailed++;
      if (s.clickedGetLink) bucket.clickedGetLink++;
      if (s.becameFollower) bucket.becameFollower++;
      if (s.linkClickedAt) bucket.linkClicked++;
    }

    rows.push({
      username: s.username || null,
      commentId: s.commentId,
      dmFailed: Boolean(s.dmFailed),
      clickedGetLink: Boolean(s.clickedGetLink),
      becameFollower: Boolean(s.becameFollower),
      linkClicked: Boolean(s.linkClickedAt),
      lastCheckedAt: s.last_checked_at || null,
    });
  }

  rows.sort((a, b) => String(b.lastCheckedAt || "").localeCompare(String(a.lastCheckedAt || "")));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ totals, byPost: Object.values(byPost), rows: rows.slice(0, 200) }),
  };
};
