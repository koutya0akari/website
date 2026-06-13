import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

import { preprocessRichBlocks } from "@/lib/markdown-blocks";
import { articleSanitizeSchema } from "@/lib/sanitize-schema";

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // Sanitize raw/author HTML before trusted transforms add their own markup.
  .use(rehypeSanitize, articleSanitizeSchema)
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypeStringify);

export function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

export function renderMarkdownToHtml(markdown: string): string {
  const preprocessed = preprocessRichBlocks(normalizeLineEndings(markdown));
  return String(markdownProcessor.processSync(preprocessed));
}
