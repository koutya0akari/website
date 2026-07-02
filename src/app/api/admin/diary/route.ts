import { revalidatePath } from "next/cache";

import { getPublicTags, getStoredTags, isLinkOnlyContent } from "@/lib/content-visibility";
import { requireAdmin } from "@/lib/admin-auth";
import {
  MEMO_FOLDER,
  MONTHLY_DIARY_FOLDER,
  MONTHLY_DIARY_FOLDERS,
  RESERVED_DIARY_FOLDER_EXCLUSION_FILTER,
} from "@/lib/monthly-diary-config";
import { NextRequest, NextResponse } from "next/server";

type DiaryAdminRow = {
  tags: string[] | null;
  [key: string]: unknown;
};

function normalizeDiaryAdminRow<T extends DiaryAdminRow>(row: T) {
  return {
    ...row,
    tags: getPublicTags(row.tags),
    link_only: isLinkOnlyContent(row.tags),
  };
}

// GET /api/admin/diary - List all diary entries
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("diary")
      .select("*")
      .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
      .order("created_at", { ascending: false });

    if (status && (status === "draft" || status === "published")) {
      query = query.eq("status", status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("[API] Failed to fetch diary entries:", error);
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
    }

    return NextResponse.json({ data: (data ?? []).map(normalizeDiaryAdminRow) });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/diary - Create new diary entry
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;

    const body = await request.json();
    const {
      title,
      slug,
      body: content,
      summary,
      folder,
      tags,
      linkOnly,
      status,
      publishedAt,
      shareImageUrl,
      heroImageUrl,
    } = body;
    const ogImageUrl = shareImageUrl ?? heroImageUrl;

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    if (MONTHLY_DIARY_FOLDERS.includes(String(folder ?? "") as (typeof MONTHLY_DIARY_FOLDERS)[number])) {
      return NextResponse.json(
        { error: `Folder "${MONTHLY_DIARY_FOLDER}" is reserved. Use 日記 admin instead.` },
        { status: 400 },
      );
    }

    if (folder === MEMO_FOLDER) {
      return NextResponse.json(
        { error: `Folder "${MEMO_FOLDER}" is reserved. Use メモ admin instead.` },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("diary")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const storedTags = getStoredTags(Array.isArray(tags) ? tags : [], Boolean(linkOnly));

    const { data, error } = await supabase
      .from("diary")
      .insert({
        title,
        slug,
        body: content || null,
        summary: summary || null,
        folder: folder || null,
        tags: storedTags.length > 0 ? storedTags : null,
        status: status || "draft",
        published_at: publishedAt || null,
        hero_image_url: ogImageUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to create diary entry:", error);
      return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/diary");
    if (data?.slug) revalidatePath(`/diary/${data.slug}`);

    return NextResponse.json({ data: normalizeDiaryAdminRow(data) }, { status: 201 });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
