import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/ig/repo";
import { allowSend } from "@/lib/rateLimit";
import * as meta from "@/lib/meta";
import type { IgConfigs, IgCommentState } from "@/lib/ig/types";

// Ported from netlify/functions/instagram-webhook.js.

const PROFILE_URL = process.env.IG_PROFILE_URL || "https://instagram.com/";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kaantan.com.tr";

// Deliberately non-committal about delivery — Meta's API returns HTTP 200
// even when the recipient's message-request settings silently block the
// DM, with no synchronous or webhook signal to tell us which happened.
const PUBLIC_REPLY_VARIANTS = [
  "DM'ini kontrol et 📩",
  "Mesaj kutunu kontrol etmeyi unutma 👀",
  "DM'ine bir bak 🤞",
  "Kutunu kontrol etmeyi unutma 📬",
  "DM'inden kontrol et 🙌",
];

const FAILURE_REPLY_VARIANTS = [
  "Mesajların kapalı maalesef, DM atamadım 😕",
  "Sana ulaşamadım, mesaj isteklerin kısıtlı olabilir 🙁",
  "DM gönderemedim, ayarların kapalı olabilir 😕",
];

function randomOf<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function trMatch(text: string, word: string): boolean {
  if (!text || !word) return false;
  return text.toLocaleLowerCase("tr").includes(word.toLocaleLowerCase("tr"));
}

function findConfigForComment(configs: IgConfigs, mediaId: string | null, commentText: string) {
  // A post's trigger words (or the fallback word used as its trigger word)
  // only ever apply to comments on that exact post — never to any other
  // configured post. Without a real mediaId match, a comment is simply not
  // for us; matching against every active post's words here previously
  // caused one post's trigger word to fire on completely different posts.
  if (!mediaId) return null;

  const cfg = configs.posts.find((p) => p.active !== false && p.mediaId && p.mediaId === mediaId);
  if (!cfg) return null;

  const words = cfg.triggerWords?.length ? cfg.triggerWords : configs.fallbackWord ? [configs.fallbackWord] : [];

  return words.some((w) => trMatch(commentText, w)) ? cfg : null;
}

interface CommentValue {
  id: string;
  media?: { id: string };
  text?: string;
  from?: { username?: string };
}

async function handleCommentEvent(value: CommentValue) {
  const commentId = value.id;
  const mediaId = value.media?.id || null;
  const text = value.text || "";
  const username = value.from?.username || null;
  if (!commentId) return;

  // Idempotency: never react to the same comment twice.
  const existing = await repo.getState(commentId);
  if (existing) return;

  const configs = await repo.getConfigs();
  const cfg = findConfigForComment(configs, mediaId, text);
  if (!cfg) return;

  if (!(await allowSend())) {
    console.warn("Rate limit reached, skipping comment", commentId);
    return;
  }

  const { ok } = await meta.sendPrivateReply(
    commentId,
    "Selam! 👋 Az sonra linki göndereceğim, aşağıya tıkla ✨",
    [meta.postbackButton("Linki gönder 🔗", `CHECK_FOLLOW_${commentId}`)]
  );

  if (configs.publicReplyEnabled !== false) {
    await meta.replyToComment(commentId, ok ? randomOf(PUBLIC_REPLY_VARIANTS) : randomOf(FAILURE_REPLY_VARIANTS));
  }

  await repo.setState(commentId, {
    status: ok ? "pending_follow" : "dm_failed",
    dmFailed: !ok,
    username,
    mediaId,
    configId: cfg.id,
    igsid: null,
  });
}

function trackingLink(commentId: string, cfg: { id: string }) {
  return `${SITE_URL}/api/public/link-click?c=${encodeURIComponent(commentId)}&p=${encodeURIComponent(cfg.id)}`;
}

async function sendLink(
  igsid: string,
  commentId: string,
  cfg: { id: string; mediaId: string | null; messageOverride: string },
  greeting: string,
  state: Partial<IgCommentState>
) {
  const message = cfg.messageOverride || greeting;
  await meta.sendMessage(igsid, message, [meta.webUrlButton("Linke git 🚀", trackingLink(commentId, cfg))]);
  await repo.setState(commentId, {
    ...state,
    status: "link_sent",
    mediaId: cfg.mediaId,
    configId: cfg.id,
    igsid,
  });
}

async function handleFollowCheck(commentId: string, igsid: string, isRecheck: boolean) {
  const state = await repo.getState(commentId);
  if (state?.status === "link_sent") return; // already handled, idempotent

  const configs = await repo.getConfigs();
  const cfg = configs.posts.find((p) => p.id === state?.configId);
  if (!cfg) return;

  if (!(await allowSend())) {
    console.warn("Rate limit reached, skipping follow check", commentId);
    return;
  }

  const following = await meta.isFollowingBusiness(igsid);

  const wasFollowingInitially = isRecheck ? state?.wasFollowingInitially ?? null : following;
  const becameFollower = Boolean(isRecheck && following && state?.wasFollowingInitially === false);

  const nextState: Partial<IgCommentState> = {
    ...state,
    clickedGetLink: !isRecheck ? true : state?.clickedGetLink,
    wasFollowingInitially,
    becameFollower: becameFollower || state?.becameFollower || false,
  };

  if (following) {
    const greeting = isRecheck
      ? "Teşekkürler! 🙏 İşte linkin:"
      : "Zaten takipteymişsin, harika! 🎉 Al bakalım:";
    await sendLink(igsid, commentId, cfg, greeting, nextState);
    return;
  }

  if (!isRecheck) {
    await meta.sendMessage(igsid, "Neredeyse tamam! 🙌 Önce profili takip et, sonra devam edelim 👇", [
      meta.webUrlButton("Profile git 👤", PROFILE_URL),
      meta.postbackButton("Takip ettim ✅", `RECHECK_FOLLOW_${commentId}`),
    ]);
  } else {
    await meta.sendMessage(
      igsid,
      "Henüz göremedim seni takipçilerimde 🤔 Birkaç saniye bekleyip tekrar dener misin?",
      [meta.postbackButton("Tekrar dene 🔄", `RECHECK_FOLLOW_${commentId}`)]
    );
  }

  await repo.setState(commentId, {
    ...nextState,
    status: "pending_follow",
    mediaId: cfg.mediaId,
    configId: cfg.id,
    igsid,
  });
}

interface MessagingEvent {
  sender?: { id?: string };
  postback?: { payload?: string };
}

async function handlePostback(messagingEvent: MessagingEvent) {
  const igsid = messagingEvent.sender?.id;
  const payload = messagingEvent.postback?.payload;
  if (!igsid || !payload) return;

  const checkMatch = payload.match(/^CHECK_FOLLOW_(.+)$/);
  const recheckMatch = payload.match(/^RECHECK_FOLLOW_(.+)$/);

  if (checkMatch) {
    await handleFollowCheck(checkMatch[1], igsid, false);
  } else if (recheckMatch) {
    await handleFollowCheck(recheckMatch[1], igsid, true);
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.IG_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Verification failed", { status: 403 });
}

interface WebhookEntry {
  changes?: { field: string; value: CommentValue }[];
  messaging?: MessagingEvent[];
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  if (!payload) return new NextResponse("Bad Request", { status: 400 });

  // Always ack quickly; Meta retries aggressively on non-200s.
  const entries: WebhookEntry[] = payload.entry || [];
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

  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
