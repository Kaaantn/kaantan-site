const { getBioConfig, saveBioConfig } = require("./lib/blobs");

// Redirects a bio-page link/social click to its real destination while
// counting it — the destination always comes from the stored config (never
// from the query string) so this can't be turned into an open redirect.
exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const type = params.type; // "link" | "social"
  const id = params.id;

  const config = await getBioConfig();
  let dest = "https://kaantan.com.tr/";

  if (type === "social") {
    const s = (config.socialLinks || []).find((x) => x.platform === id);
    if (s) {
      dest = s.url;
      s.clicks = (s.clicks || 0) + 1;
      await saveBioConfig(config);
    }
  } else {
    const l = (config.links || []).find((x) => x.id === id);
    if (l) {
      dest = l.url;
      l.clicks = (l.clicks || 0) + 1;
      await saveBioConfig(config);
    }
  }

  return { statusCode: 302, headers: { Location: dest } };
};
