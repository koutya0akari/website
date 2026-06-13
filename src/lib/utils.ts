import { clsx } from "clsx";
import { format } from "date-fns";

export function cn(...inputs: Array<string | undefined | false | null>) {
  return clsx(inputs);
}

export function formatDate(date: string, dateFormat = "yyyy.MM.dd") {
  try {
    return format(new Date(date), dateFormat);
  } catch {
    return date;
  }
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

export function createExcerpt(value: string, maxLength = 160) {
  const plain = stripHtml(value);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}…`;
}

// Markdown を素早くプレーンテキスト化する軽量版。
// 一覧/検索用途で、重い renderMarkdownToHtml（KaTeX/sanitize 等）を避けるために使う。
// 完全な仕様準拠は狙わず、見出し・装飾・リンク等のノイズ除去に留める。
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // フェンスドコードブロック
    .replace(/`([^`]+)`/g, "$1") // インラインコード
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 画像
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // リンク → テキスト
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // 見出し
    .replace(/^\s{0,3}>\s?/gm, "") // 引用
    .replace(/^\s*[-*+]\s+/gm, "") // 箇条書き
    .replace(/^\s*\d+\.\s+/gm, "") // 番号付きリスト
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 太字
    .replace(/(\*|_)(.*?)\1/g, "$2") // 斜体
    .replace(/~~(.*?)~~/g, "$2") // 打ち消し
    .replace(/\|/g, " ") // テーブル区切り
    .replace(/\s+/g, " ") // 連続空白の圧縮
    .trim();
}

export function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}
