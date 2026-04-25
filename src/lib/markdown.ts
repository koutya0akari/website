import "server-only";

import { normalizeLineEndings, renderMarkdownToHtml } from "@/lib/markdown-renderer";

export { renderMarkdownToHtml };

function unwrapSingleParagraph(html: string): string {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p>([\s\S]*)<\/p>$/i);
  return match ? match[1] : trimmed;
}

export function normalizeRichTextToHtml(content: string): string {
  const normalized = normalizeLineEndings(content ?? "");
  if (!normalized.trim()) return "";
  return renderMarkdownToHtml(normalized);
}

export function normalizeRichTextToInlineHtml(content: string): string {
  return unwrapSingleParagraph(normalizeRichTextToHtml(content));
}
