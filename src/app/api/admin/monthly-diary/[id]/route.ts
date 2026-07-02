import { revalidatePath } from "next/cache";

import { getPublicTags, getStoredTags, isLinkOnlyContent } from "@/lib/content-visibility";
import { requireAdmin } from "@/lib/admin-auth";
import { MONTHLY_DIARY_FOLDER, MONTHLY_DIARY_FOLDERS } from "@/lib/monthly-diary-config";
import { NextRequest, NextResponse } from "next/server";

type MonthlyDiaryAdminRow = {
  tags: string[] | null;
  [key: string]: unknown;
};

function normalizeMonthlyDiaryAdminRow<T extends MonthlyDiaryAdminRow>(row: T) {
  return {
    ...row,
    tags: getPublicTags(row.tags),
    link_only: isLinkOnlyContent(row.tags),
  };
}

// GET /api/admin/monthly-diary/[id] - Get single monthly diary entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;
    const { id } = await params;

    const { data, error } = await supabase
      .from("diary")
      .select("*")
      .eq("id", id)
      .in("folder", [...MONTHLY_DIARY_FOLDERS])
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
      console.error("[API] Failed to fetch monthly diary entry:", error);
      return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
    }

    return NextResponse.json({ data: normalizeMonthlyDiaryAdminRow(data) });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/monthly-diary/[id] - Update monthly diary entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;
    const { id } = await params;

    const body = await request.json();
    const {
      title,
      slug,
      body: content,
      summary,
      tags,
      linkOnly,
      status,
      publishedAt,
      shareImageUrl,
      heroImageUrl,
    } = body;
    const ogImageUrl = shareImageUrl ?? heroImageUrl;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

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

    const { data, error } = await supabase
      .from("diary")
      .update({
        title,
        slug,
        body: content || null,
        summary: summary || null,
        folder: MONTHLY_DIARY_FOLDER,
        tags: storedTags.length > 0 ? storedTags : null,
        status: status || "draft",
        published_at: publishedAt || null,
        hero_image_url: ogImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("folder", [...MONTHLY_DIARY_FOLDERS])
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to update monthly diary entry:", error);
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/monthly-diary");
    if (data?.slug) revalidatePath(`/monthly-diary/${data.slug}`);

    return NextResponse.json({ data: normalizeMonthlyDiaryAdminRow(data) });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/monthly-diary/[id] - Delete monthly diary entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;
    const { id } = await params;

    const { data: deleted, error } = await supabase
      .from("diary")
      .delete()
      .eq("id", id)
      .in("folder", [...MONTHLY_DIARY_FOLDERS])
      .select("slug")
      .maybeSingle();

    if (error) {
      console.error("[API] Failed to delete monthly diary entry:", error);
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }

    // No row was deleted: either the entry does not exist, or RLS prevented the
    // delete. Surface it instead of reporting a phantom success.
    if (!deleted) {
      return NextResponse.json({ error: "Entry not found or not deletable" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/monthly-diary");
    if (deleted.slug) revalidatePath(`/monthly-diary/${deleted.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
