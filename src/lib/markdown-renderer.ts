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

type RehypeNode = {
  type: string;
  properties?: {
    id?: unknown;
  };
  children?: RehypeNode[];
};

const sanitizerClobberPrefix = articleSanitizeSchema.clobberPrefix ?? "user-content-";
const referenceIdPattern = /^ref-[A-Za-z0-9][A-Za-z0-9_.:-]*$/;

function isElement(node: RehypeNode): node is RehypeNode & { properties: NonNullable<RehypeNode["properties"]> } {
  return node.type === "element";
}

function restoreReferenceAnchorIds() {
  return (tree: RehypeNode) => {
    const visit = (node: RehypeNode) => {
      if (isElement(node)) {
        const id = node.properties.id;
        if (typeof id === "string" && id.startsWith(sanitizerClobberPrefix)) {
          const restoredId = id.slice(sanitizerClobberPrefix.length);
          if (referenceIdPattern.test(restoredId)) {
            node.properties.id = restoredId;
          }
        }
      }

      if (node.children) {
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
