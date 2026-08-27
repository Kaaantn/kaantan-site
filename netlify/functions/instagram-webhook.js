const { getConfigs, getState, setState } = require("./lib/blobs");
const { allowSend } = require("./lib/rateLimit");
const meta = require("./lib/meta");

const PROFILE_URL = process.env.IG_PROFILE_URL || "https://instagram.com/";

function trMatch(text, word) {
  if (!text || !word) return false;
  return text.toLocaleLowerCase("tr").includes(word.toLocaleLowerCase("tr"));
}

function findConfigForComment(configs, mediaId, commentText) {
  const active = (configs.posts || []).filter((p) => p.active !== false);
  // Prefer a config that's explicitly tied to this media id.
  const forMedia = active.find((p) => p.mediaId === mediaId);
  const candidates = forMedia ? [forMedia] : active;

  for (const cfg of candidates) {
    const words = (cfg.triggerWords && cfg.triggerWords.length
      ? cfg.triggerWords
      : configs.fallbackWord
      ? [configs.fallbackWord]
      : []
    );
    if (words.some((w) => trMatch(commentText, w))) return cfg;
  }
  return null;
}

async function handleCommentEvent(value) {
  const commentId = value.id;
  const mediaId = value.media && value.media.id;
  const text = value.text || "";
  if (!commentId) return;

  // Idempotency: never react to the same comment twice.
  const existing = await getState(commentId);
  if (existing) return;

  const configs = await getConfigs();
  const cfg = findConfigForComment(configs, mediaId, text);
  if (!cfg) return;

  if (!(await allowSend())) {
    console.warn("Rate limit reached, skipping comment", commentId);
    return;
  }

  await meta.sendPrivateReply(commentId, "Selam, aşağıya tıkla, linki hemen atayım", [
    meta.postbackButton("Linki gönder", `CHECK_FOLLOW_${commentId}`),
  ]);

  await setState(commentId, {
    status: "pending_follow",
    mediaId: mediaId || null,
    configId: cfg.id,
    igsid: null,
  });
}

async function sendLink(igsid, commentId, cfg, greeting) {
  const message = (cfg && cfg.messageOverride) || greeting;
  await meta.sendMessage(igsid, message, [meta.webUrlButton("Linke git", cfg.link)]);
  await setState(commentId, {
    status: "link_sent",
    mediaId: cfg.mediaId || null,
    configId: cfg.id,
    igsid,
  });
}

async function handleFollowCheck(commentId, igsid, isRecheck) {
  const state = await getState(commentId);
  if (state && state.status === "link_sent") return; // already handled, idempotent

  const configs = await getConfigs();
  const cfg = (configs.posts || []).find((p) => p.id === (state && state.configId));
  if (!cfg) return;

  if (!(await allowSend())) {
    console.warn("Rate limit reached, skipping follow check", commentId);
    return;
  }

  const following = await meta.isFollowingBusiness(igsid);

  if (following) {
    const greeting = isRecheck ? "Teşekkürler, linkin burada:" : "Zaten takipteymişsin, al bakalım:";
    await sendLink(igsid, commentId, cfg, greeting);
    return;
  }

  if (!isRecheck) {
    await meta.sendMessage(igsid, "Önce profili takip et, sonra devam edelim", [
      meta.webUrlButton("Profile git", PROFILE_URL),
      meta.postbackButton("Takip ettim", `RECHECK_FOLLOW_${commentId}`),
    ]);
  } else {
    await meta.sendMessage(
      igsid,
      "Henüz sistemde görünmedi, birkaç saniye sonra tekrar dener misin?",
      [meta.postbackButton("Tekrar dene", `RECHECK_FOLLOW_${commentId}`)]
    );
  }

  await setState(commentId, {
    status: "pending_follow",
    mediaId: cfg.mediaId || null,
    configId: cfg.id,
    igsid,
  });
}

async function handlePostback(messagingEvent) {
  const igsid = messagingEvent.sender && messagingEvent.sender.id;
  const payload = messagingEvent.postback && messagingEvent.postback.payload;
  if (!igsid || !payload) return;

  const checkMatch = payload.match(/^CHECK_FOLLOW_(.+)$/);
  const recheckMatch = payload.match(/^RECHECK_FOLLOW_(.+)$/);

  if (checkMatch) {
    await handleFollowCheck(checkMatch[1], igsid, false);
  } else if (recheckMatch) {
    await handleFollowCheck(recheckMatch[1], igsid, true);
  }
}

exports.handler = async function (event) {
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    const mode = params["hub.mode"];
    const token = params["hub.verify_token"];
    const challenge = params["hub.challenge"];
    if (mode === "subscribe" && token && token === process.env.IG_VERIFY_TOKEN) {
      return { statusCode: 200, body: challenge };
    }
    return { statusCode: 403, body: "Verification failed" };
  }

  if (event.httpMethod === "POST") {
    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, body: "Bad Request" };
    }

    // Always ack quickly; Meta retries aggressively on non-200s.
    const entries = payload.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        if (change.field === "comments") {
          try {
            await handleCommentEvent(change.value);
          } catch (e) {
            console.error("comment handling failed", e);
          }
        }
      }
      for (const messagingEvent of entry.messaging || []) {
        if (messagingEvent.postback) {
          try {
            await handlePostback(messagingEvent);
          } catch (e) {
            console.error("postback handling failed", e);
          }
        }
      }
    }

    return { statusCode: 200, body: "EVENT_RECEIVED" };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
