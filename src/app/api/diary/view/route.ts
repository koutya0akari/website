import { NextResponse } from "next/server";

import { incrementDiaryView } from "@/lib/microcms";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { slug } = await request.json().catch(() => ({ slug: undefined }));

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const viewCount = await incrementDiaryView(slug);

  if (typeof viewCount !== "number") {
    return NextResponse.json({ error: "failed to update view count" }, { status: 500 });
  }

  return NextResponse.json({ viewCount });
}
