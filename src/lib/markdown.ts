import "server-only";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypeStringify);

export function renderMarkdownToHtml(markdown: string): string {
  return String(markdownProcessor.processSync(markdown));
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

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
