import "server-only";

import type { DiaryEntry } from "@/lib/types";
import { normalizeRichTextToHtml } from "@/lib/markdown";
import { createClient } from "@/lib/supabase/server";
import { createExcerpt, escapeHtml } from "@/lib/utils";

const WEEKLY_DIARY_FOLDER = "Weekly Diary";

type SupabaseDiaryRow = {
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

function normalizeDiary(row: SupabaseDiaryRow): DiaryEntry {
  const bodyHtml = normalizeRichTextToHtml(row.body || "");
  const summaryHtml = normalizeRichTextToHtml(row.summary || "");
  const fallbackSummaryHtml = `<p>${escapeHtml(createExcerpt(bodyHtml))}</p>`;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: summaryHtml || fallbackSummaryHtml,
    body: bodyHtml,
    folder: row.folder || undefined,
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

export async function getDiaryEntries(limit = 50): Promise<DiaryEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("status", "published")
    .or(`folder.is.null,folder.neq."${WEEKLY_DIARY_FOLDER}"`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Supabase] Failed to fetch diary entries:", error);
    return [];
  }

  return (data || []).map(normalizeDiary);
}

export async function getPopularDiaryEntries(
  limit = 5,
  excludeSlug?: string,
): Promise<DiaryEntry[]> {
  const supabase = await createClient();

  let query = supabase
    .from("diary")
    .select("*")
    .eq("status", "published")
    .or(`folder.is.null,folder.neq."${WEEKLY_DIARY_FOLDER}"`)
    .order("view_count", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (excludeSlug) {
    query = query.neq("slug", excludeSlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase] Failed to fetch popular diary entries:", error);
    return [];
  }

  return (data || []).map(normalizeDiary);
}

export async function getDiaryBySlug(slug: string): Promise<DiaryEntry | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`folder.is.null,folder.neq."${WEEKLY_DIARY_FOLDER}"`)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch diary by slug:", error);
    return undefined;
  }

  if (!data) {
    return undefined;
  }

  return normalizeDiary(data);
}

export async function incrementDiaryView(slug: string): Promise<number | undefined> {
  const supabase = await createClient();

  // First get the current diary entry
  const { data: diary, error: fetchError } = await supabase
    .from("diary")
    .select("id, view_count")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`folder.is.null,folder.neq."${WEEKLY_DIARY_FOLDER}"`)
    .maybeSingle();

  if (fetchError || !diary) {
    console.error("[Supabase] Failed to fetch diary for view increment:", fetchError);
    return undefined;
  }

  const nextCount = (diary.view_count || 0) + 1;

  const { error: updateError } = await supabase
    .from("diary")
    .update({ view_count: nextCount })
    .eq("id", diary.id);

  if (updateError) {
    console.error("[Supabase] Failed to increment view count:", updateError);
    return undefined;
  }

  return nextCount;
}

export const supabaseReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// 年別の活動を集計（Diary の投稿から自動生成）
export type ActivityYear = {
  year: string;
  items: { title: string; slug: string; date: string }[];
};

export async function getActivityByYear(): Promise<ActivityYear[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diary")
    .select("title, slug, published_at, created_at, tags")
    .eq("status", "published")
    .or(`folder.is.null,folder.neq."${WEEKLY_DIARY_FOLDER}"`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch activity by year:", error);
    return [];
  }

  // 年別にグループ化
  const yearMap = new Map<string, { title: string; slug: string; date: string }[]>();

  for (const row of data || []) {
    const dateStr = row.published_at || row.created_at;
    const year = new Date(dateStr).getFullYear().toString();
    const items = yearMap.get(year) || [];
    items.push({
      title: row.title,
      slug: row.slug,
      date: dateStr,
    });
    yearMap.set(year, items);
  }

  // 年を降順でソート
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => parseInt(b) - parseInt(a));

  return sortedYears.map((year) => ({
    year,
    items: yearMap.get(year) || [],
  }));
}
