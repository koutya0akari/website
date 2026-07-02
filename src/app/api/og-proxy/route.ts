import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

import { parsePublicHttpUrl } from "@/lib/url-guard";

const FETCH_TIMEOUT_MS = 5_000;
const MAX_REDIRECTS = 3;
const MAX_BODY_BYTES = 512 * 1024;

// redirect: "manual" で 1 ホップずつ辿り、リダイレクト先も毎回 SSRF ガードを通す。
// fetch を自動追従させると Location が私設 IP でも検証なしで到達してしまう。
async function fetchPublicHtml(initialUrl: URL, signal: AbortSignal): Promise<Response | null> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(currentUrl, {
      headers: {
        "User-Agent": "akari0koutya-link-preview/1.0",
      },
      redirect: "manual",
      signal,
      next: { revalidate: 3600 },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return null;

      const nextUrl = parsePublicHttpUrl(new URL(location, currentUrl).toString());
      if (!nextUrl) return null;

      currentUrl = nextUrl;
      continue;
    }

    return response;
  }

  return null;
}

async function readBodyCapped(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});

  const merged = new Uint8Array(Math.min(total, maxBytes));
  let offset = 0;
  for (const chunk of chunks) {
    const slice = chunk.subarray(0, Math.min(chunk.byteLength, merged.byteLength - offset));
    merged.set(slice, offset);
    offset += slice.byteLength;
    if (offset >= merged.byteLength) break;
  }

  return new TextDecoder().decode(merged);
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
    const response = await fetchPublicHtml(
      targetUrl,
      AbortSignal.timeout(FETCH_TIMEOUT_MS),
    );

    if (!response) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    const html = await readBodyCapped(response, MAX_BODY_BYTES);
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
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json({ error: "Fetch timed out" }, { status: 504 });
    }
    console.error("OGP Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
