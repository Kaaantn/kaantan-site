const GRAPH_VERSION = "v21.0";

exports.handler = async function () {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "IG_PAGE_ACCESS_TOKEN not set" }) };
  }

  const debugInfo = {
    length: token.length,
    prefix: token.slice(0, 8),
    suffix: token.slice(-6),
    hasWhitespace: /\s/.test(token),
    hasQuotes: /["']/.test(token),
    dotCount: (token.match(/\./g) || []).length,
  };

  const mediaUrl = `https://graph.instagram.com/${GRAPH_VERSION}/me/media?fields=id,media_type,media_product_type,permalink&limit=25&access_token=${token}`;
  const mediaRes = await fetch(mediaUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  const nonReel = (mediaRes.data || []).find((m) => m.media_product_type !== "REELS");

  let nonReelComment = null;
  let nonReelReplyTest = null;
  if (nonReel) {
    const commentsUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${nonReel.id}/comments?fields=id,text,timestamp&limit=1&access_token=${token}`;
    const commentsRes = await fetch(commentsUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));
    nonReelComment = commentsRes;
    const firstCommentId = commentsRes.data && commentsRes.data[0] && commentsRes.data[0].id;
    if (firstCommentId) {
      const replyUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${firstCommentId}/private_replies?access_token=${token}`;
      nonReelReplyTest = await fetch(replyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: { text: "Test" } }),
      }).then((r) => r.json()).catch((e) => ({ error: String(e) }));
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      {
        debugInfo,
        mediaTypeCounts: (mediaRes.data || []).reduce((acc, m) => {
          acc[m.media_product_type] = (acc[m.media_product_type] || 0) + 1;
          return acc;
        }, {}),
        nonReelFound: nonReel || null,
        nonReelComment,
        nonReelReplyTest,
      },
      null,
      2
    ),
  };
};
