import "server-only";

import type { DiaryEntry } from "@/lib/types";
import { getSortCandidateLimit, sortByPublishedDesc } from "@/lib/diary-order";
import { normalizeRichTextToHtml } from "@/lib/markdown";
import { MEMO_FOLDER } from "@/lib/monthly-diary-config";
import { createPublicClient } from "@/lib/supabase/server";
import { createExcerpt, escapeHtml, markdownToPlainText } from "@/lib/utils";

type SupabaseMemoRow = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  summary: string | null;
  folder: string | null;
  tags: string[] | null;
  status: "draft" | "published";
  hero_image_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeMemo(row: SupabaseMemoRow): DiaryEntry {
  const bodyHtml = normalizeRichTextToHtml(row.body || "");
  const summaryHtml = normalizeRichTextToHtml(row.summary || "");
  const fallbackSummaryHtml = `<p>${escapeHtml(createExcerpt(bodyHtml))}</p>`;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: summaryHtml || fallbackSummaryHtml,
    body: bodyHtml,
    folder: MEMO_FOLDER,
    tags: row.tags || [],
    heroImage: row.hero_image_url
      ? {
          url: row.hero_image_url,
        }
      : undefined,
    publishedAt: row.published_at || row.created_at,
    updatedAt: row.updated_at,
    viewCount: row.view_count > 0 ? row.view_count : undefined,
  };
}

// 一覧向けの軽量版（重い Markdown→HTML 変換を避ける）。詳細表示は normalizeMemo を使う。
function normalizeMemoListItem(row: SupabaseMemoRow): DiaryEntry {
  const plainBody = markdownToPlainText(row.body || "");
  const summaryHtml = normalizeRichTextToHtml(row.summary || "");
  const fallbackSummaryHtml = `<p>${escapeHtml(createExcerpt(plainBody))}</p>`;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: summaryHtml || fallbackSummaryHtml,
    body: plainBody,
    folder: MEMO_FOLDER,
    tags: row.tags || [],
    heroImage: row.hero_image_url
      ? {
          url: row.hero_image_url,
        }
      : undefined,
    publishedAt: row.published_at || row.created_at,
    updatedAt: row.updated_at,
    viewCount: row.view_count > 0 ? row.view_count : undefined,
  };
}

export async function getMemoEntries(limit = 50): Promise<DiaryEntry[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("status", "published")
    .eq("folder", MEMO_FOLDER)
    .order("created_at", { ascending: false })
    .limit(getSortCandidateLimit(limit));

  if (error) {
    console.error("[Supabase] Failed to fetch memo entries:", error);
    return [];
  }

  return sortByPublishedDesc((data || []).map(normalizeMemoListItem)).slice(0, limit);
}

export async function getMemoBySlug(slug: string): Promise<DiaryEntry | undefined> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("folder", MEMO_FOLDER)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch memo by slug:", error);
    return undefined;
  }

  if (!data) {
    return undefined;
  }

  return normalizeMemo(data);
}
