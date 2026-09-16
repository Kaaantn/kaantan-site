import { createAdminClient } from "@/lib/supabase/admin";
import * as meta from "@/lib/meta";
import type { IgConfigs, IgPostConfig, IgCommentState } from "./types";

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function rowToPost(row: {
  id: string;
  media_id: string | null;
  post_link: string;
  trigger_words: string[];
  link: string;
  message_override: string;
  active: boolean;
}): IgPostConfig {
  return {
    id: row.id,
    mediaId: row.media_id,
    postLink: row.post_link,
    triggerWords: row.trigger_words || [],
    link: row.link,
    messageOverride: row.message_override,
    active: row.active,
  };
}

// Aggregate read matching the old Blobs "configs" blob shape — lets
// findConfigForComment/backfill logic stay identical to the original.
export async function getConfigs(): Promise<IgConfigs> {
  const supabase = createAdminClient();
  const [{ data: settings }, { data: posts }] = await Promise.all([
    supabase.from("ig_settings").select("fallback_word, public_reply_enabled").eq("id", 1).maybeSingle(),
    supabase.from("ig_post_configs").select("*").order("created_at", { ascending: true }),
  ]);

  return {
    fallbackWord: settings?.fallback_word || "",
    publicReplyEnabled: settings?.public_reply_enabled ?? true,
    posts: (posts || []).map(rowToPost),
  };
}

export async function saveSettings(patch: { fallbackWord?: string; publicReplyEnabled?: boolean }) {
  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (patch.fallbackWord !== undefined) update.fallback_word = patch.fallbackWord;
  if (patch.publicReplyEnabled !== undefined) update.public_reply_enabled = patch.publicReplyEnabled;
  await supabase.from("ig_settings").update(update).eq("id", 1);
}

interface UpsertPostInput {
  id?: string;
  postLink?: string;
  triggerWords?: string[];
  link?: string;
  messageOverride?: string;
  active?: boolean;
  mediaId?: string;
}

// Mirrors panel-configs.js's POST body.post handling: on update, re-resolves
// mediaId whenever postLink changed or it's still missing; on create,
// resolves it up front if a postLink was given.
export async function upsertPost(input: UpsertPostInput): Promise<IgPostConfig> {
  const supabase = createAdminClient();

  if (input.id) {
    const { data: existing, error } = await supabase
      .from("ig_post_configs")
      .select("*")
      .eq("id", input.id)
      .single();
    if (error || !existing) throw Object.assign(new Error("Bulunamadı"), { statusCode: 404 });

    const merged = { ...rowToPost(existing), ...input, id: input.id };
    if (merged.postLink && (merged.postLink !== existing.post_link || !merged.mediaId)) {
      const resolved = await meta.findMediaIdByPermalink(merged.postLink);
      if (resolved) merged.mediaId = resolved;
    }

    const { data: updated, error: updateError } = await supabase
      .from("ig_post_configs")
      .update({
        media_id: merged.mediaId,
        post_link: merged.postLink,
        trigger_words: merged.triggerWords,
        link: merged.link,
        message_override: merged.messageOverride,
        active: merged.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select()
      .single();
    if (updateError) throw updateError;
    return rowToPost(updated);
  }

  let mediaId = input.mediaId || "";
  if (!mediaId && input.postLink) {
    mediaId = (await meta.findMediaIdByPermalink(input.postLink)) || "";
  }

  const { data: created, error } = await supabase
    .from("ig_post_configs")
    .insert({
      id: newId(),
      media_id: mediaId || null,
      post_link: input.postLink || "",
      trigger_words: input.triggerWords || [],
      link: input.link || "",
      message_override: input.messageOverride || "",
      active: input.active !== false,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPost(created);
}

export async function deletePost(id: string) {
  const supabase = createAdminClient();
  await supabase.from("ig_post_configs").delete().eq("id", id);
}

// Posts saved before mediaId resolution existed (or where resolution failed
// at save time) sit with mediaId null — which breaks per-post trigger-word
// scoping. Heal them opportunistically whenever configs are loaded, in one
// shared pagination pass rather than re-scanning per post.
export async function backfillMediaIds(configs: IgConfigs): Promise<boolean> {
  const missing = configs.posts.filter((p) => !p.mediaId && p.postLink);
  if (!missing.length) return false;

  let resolved: Record<string, string | null>;
  try {
    resolved = await meta.findMediaIdsByPermalinks(missing.map((p) => p.postLink));
  } catch (e) {
    console.error("mediaId backfill failed", e);
    return false;
  }

  const supabase = createAdminClient();
  let changed = false;
  for (const p of missing) {
    const id = resolved[p.postLink];
    if (id) {
      p.mediaId = id;
      changed = true;
      await supabase.from("ig_post_configs").update({ media_id: id }).eq("id", p.id);
    }
  }
  return changed;
}

function rowToState(row: {
  comment_id: string;
  status: string | null;
  dm_failed: boolean;
  username: string | null;
  media_id: string | null;
  config_id: string | null;
  igsid: string | null;
  clicked_get_link: boolean;
  was_following_initially: boolean | null;
  became_follower: boolean;
  link_clicked_at: string | null;
  last_checked_at: string | null;
}): IgCommentState {
  return {
    commentId: row.comment_id,
    status: row.status,
    dmFailed: row.dm_failed,
    username: row.username,
    mediaId: row.media_id,
    configId: row.config_id,
    igsid: row.igsid,
    clickedGetLink: row.clicked_get_link,
    wasFollowingInitially: row.was_following_initially,
    becameFollower: row.became_follower,
    linkClickedAt: row.link_clicked_at,
    lastCheckedAt: row.last_checked_at,
  };
}

export async function getState(commentId: string): Promise<IgCommentState | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("ig_comment_state").select("*").eq("comment_id", commentId).maybeSingle();
  return data ? rowToState(data) : null;
}

export async function setState(commentId: string, patch: Partial<IgCommentState>) {
  const supabase = createAdminClient();
  await supabase.from("ig_comment_state").upsert({
    comment_id: commentId,
    status: patch.status,
    dm_failed: patch.dmFailed,
    username: patch.username,
    media_id: patch.mediaId,
    config_id: patch.configId,
    igsid: patch.igsid,
    clicked_get_link: patch.clickedGetLink,
    was_following_initially: patch.wasFollowingInitially,
    became_follower: patch.becameFollower,
    link_clicked_at: patch.linkClickedAt,
    last_checked_at: new Date().toISOString(),
  });
}

// Capped since there's no server-side filtering beyond a limit — fine at
// this project's volume (matches the old listStates() Blobs behavior).
export async function listStates(limit = 500): Promise<IgCommentState[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ig_comment_state")
    .select("*")
    .order("last_checked_at", { ascending: false })
    .limit(limit);
  return (data || []).map(rowToState);
}
