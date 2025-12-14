import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/weekly-diary - List all weekly diary entries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase.from("weekly_diary").select("*").order("created_at", { ascending: false });

    if (status && (status === "draft" || status === "published")) {
      query = query.eq("status", status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("[API] Failed to fetch weekly diary entries:", error);
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/weekly-diary - Create new weekly diary entry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, body: content, summary, folder, tags, status, publishedAt, heroImageUrl } = body;

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("weekly_diary")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("weekly_diary")
      .insert({
        title,
        slug,
        body: content || null,
        summary: summary || null,
        folder: folder || null,
        tags: tags || null,
        status: status || "draft",
        published_at: publishedAt || null,
        hero_image_url: heroImageUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to create weekly diary entry:", error);
      return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

