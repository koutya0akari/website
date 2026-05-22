import parse, { DOMNode, Element, Text } from "html-react-parser";
import katex from "katex";

import { LinkCard } from "@/components/ui/link-card";

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
  if (!parsed) return "Embedded image";

  const fileName = parsed.pathname.split("/").pop();
  if (!fileName) return "Embedded image";

  try {
    return decodeURIComponent(fileName.replace(/\.[^.]+$/, "")) || "Embedded image";
  } catch {
    return fileName.replace(/\.[^.]+$/, "") || "Embedded image";
  }
}

function BareImageLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 block rounded-xl border border-white/10 bg-white/[0.03] p-1 transition hover:border-accent/50"
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
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_14px_36px_rgba(2,8,20,0.22)]">
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
        Open video on YouTube
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
        {parts.map((part) => {
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
    <div className="prose prose-invert prose-preserve-whitespace max-w-none prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
      {parse(html, { replace: replaceNode })}
    </div>
  );
}
