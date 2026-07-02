import { Fragment, type ReactNode } from "react";
import parse, { DOMNode, Element, Text, domToReact, type HTMLReactParserOptions } from "html-react-parser";
import katex from "katex";
// KaTeX styles are scoped to article bodies (this component) rather than loaded
// globally, so non-article pages (home/listings/about) stay lightweight.
import "katex/dist/katex.min.css";

import { LinkCard } from "@/components/ui/link-card";
import { RichTabs, type RichTabItem } from "@/components/diary/rich-tabs";
import { hasInlineLink, tokenizeInlineLinks } from "@/lib/inline-links";
import { KATEX_PRERENDERED_CLASS } from "@/lib/katex";

type DiaryBodyProps = {
  html: string;
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"]);
const EXACT_IMAGE_HOSTS = new Set(["images.microcms-assets.io", "abs.twimg.com", "pbs.twimg.com"]);
const WILDCARD_IMAGE_HOST_SUFFIXES = [".githubusercontent.com", ".supabase.co"];
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

function getImageUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

function hasAllowedImageHost(hostname: string): boolean {
  return (
    EXACT_IMAGE_HOSTS.has(hostname) ||
    WILDCARD_IMAGE_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  );
}

function hasImageExtension(pathname: string): boolean {
  const fileName = pathname.split("/").pop()?.toLowerCase() ?? "";
  return Array.from(IMAGE_EXTENSIONS).some((extension) => fileName.endsWith(extension));
}

function isEmbeddableImageUrl(url: string): boolean {
  const parsed = getImageUrl(url);
  return Boolean(parsed && hasAllowedImageHost(parsed.hostname) && hasImageExtension(parsed.pathname));
}

function getImageAlt(url: string): string {
  const parsed = getImageUrl(url);
  if (!parsed) return "埋め込み画像";

  const fileName = parsed.pathname.split("/").pop();
  if (!fileName) return "埋め込み画像";

  try {
    return decodeURIComponent(fileName.replace(/\.[^.]+$/, "")) || "埋め込み画像";
  } catch {
    return fileName.replace(/\.[^.]+$/, "") || "埋め込み画像";
  }
}

function BareImageLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 block rounded-xl border border-white/10 p-1 transition hover:border-accent/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={getImageAlt(url)}
        loading="lazy"
        decoding="async"
        className="h-auto max-w-full rounded-lg"
      />
    </a>
  );
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(hostname)) return null;

    if (hostname === "youtu.be") {
      return normalizeYouTubeVideoId(parsed.pathname.split("/").filter(Boolean)[0]);
    }

    if (parsed.pathname === "/watch") {
      return normalizeYouTubeVideoId(parsed.searchParams.get("v"));
    }

    const [, route, videoId] = parsed.pathname.split("/");
    if (route === "embed" || route === "shorts") {
      return normalizeYouTubeVideoId(videoId);
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeYouTubeVideoId(videoId: string | null | undefined): string | null {
  if (!videoId) return null;

  const normalized = videoId.trim();
  return /^[A-Za-z0-9_-]{6,}$/.test(normalized) ? normalized : null;
}

function YouTubeEmbed({ url, videoId }: { url: string; videoId: string }) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-white/10 bg-black">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
      >
        YouTube で動画を開く
      </a>
    </div>
  );
}

const renderMath = (content: string, displayMode: boolean) => {
  try {
    return katex.renderToString(content, {
      displayMode,
      throwOnError: false,
    });
  } catch {
    return content;
  }
};

function hasClass(node: Element, className: string): boolean {
  const classAttr = node.attribs?.class ?? "";
  return classAttr.split(/\s+/).includes(className);
}

// 生 HTML ブロック（math-callout 等）の内側に残った `[label](href)` リンク記法を
// クライアント側で <a> へ展開する。サーバー側の Markdown パイプラインはこれらを
// 解釈しないため、数式処理と同じくここで補完する。
const renderTextWithLinks = (text: string, keyPrefix: string): ReactNode => {
  const tokens = tokenizeInlineLinks(text);
  if (tokens.length === 1 && tokens[0].type === "text") {
    return tokens[0].value;
  }
  return tokens.map((token, index) =>
    token.type === "link" ? (
      <a key={`${keyPrefix}-${index}`} href={token.href}>
        {token.label}
      </a>
    ) : (
      <Fragment key={`${keyPrefix}-${index}`}>{token.value}</Fragment>
    ),
  );
};

