import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "bot", // OGP取得用のUser-Agent
      },
      next: { revalidate: 3600 }, // 1時間キャッシュ
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
    const image =
      $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content");
    const siteName = $('meta[property="og:site_name"]').attr("content");
    
    // faviconの取得（簡易的）
    let favicon = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href");
    if (favicon && !favicon.startsWith("http")) {
      const urlObj = new URL(url);
      favicon = new URL(favicon, urlObj.origin).toString();
    }

    return NextResponse.json({
      title,
      description,
      image,
      siteName,
      favicon,
      url,
    });
  } catch (error) {
    console.error("OGP Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
