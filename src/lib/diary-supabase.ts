import "server-only";

import { createContentEntriesModule } from "@/lib/content-entries";
import { normalizeContentEntryListItem, type SupabaseContentRow } from "@/lib/content-entries-core";
import { isLinkOnlyContent } from "@/lib/content-visibility";
import type { DiaryEntry } from "@/lib/types";
import { getSortCandidateLimit, sortByPopularityDesc } from "@/lib/diary-order";
import { RESERVED_DIARY_FOLDER_EXCLUSION_FILTER } from "@/lib/monthly-diary-config";
import { createAdminClient, createPublicClient } from "@/lib/supabase/server";

const MATH_DIARY_FOLDER = "Math Diary";

const resolveDiaryFolder = (row: SupabaseContentRow) => row.folder || undefined;

const diaryModule = createContentEntriesModule({
  label: "diary",
  applyScope: (query) => query.or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER),
  resolveFolder: resolveDiaryFolder,
});

export const getDiaryEntries = diaryModule.getEntries;
export const getDiaryBySlug = diaryModule.getBySlug;

export async function getPopularDiaryEntries(
  limit = 5,
  excludeSlug?: string,
): Promise<DiaryEntry[]> {
  const supabase = createPublicClient();

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

  return sortByPopularityDesc(
    ((data || []) as SupabaseContentRow[])
      .filter((entry) => !isLinkOnlyContent(entry.tags))
      .map((row) => normalizeContentEntryListItem(row, resolveDiaryFolder)),
  ).slice(0, limit);
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
  const supabase = createPublicClient();

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
    (row) => row.folder !== MATH_DIARY_FOLDER && !isLinkOnlyContent(row.tags),
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
