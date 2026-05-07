import "server-only";

import type { DiaryEntry } from "@/lib/types";
import { getSortCandidateLimit, sortByPopularityDesc, sortByPublishedDesc } from "@/lib/diary-order";
import { normalizeRichTextToHtml } from "@/lib/markdown";
import { RESERVED_DIARY_FOLDER_EXCLUSION_FILTER } from "@/lib/monthly-diary-config";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { createExcerpt, escapeHtml } from "@/lib/utils";

const MATH_DIARY_FOLDER = "Math Diary";

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
    .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
    .order("created_at", { ascending: false })
    .limit(getSortCandidateLimit(limit));

  if (error) {
    console.error("[Supabase] Failed to fetch diary entries:", error);
    return [];
  }

  return sortByPublishedDesc((data || []).map(normalizeDiary)).slice(0, limit);
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
    .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
    .order("view_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(getSortCandidateLimit(limit));

  if (excludeSlug) {
    query = query.neq("slug", excludeSlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase] Failed to fetch popular diary entries:", error);
    return [];
  }

  return sortByPopularityDesc((data || []).map(normalizeDiary)).slice(0, limit);
}

export async function getDiaryBySlug(slug: string): Promise<DiaryEntry | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
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
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc("increment_diary_view", {
    p_slug: slug,
  });

  if (error) {
    console.error("[Supabase] Failed to increment diary view:", error);
    return undefined;
  }

  return typeof data === "number" && Number.isFinite(data) ? data : undefined;
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
    .select("title, slug, published_at, created_at, tags, folder")
    .eq("status", "published")
    .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch activity by year:", error);
    return [];
  }

  // Math Diary のエントリを除外
  const filteredData = (data || []).filter(
    (row) => row.folder !== MATH_DIARY_FOLDER
  );

  // 年別にグループ化
  const yearMap = new Map<string, { title: string; slug: string; date: string }[]>();

  for (const row of filteredData) {
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
