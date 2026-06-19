import { NextRequest, NextResponse } from "next/server";

import { LINK_ONLY_TAG } from "@/lib/content-visibility";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/tags - 既存記事で使われたタグの一覧（重複排除）を返す。
// `?folder=` を指定するとそのフォルダ（メモ / 日記 など）に絞り込む。
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");

    let query = supabase.from("diary").select("tags");
    if (folder) {
      query = query.eq("folder", folder);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API] Failed to fetch tags:", error);
      return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }

    const tagSet = new Set<string>();
    for (const row of (data as { tags: string[] | null }[]) ?? []) {
      for (const tag of row.tags ?? []) {
        const trimmed = typeof tag === "string" ? tag.trim() : "";
        if (trimmed && trimmed !== LINK_ONLY_TAG) tagSet.add(trimmed);
      }
    }

    const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ja"));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
