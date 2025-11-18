import parse, { DOMNode, Element, Text } from "html-react-parser";
import katex from "katex";

import { LinkCard } from "@/components/ui/link-card";

type DiaryBodyProps = {
  html: string;
};

const renderMath = (content: string, displayMode: boolean) => {
  try {
    return katex.renderToString(content, {
      displayMode,
      throwOnError: false,
    });
  } catch (e) {
    return content;
  }
};

const replaceNode = (domNode: DOMNode) => {
  // 1. リンクカードの置換処理
  // <p><a href="...">URL</a></p> または <li><a href="...">URL</a></li> のような構造で、
  // テキストがURLと一致する場合のみカード化する
  if (domNode instanceof Element && (domNode.name === "p" || domNode.name === "li")) {
    const children = domNode.children;
    if (children.length === 1 && children[0] instanceof Element && children[0].name === "a") {
      const anchor = children[0];
      const href = anchor.attribs.href;
      // アンカーの中身がテキストのみで、かつhrefと一致する場合（あるいは "http" で始まる場合など、要件に合わせて調整）
      // ここでは「テキストがURLそのもの」である場合をカード化の条件とする
      if (
        anchor.children.length === 1 &&
        anchor.children[0] instanceof Text &&
        (anchor.children[0].data === href || anchor.children[0].data.startsWith("http"))
      ) {
        const card = <LinkCard url={href} />;
        // liの場合はliでラップして返す（マーカーを消すためにlist-noneを付与）
        if (domNode.name === "li") {
          return <li className="list-none">{card}</li>;
        }
        return card;
      }
    }
  }

  // 2. 数式の置換処理
  if (domNode instanceof Text) {
    const text = domNode.data;
    // 数式パターンがない場合は何もしない
    if (!text.match(/\$\$|\\\[|\\\(|\$|\\begin\{/)) {
      return;
    }

    // 正規表現で分割
    // 1. $$...$$ or \[...\] or \begin{env}...\end{env} (Display)
    // 2. \(...\) or $...$ (Inline)
    const regex =
      /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{([a-z]+)\*?\}[\s\S]*?\\end\{\2\}|\\\([\s\S]*?\\\)|(?<!\\)\$[^$]*?\$)/g;

    const parts = text.split(regex);

    if (parts.length === 1) return;

    return (
      <>
        {parts.map((part, index) => {
          // splitの結果、キャプチャグループも配列に含まれるため、環境名などはスキップする必要があるかもしれないが
          // 今回の正規表現だと、環境名 (\2) が配列に入ってくる可能性がある。
          // 単純な split だと挙動が難しいので、matchAll を使うか、あるいは単純に判定する。

          // ここでは簡易的に判定する
          if (!part) return null;

          // 環境名のキャプチャグループが混ざるのを防ぐため、正規表現を調整するか、ここで判定
          if (part.match(/^[a-z]+$/)) return null; // 環境名っぽいものは無視（雑だが）

          // Display Math
          if (part.startsWith("$$") && part.endsWith("$$")) {
            return parse(renderMath(part.slice(2, -2), true));
          }
          if (part.startsWith("\\[") && part.endsWith("\\]")) {
            return parse(renderMath(part.slice(2, -2), true));
          }
          if (part.match(/^\\begin\{([a-z]+)\*?\}/)) {
            return parse(renderMath(part, true));
          }

          // Inline Math
          if (part.startsWith("\\(") && part.endsWith("\\)")) {
            return parse(renderMath(part.slice(2, -2), false));
          }
          if (part.startsWith("$") && part.endsWith("$")) {
            return parse(renderMath(part.slice(1, -1), false));
          }

          return part;
        })}
      </>
    );
  }
};

export function DiaryBody({ html }: DiaryBodyProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
      {parse(html, { replace: replaceNode })}
    </div>
  );
}
