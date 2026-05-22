import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function parsePublicHttpUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (isBlockedHostname(parsed.hostname)) return null;

    return parsed;
  } catch {
    return null;
  }
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    normalized === "localhost" ||
    normalized === "0.0.0.0" ||
    normalized === "::" ||
    normalized === "::1" ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".localhost")
  ) {
    return true;
  }

  if (/^127\./.test(normalized) || /^10\./.test(normalized) || /^169\.254\./.test(normalized)) {
    return true;
  }

  if (/^192\.168\./.test(normalized)) {
    return true;
  }

  const private172Match = normalized.match(/^172\.(\d{1,3})\./);
  if (private172Match) {
    const secondOctet = Number(private172Match[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

function absolutizeUrl(value: string | undefined, baseUrl: URL): string | undefined {
  if (!value) return undefined;

  try {
    const parsed = new URL(value, baseUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const targetUrl = parsePublicHttpUrl(url);
  if (!targetUrl) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "akari0koutya-link-preview/1.0",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text();
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content");
    const image = absolutizeUrl(
      $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content"),
      targetUrl,
    );
    const siteName = $('meta[property="og:site_name"]').attr("content");

    const favicon =
      absolutizeUrl(
        $('link[rel~="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href") ||
          $('link[rel="apple-touch-icon"]').attr("href"),
        targetUrl,
      ) || new URL("/favicon.ico", targetUrl.origin).toString();

    return NextResponse.json({
      title,
      description,
      image,
      siteName,
      favicon,
      url: targetUrl.toString(),
    });
  } catch (error) {
    console.error("OGP Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
