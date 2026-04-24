import { createClient } from "@/lib/supabase/server";
import { MEMO_FOLDER } from "@/lib/monthly-diary-config";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/memo/[id] - Get single memo entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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
      .eq("folder", MEMO_FOLDER)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
      console.error("[API] Failed to fetch memo entry:", error);
      return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/memo/[id] - Update memo entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, body: content, summary, tags, status, publishedAt, heroImageUrl } = body;

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

    const { data, error } = await supabase
      .from("diary")
      .update({
        title,
        slug,
        body: content || null,
        summary: summary || null,
        folder: MEMO_FOLDER,
        tags: tags || null,
        status: status || "draft",
        published_at: publishedAt || null,
        hero_image_url: heroImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("folder", MEMO_FOLDER)
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to update memo entry:", error);
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/memo/[id] - Delete memo entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("diary")
      .delete()
      .eq("id", id)
      .eq("folder", MEMO_FOLDER);

    if (error) {
      console.error("[API] Failed to delete memo entry:", error);
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
