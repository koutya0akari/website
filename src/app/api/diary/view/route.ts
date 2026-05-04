import { NextResponse } from "next/server";

import { incrementDiaryView } from "@/lib/diary";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function POST(request: Request) {
  const { slug } = await request.json().catch(() => ({ slug: undefined }));
  const normalizedSlug = typeof slug === "string" ? slug.trim() : "";

  if (!normalizedSlug) {
    return NextResponse.json(
      { error: "slug is required" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const viewCount = await incrementDiaryView(normalizedSlug);

  if (typeof viewCount !== "number") {
    return NextResponse.json(
      { counted: false, viewCount: null },
      { status: 200, headers: noStoreHeaders },
    );
  }

  return NextResponse.json({ viewCount }, { headers: noStoreHeaders });
}
