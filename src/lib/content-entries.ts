import "server-only";

import {
  normalizeContentEntry,
  normalizeContentEntryListItem,
  type ResolveFolder,
  type SupabaseContentRow,
} from "@/lib/content-entries-core";
import { isLinkOnlyContent } from "@/lib/content-visibility";
import { getSortCandidateLimit, sortByPublishedDesc } from "@/lib/diary-order";
import { createPublicClient } from "@/lib/supabase/server";
import type { DiaryEntry } from "@/lib/types";

// 公開コンテンツ（published のみ）の取得処理を種別ごとの設定で生成する。
// diary / memo / monthly-diary の違いはフォルダの絞り込みと解決方法だけ。

function buildBaseQuery(supabase: ReturnType<typeof createPublicClient>) {
  return supabase.from("diary").select("*").eq("status", "published");
}

type PublicDiaryQuery = ReturnType<typeof buildBaseQuery>;

export type ContentEntriesConfig = {
  // エラーログの識別子（例: "diary"）
  label: string;
  // フォルダによる絞り込み（.or / .eq / .in など）
  applyScope: (query: PublicDiaryQuery) => PublicDiaryQuery;
  resolveFolder: ResolveFolder;
};

export function createContentEntriesModule(config: ContentEntriesConfig) {
  const { label, applyScope, resolveFolder } = config;

  async function getEntries(limit = 50): Promise<DiaryEntry[]> {
    const supabase = createPublicClient();

    const { data, error } = await applyScope(buildBaseQuery(supabase))
      .order("created_at", { ascending: false })
      .limit(getSortCandidateLimit(limit));

    if (error) {
      console.error(`[Supabase] Failed to fetch ${label} entries:`, error);
      return [];
    }

    return sortByPublishedDesc(
      ((data || []) as SupabaseContentRow[])
        .filter((entry) => !isLinkOnlyContent(entry.tags))
        .map((row) => normalizeContentEntryListItem(row, resolveFolder)),
    ).slice(0, limit);
  }

  async function getBySlug(slug: string): Promise<DiaryEntry | undefined> {
    const supabase = createPublicClient();

    const { data, error } = await applyScope(buildBaseQuery(supabase))
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`[Supabase] Failed to fetch ${label} by slug:`, error);
      return undefined;
    }

    if (!data) {
      return undefined;
    }

    return normalizeContentEntry(data as SupabaseContentRow, resolveFolder);
  }

  return { getEntries, getBySlug };
}
