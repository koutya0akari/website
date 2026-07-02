import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// OG image generator (Twitter/X card)

function clampText(value: string, max = 140): string {
  const trimmed = (value ?? "").replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1) + "…";
}

function splitTags(tags: string): string[] {
  return (tags ?? "")
    .split(/[,\s]+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .slice(0, 6);
}

// Satori の既定フォントはラテン文字のみで日本語が豆腐になるため、
// Google Fonts の動的サブセット（&text=）で描画文字だけの Noto Sans JP を取得する。
// 古い UA を名乗るのは woff2 でなく Satori が読める TTF を返させるため。
const fontCache = new Map<string, ArrayBuffer>();
const FONT_CACHE_MAX = 50;

async function loadNotoSansJp(text: string): Promise<ArrayBuffer | null> {
  const subset = Array.from(new Set(Array.from(text))).sort().join("");
  const cached = fontCache.get(subset);
  if (cached) return cached;

  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(subset)}`;
    const cssRes = await fetch(cssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" },
      cache: "force-cache",
    });
    if (!cssRes.ok) return null;

    const css = await cssRes.text();
    const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!fontUrl) return null;

    const fontRes = await fetch(fontUrl, { cache: "force-cache" });
    if (!fontRes.ok) return null;

    const data = await fontRes.arrayBuffer();
    if (fontCache.size >= FONT_CACHE_MAX) {
      const oldestKey = fontCache.keys().next().value;
      if (oldestKey !== undefined) fontCache.delete(oldestKey);
    }
    fontCache.set(subset, data);
    return data;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = clampText(searchParams.get("title") ?? "", 90);
  const summary = clampText(searchParams.get("summary") ?? "", 180);
  const tags = splitTags(searchParams.get("tags") ?? "");
  const author = clampText(searchParams.get("author") ?? "akari0koutya", 40);

  const subtitle = tags.length > 0 ? tags.join(" ") : "";

  const renderedText = [
    title || "Post",
    summary,
    subtitle,
    `@${author}`,
    "Akari Math Lab",
    "www.akari0koutya.com",
  ].join("");
  const fontData = await loadNotoSansJp(renderedText);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          color: "white",
          fontFamily: fontData ? '"Noto Sans JP"' : undefined,
          background:
            "radial-gradient(circle at 18% 20%, rgba(100,210,255,0.28), transparent 45%), radial-gradient(circle at 82% 0%, rgba(247,181,0,0.22), transparent 42%), linear-gradient(135deg, #030817 0%, #0b1528 55%, #132642 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                padding: "8px 14px",
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "18px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Akari Math Lab
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "rgba(255,255,255,0.7)" }}>@{author}</div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "62px",
              lineHeight: "1.1",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              wordBreak: "break-word",
            }}
          >
            {title || "Post"}
          </div>

          {subtitle && (
            <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.80)", lineHeight: "1.25" }}>{subtitle}</div>
          )}

          {summary && (
            <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.75)", lineHeight: "1.35" }}>
              {summary}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: "18px", color: "rgba(255,255,255,0.55)" }}>www.akari0koutya.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // フォント取得失敗時は指定なしで生成を続ける（豆腐化しても画像自体は返す）
      ...(fontData
        ? {
            fonts: [
              {
                name: "Noto Sans JP",
                data: fontData,
                weight: 700 as const,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    },
  );
}