const replaceNode = (domNode: DOMNode) => {
  // 0. タブ (:::tabs) の置換処理 — クライアント側で切り替え可能にする
  if (domNode instanceof Element && domNode.name === "div" && hasClass(domNode, "md-tabs")) {
    const items: RichTabItem[] = domNode.children
      .filter((child): child is Element => child instanceof Element && hasClass(child, "md-tab"))
      .map((tab) => ({
        label: tab.attribs["data-tab-label"] || "タブ",
        content: domToReact(tab.children as DOMNode[], parseOptions),
      }));

    if (items.length > 0) {
      return <RichTabs items={items} />;
    }
  }

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
        href &&
        anchor.children.length === 1 &&
        anchor.children[0] instanceof Text &&
        (anchor.children[0].data.trim() === href || anchor.children[0].data.trim().startsWith("http"))
      ) {
        const youtubeVideoId = getYouTubeVideoId(href);
        const content = youtubeVideoId ? (
          <YouTubeEmbed url={href} videoId={youtubeVideoId} />
        ) : isEmbeddableImageUrl(href) ? (
          <BareImageLink url={href} />
        ) : (
          <LinkCard url={href} />
        );
        // liの場合はliでラップして返す（マーカーを消すためにlist-noneを付与）
        if (domNode.name === "li") {
          return <li className="list-none">{content}</li>;
        }
        return content;
      }
    }
  }

  // 2. 数式・インラインリンクの置換処理
  if (domNode instanceof Text) {
    const text = domNode.data;
    const hasMath = /\$\$|\\\[|\\\(|\$|\\begin\{/.test(text);
    const hasLink = hasInlineLink(text);
    // 数式もリンク記法も無い場合は何もしない
    if (!hasMath && !hasLink) {
      return;
    }

    // 正規表現で分割
    // 1. $$...$$ or \[...\] or \begin{env}...\end{env} (Display)
    // 2. \(...\) or $...$ (Inline)
    const regex =
      /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{([a-z]+)\*?\}[\s\S]*?\\end\{\2\}|\\\([\s\S]*?\\\)|(?<!\\)\$[^$]*?\$)/g;

    const parts = text.split(regex);

    // 数式が無くリンクのみの場合は、テキスト全体をリンク化する
    if (parts.length === 1) {
      return <>{renderTextWithLinks(text, "lnk")}</>;
    }

    return (
      <>
        {parts.map((part, index) => {
          // splitの結果、キャプチャグループ（環境名 \2）も配列に含まれるため除外する
          if (!part) return null;

          // 環境名っぽいキャプチャグループは無視（雑だが）
          if (part.match(/^[a-z]+$/)) return null;

          // Display Math
          if (part.startsWith("$$") && part.endsWith("$$")) {
            return <Fragment key={index}>{parse(renderMath(part.slice(2, -2), true))}</Fragment>;
          }
          if (part.startsWith("\\[") && part.endsWith("\\]")) {
            return <Fragment key={index}>{parse(renderMath(part.slice(2, -2), true))}</Fragment>;
          }
          if (part.match(/^\\begin\{([a-z]+)\*?\}/)) {
            return <Fragment key={index}>{parse(renderMath(part, true))}</Fragment>;
          }

          // Inline Math
          if (part.startsWith("\\(") && part.endsWith("\\)")) {
            return <Fragment key={index}>{parse(renderMath(part.slice(2, -2), false))}</Fragment>;
          }
          if (part.startsWith("$") && part.endsWith("$")) {
            return <Fragment key={index}>{parse(renderMath(part.slice(1, -1), false))}</Fragment>;
          }

          // 数式以外の素のテキスト部分に残ったリンク記法を展開する
          return <Fragment key={index}>{renderTextWithLinks(part, `p${index}`)}</Fragment>;
        })}
      </>
    );
  }
};

const parseOptions: HTMLReactParserOptions = { replace: replaceNode };

export function DiaryBody({ html }: DiaryBodyProps) {
  return (
    <div
      className={`${KATEX_PRERENDERED_CLASS} prose prose-invert prose-preserve-whitespace max-w-none prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl`}
    >
      {parse(html, parseOptions)}
    </div>
  );
}
