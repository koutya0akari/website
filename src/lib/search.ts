import type { DiaryEntry } from "@/lib/types";
import { createExcerpt, stripHtml } from "@/lib/utils";

// 公開検索（コマンドパレット）用の純粋ロジック。
// Supabase へのアクセスは /api/search 側で行い、ここは配列の絞り込みだけを担う。

export type SearchHitType = "diary" | "memo" | "monthly-diary";

export type SearchHit = {
  id: string;
  title: string;
  description: string;
  href: string;
  type: SearchHitType;
};

const DESCRIPTION_LENGTH = 60;

export function filterAndRankEntries(
  query: string,
  entries: DiaryEntry[],
  type: SearchHitType,
  hrefPrefix: string,
  max = 5,
): SearchHit[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  // タイトル一致 > タグ一致 > 本文一致 の順で並べる
  const titleHits: DiaryEntry[] = [];
  const tagHits: DiaryEntry[] = [];
  const bodyHits: DiaryEntry[] = [];

  for (const entry of entries) {
    // 公開フェッチャーが除外済みだが、リンク限定公開の記事は検索にも出さない
    if (entry.linkOnly) continue;

    if (entry.title.toLowerCase().includes(normalized)) {
      titleHits.push(entry);
    } else if (entry.tags.some((tag) => tag.toLowerCase().includes(normalized))) {
      tagHits.push(entry);
    } else if (stripHtml(entry.body || "").toLowerCase().includes(normalized)) {
      bodyHits.push(entry);
    }
  }

  return [...titleHits, ...tagHits, ...bodyHits].slice(0, max).map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: createExcerpt(entry.summary, DESCRIPTION_LENGTH),
    href: `${hrefPrefix}/${entry.slug}`,
    type,
  }));
}
