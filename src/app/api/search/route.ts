import { NextResponse, type NextRequest } from "next/server";

import { getDiaryEntries } from "@/lib/diary";
import { getMemoEntries } from "@/lib/memo";
import { getMonthlyDiaryEntries } from "@/lib/monthly-diary";
import { filterAndRankEntries, type SearchHit } from "@/lib/search";

export const dynamic = "force-dynamic";

// キーストローク由来のトラフィックは CDN に吸収させる
const cacheHeaders = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

const FETCH_LIMIT = 200;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ data: [] }, { headers: cacheHeaders });
  }

  const [diary, memo, monthlyDiary] = await Promise.all([
    getDiaryEntries(FETCH_LIMIT),
    getMemoEntries(FETCH_LIMIT),
    getMonthlyDiaryEntries(FETCH_LIMIT),
  ]);

  const data: SearchHit[] = [
    ...filterAndRankEntries(query, diary, "diary", "/diary"),
    ...filterAndRankEntries(query, memo, "memo", "/memo"),
    ...filterAndRankEntries(query, monthlyDiary, "monthly-diary", "/monthly-diary"),
  ];

  return NextResponse.json({ data }, { headers: cacheHeaders });
}
