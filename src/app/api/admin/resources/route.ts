import { createClient } from "@/lib/supabase/server";
import { buildAdminResourceItems, getLectureNoteItems, type ResourceRow } from "@/lib/resource-items";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createMicrocmsId(fileUrl: string, externalUrl: string, title: string) {
  const source = fileUrl || externalUrl || title || crypto.randomUUID();
  const sanitized = source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${sanitized || "resource"}-${crypto.randomUUID()}`;
}

// GET /api/admin/resources - List all resources
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
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [{ data, error }, githubItems] = await Promise.all([
      supabase.from("resources").select("*").order("updated_at", { ascending: false }),
      getLectureNoteItems(),
    ]);

    if (error) {
      console.error("[API] Failed to fetch resources:", error);
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }

    const mergedItems = buildAdminResourceItems((data as ResourceRow[]) ?? [], githubItems);
    const filteredItems = category
      ? mergedItems.filter((item) => item.category === category)
      : mergedItems;

    return NextResponse.json({ data: filteredItems.slice(offset, offset + limit) });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = normalizeText(body.title);
    const description = normalizeText(body.description);
    const category = normalizeText(body.category);
    const fileUrl = normalizeText(body.fileUrl);
    const externalUrl = normalizeText(body.externalUrl);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (fileUrl) {
      const { data: existing, error: existingError } = await supabase
        .from("resources")
        .select("id")
        .eq("file_url", fileUrl)
        .maybeSingle();

      if (existingError) {
        console.error("[API] Failed to check existing resource:", existingError);
        return NextResponse.json({ error: "Failed to validate resource" }, { status: 500 });
      }

      if (existing) {
        return NextResponse.json(
          { error: "この PDF の補足情報は既に存在します", existingId: existing.id },
          { status: 409 },
        );
      }
    }

    const { data, error } = await supabase
      .from("resources")
      .insert({
        microcms_id: createMicrocmsId(fileUrl, externalUrl, title),
        title,
        description,
        category,
        file_url: fileUrl,
        external_url: externalUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to create resource:", error);
      return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/resources");

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
