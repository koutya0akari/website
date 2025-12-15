import "server-only";

import type { DiaryEntry } from "@/lib/types";
import { normalizeRichTextToHtml } from "@/lib/markdown";
import { createClient } from "@/lib/supabase/server";
import { createExcerpt, escapeHtml } from "@/lib/utils";

const WEEKLY_DIARY_FOLDER = "Weekly Diary";

type SupabaseWeeklyDiaryRow = {
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

function normalizeWeeklyDiary(row: SupabaseWeeklyDiaryRow): DiaryEntry {
  const bodyHtml = normalizeRichTextToHtml(row.body || "");
  const summaryHtml = normalizeRichTextToHtml(row.summary || "");
  const fallbackSummaryHtml = `<p>${escapeHtml(createExcerpt(bodyHtml))}</p>`;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: summaryHtml || fallbackSummaryHtml,
    body: bodyHtml,
    folder: WEEKLY_DIARY_FOLDER,
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

export async function getWeeklyDiaryEntries(limit = 50): Promise<DiaryEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("status", "published")
    .eq("folder", WEEKLY_DIARY_FOLDER)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Supabase] Failed to fetch weekly diary entries:", error);
    return [];
  }

  return (data || []).map(normalizeWeeklyDiary);
}

export async function getWeeklyDiaryBySlug(slug: string): Promise<DiaryEntry | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("folder", WEEKLY_DIARY_FOLDER)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch weekly diary by slug:", error);
    return undefined;
  }

  if (!data) {
    return undefined;
  }

  return normalizeWeeklyDiary(data as SupabaseWeeklyDiaryRow);
}
