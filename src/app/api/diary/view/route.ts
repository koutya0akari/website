import { NextResponse, type NextRequest } from "next/server";

import { incrementDiaryView } from "@/lib/diary";
import {
  VIEW_COOKIE_MAX_AGE_SECONDS,
  isValidDiarySlug,
  viewCookieName,
} from "@/lib/view-dedup";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function POST(request: NextRequest) {
  const { slug } = await request.json().catch(() => ({ slug: undefined }));
  const normalizedSlug = typeof slug === "string" ? slug.trim() : "";

  if (!normalizedSlug || !isValidDiarySlug(normalizedSlug)) {
    return NextResponse.json(
      { error: "slug is required" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  // 同一ブラウザからの再カウントは 24h 抑止（viewCount: null なら
  // クライアント側 DiaryViewBadge は表示中の値を保持する）
  const cookieName = viewCookieName(normalizedSlug);
  if (request.cookies.has(cookieName)) {
    return NextResponse.json(
      { counted: false, viewCount: null },
      { status: 200, headers: noStoreHeaders },
    );
  }

  const viewCount = await incrementDiaryView(normalizedSlug);

  if (typeof viewCount !== "number") {
    return NextResponse.json(
      { counted: false, viewCount: null },
      { status: 200, headers: noStoreHeaders },
    );
  }

  const response = NextResponse.json({ viewCount }, { headers: noStoreHeaders });
  response.cookies.set(cookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VIEW_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
