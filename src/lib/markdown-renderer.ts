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

// rehype-sanitize は生 HTML の id を `user-content-` で接頭辞化（clobber）する。
// これは DOM clobbering 対策だが、数学ノートの相互参照アンカー
// （`ref-`=文献 / `prop-`=命題 / `dfn-`=定義 / `thm-`=定理 / `rem-`=注意 …）
// まで壊してしまい、`[命題 2.15](#prop-...)` のようなページ内リンクが解決しなくなる。
//
// そこで「ハイフンで名前空間化された id」（接頭辞 + `-` + ラベル）だけを元へ復元する。
// `location` のような単語 1 つの id は復元せず clobber されたままにすることで、
// グローバルとの衝突に対する保護は維持する。
const fragmentAnchorIdPattern = /^[a-z][a-z0-9]*-[A-Za-z0-9][A-Za-z0-9_.:-]*$/;

function isElement(node: RehypeNode): node is RehypeNode & { properties: NonNullable<RehypeNode["properties"]> } {
  return node.type === "element";
}

function restoreFragmentAnchorIds() {
  return (tree: RehypeNode) => {
    const visit = (node: RehypeNode) => {
      if (isElement(node)) {
        const id = node.properties.id;
        if (typeof id === "string" && id.startsWith(sanitizerClobberPrefix)) {
          const restoredId = id.slice(sanitizerClobberPrefix.length);
          if (fragmentAnchorIdPattern.test(restoredId)) {
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
  .use(restoreFragmentAnchorIds)
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
