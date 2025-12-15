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

function looksLikeHtml(value: string): boolean {
  // Rough detection to avoid treating already-rendered HTML as Markdown.
  // Examples: <p>, <div>, <h1>, <img ...>, <!-- ... -->
  return /<\/?[a-z][\s\S]*?>/i.test(value) || /<!--[\s\S]*?-->/.test(value);
}

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

function unwrapSingleParagraph(html: string): string {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p>([\s\S]*)<\/p>$/i);
  return match ? match[1] : trimmed;
}

export function normalizeRichTextToHtml(content: string): string {
  const trimmed = content?.trim?.() ?? "";
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return trimmed;
  return renderMarkdownToHtml(trimmed);
}

export function normalizeRichTextToInlineHtml(content: string): string {
  return unwrapSingleParagraph(normalizeRichTextToHtml(content));
}
