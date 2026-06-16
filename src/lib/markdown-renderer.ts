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
import type { Element, Root, RootContent } from "hast";

import { preprocessRichBlocks } from "@/lib/markdown-blocks";
import { articleSanitizeSchema } from "@/lib/sanitize-schema";

const sanitizerClobberPrefix = articleSanitizeSchema.clobberPrefix ?? "user-content-";
const referenceIdPattern = /^ref-[A-Za-z0-9][A-Za-z0-9_.:-]*$/;

function isElement(node: Root | RootContent): node is Element {
  return node.type === "element";
}

function restoreReferenceAnchorIds() {
  return (tree: Root) => {
    const visit = (node: Root | RootContent) => {
      if (isElement(node)) {
        const id = node.properties.id;
        if (typeof id === "string" && id.startsWith(sanitizerClobberPrefix)) {
          const restoredId = id.slice(sanitizerClobberPrefix.length);
          if (referenceIdPattern.test(restoredId)) {
            node.properties.id = restoredId;
          }
        }
      }

      if ("children" in node) {
        for (const child of node.children) {
          visit(child);
        }
      }
    };

    visit(tree);
  };
}

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // Sanitize raw/author HTML before trusted transforms add their own markup.
  .use(rehypeSanitize, articleSanitizeSchema)
  .use(restoreReferenceAnchorIds)
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
