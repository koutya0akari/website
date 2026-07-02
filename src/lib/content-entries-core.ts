import { getPublicTags, isLinkOnlyContent } from "@/lib/content-visibility";
import { normalizeLineEndings, renderMarkdownToHtml } from "@/lib/markdown-renderer";
import type { DiaryEntry } from "@/lib/types";
import { createExcerpt, escapeHtml, markdownToPlainText } from "@/lib/utils";

// diary / memo / monthly-diary の Supabase 行 → DiaryEntry 正規化の共通実装。
// 3 モジュールにコピペされていたものを一本化した。フォルダの解決方法だけが
// コンテンツ種別ごとに異なるため、resolveFolder として注入する。
// テスト可能に保つため "server-only" は付けない（Supabase へはアクセスしない）。

export type SupabaseContentRow = {
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

export type ResolveFolder = (row: SupabaseContentRow) => string | undefined;

// markdown.ts の normalizeRichTextToHtml と同等（あちらは server-only のためここで再構成）
function richTextToHtml(content: string): string {
  const normalized = normalizeLineEndings(content ?? "");
  if (!normalized.trim()) return "";
  return renderMarkdownToHtml(normalized);
}

function baseEntry(
  row: SupabaseContentRow,
  folder: string | undefined,
  body: string,
): DiaryEntry {
  const summaryHtml = richTextToHtml(row.summary || "");
  const fallbackSummaryHtml = `<p>${escapeHtml(createExcerpt(body))}</p>`;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: summaryHtml || fallbackSummaryHtml,
    body,
    folder,
    tags: getPublicTags(row.tags),
    linkOnly: isLinkOnlyContent(row.tags),
    shareImage: row.hero_image_url
      ? {
          url: row.hero_image_url,
        }
      : undefined,
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

export function normalizeContentEntry(
  row: SupabaseContentRow,
  resolveFolder: ResolveFolder,
): DiaryEntry {
  const bodyHtml = richTextToHtml(row.body || "");
  return baseEntry(row, resolveFolder(row), bodyHtml);
}

// 一覧向けの軽量版。body は検索/抜粋でしか使われず常に stripHtml されるため、
// 重い Markdown→HTML 変換を避けてプレーンテキストとして保持する。
export function normalizeContentEntryListItem(
  row: SupabaseContentRow,
  resolveFolder: ResolveFolder,
): DiaryEntry {
  const plainBody = markdownToPlainText(row.body || "");
  return baseEntry(row, resolveFolder(row), plainBody);
}
