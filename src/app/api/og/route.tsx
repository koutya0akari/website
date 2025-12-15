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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = clampText(searchParams.get("title") ?? "", 90);
  const summary = clampText(searchParams.get("summary") ?? "", 180);
  const tags = splitTags(searchParams.get("tags") ?? "");
  const author = clampText(searchParams.get("author") ?? "akari0koutya", 40);

  const subtitle = tags.length > 0 ? tags.join(" ") : "";

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
          background:
            "radial-gradient(circle at 18% 20%, rgba(100,210,255,0.28), transparent 45%), radial-gradient(circle at 82% 0%, rgba(247,181,0,0.22), transparent 42%), linear-gradient(135deg, #030817 0%, #0b1528 55%, #132642 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
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
            <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)" }}>@{author}</div>
          </div>

          <div
            style={{
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
            <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.80)", lineHeight: "1.25" }}>{subtitle}</div>
          )}

          {summary && (
            <div style={{ fontSize: "26px", color: "rgba(255,255,255,0.75)", lineHeight: "1.35" }}>
              {summary}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.16)",
              backgroundColor: "rgba(0,0,0,0.22)",
              fontSize: "18px",
              color: "rgba(255,255,255,0.80)",
            }}
          >
            Mathematics as a daily practice
          </div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)" }}>www.akari0koutya.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
