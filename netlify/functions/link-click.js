const { getConfigs, getState, setState } = require("./lib/blobs");

// Redirects to the configured post's link while recording a click for
// analytics. The destination always comes from server-side config lookup
// (never from the query string) to avoid this becoming an open redirect.
exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const commentId = params.c;
  const configId = params.p;

  const configs = await getConfigs();
  const cfg = (configs.posts || []).find((p) => p.id === configId);
  const dest = (cfg && cfg.link) || "https://instagram.com/";

  if (commentId) {
    const state = await getState(commentId);
    if (state && !state.linkClickedAt) {
      await setState(commentId, { ...state, linkClickedAt: new Date().toISOString() });
    }
  }

  return {
    statusCode: 302,
    headers: { Location: dest },
  };
};
