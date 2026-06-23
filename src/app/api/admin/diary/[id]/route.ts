import { revalidatePath } from "next/cache";

import { getPublicTags, getStoredTags, isLinkOnlyContent } from "@/lib/content-visibility";
import { createClient } from "@/lib/supabase/server";
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

// GET /api/admin/diary/[id] - Get single diary entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("diary")
      .select("*")
      .eq("id", id)
      .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
      console.error("[API] Failed to fetch diary entry:", error);
      return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
    }

    return NextResponse.json({ data: normalizeDiaryAdminRow(data) });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/diary/[id] - Update diary entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Check if slug exists on another entry
    const { data: existing } = await supabase
      .from("diary")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const storedTags = getStoredTags(Array.isArray(tags) ? tags : [], Boolean(linkOnly));

    // Confirm the target is a regular diary entry (not a reserved folder) before
    // updating. `.or()` cannot be used on the UPDATE itself: PostgREST emits
    // invalid SQL ("column diary.folder does not exist") for `.or()` on
    // UPDATE/DELETE under RLS, so the folder scope is enforced via a SELECT and
    // the update is keyed by id only.
    const { data: target, error: lookupError } = await supabase
      .from("diary")
      .select("id")
      .eq("id", id)
      .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
      .maybeSingle();

    if (lookupError) {
      console.error("[API] Failed to look up diary entry:", lookupError);
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }

    if (!target) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("diary")
      .update({
        title,
        slug,
        body: content || null,
        summary: summary || null,
        folder: folder || null,
        tags: storedTags.length > 0 ? storedTags : null,
        status: status || "draft",
        published_at: publishedAt || null,
        hero_image_url: ogImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to update diary entry:", error);
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/diary");
    if (data?.slug) revalidatePath(`/diary/${data.slug}`);

    return NextResponse.json({ data: normalizeDiaryAdminRow(data) });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/diary/[id] - Delete diary entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Scope the delete to regular diary entries (excluding reserved folders) via
    // a SELECT, then delete by id only. PostgREST generates invalid SQL ("column
    // diary.folder does not exist") for `.or()` on UPDATE/DELETE once RLS is
    // active, so the folder filter cannot live on the delete itself.
    const { data: target, error: lookupError } = await supabase
      .from("diary")
      .select("slug")
      .eq("id", id)
      .or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER)
      .maybeSingle();

    if (lookupError) {
      console.error("[API] Failed to look up diary entry:", lookupError);
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }

    // Not found, or it belongs to a reserved folder (managed by another admin).
    if (!target) {
      return NextResponse.json({ error: "Entry not found or not deletable" }, { status: 404 });
    }

    const { error } = await supabase.from("diary").delete().eq("id", id);

    if (error) {
      console.error("[API] Failed to delete diary entry:", error);
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/diary");
    if (target.slug) revalidatePath(`/diary/${target.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
