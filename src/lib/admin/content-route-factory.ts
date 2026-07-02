import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getPublicTags, getStoredTags, isLinkOnlyContent } from "@/lib/content-visibility";

// admin の diary / memo / monthly-diary CRUD ルートの共通実装。
// 種別ごとの違い（フォルダの絞り込み・保存するフォルダ・revalidate 対象）を
// config として注入し、6 つのルートファイルを設定 + re-export に縮約する。

type AdminRow = {
  tags: string[] | null;
  [key: string]: unknown;
};

function normalizeAdminRow<T extends AdminRow>(row: T) {
  return {
    ...row,
    tags: getPublicTags(row.tags),
    link_only: isLinkOnlyContent(row.tags),
  };
}

type AdminSupabase = Extract<Awaited<ReturnType<typeof requireAdmin>>, { supabase: unknown }>["supabase"];

function baseSelect(supabase: AdminSupabase, columns = "*") {
  return supabase.from("diary").select(columns);
}

type AdminDiaryQuery = ReturnType<typeof baseSelect>;

export type ContentRouteConfig = {
  // エラーログの識別子（例: "diary"）
  label: string;
  // SELECT 系のフォルダ絞り込み。
  // 注意: PostgREST は RLS 下の UPDATE/DELETE に `.or()` を使うと不正な SQL を
  // 生成するため（docs/SUPABASE_SETUP.md）、mutation は常に「この scope 付き
  // SELECT で対象を確認 → id のみで mutate」の 2 段階で行う。
  applyScope: (query: AdminDiaryQuery) => AdminDiaryQuery;
  // 一覧を published_at 優先で並べるか（diary のみ created_at のみ）
  orderByPublished: boolean;
  // insert / update で保存する folder。リクエスト body の folder を受け取る
  resolveWriteFolder: (bodyFolder: unknown) => string | null;
  // リクエストの folder が不正ならエラーメッセージを返す（diary の予約フォルダ検証）
  validateFolder?: (bodyFolder: unknown) => string | null;
  // 変更後に revalidate するパス
  revalidate: (slug?: string | null) => void;
};

function parseEntryBody(body: Record<string, unknown>) {
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
  return {
    title,
    slug,
    content,
    summary,
    folder,
    tags,
    linkOnly,
    status,
    publishedAt,
    ogImageUrl: shareImageUrl ?? heroImageUrl,
  };
}

function buildWriteRecord(
  config: ContentRouteConfig,
  parsed: ReturnType<typeof parseEntryBody>,
) {
  const storedTags = getStoredTags(
    Array.isArray(parsed.tags) ? (parsed.tags as string[]) : [],
    Boolean(parsed.linkOnly),
  );

  return {
    title: parsed.title,
    slug: parsed.slug,
    body: parsed.content || null,
    summary: parsed.summary || null,
    folder: config.resolveWriteFolder(parsed.folder),
    tags: storedTags.length > 0 ? storedTags : null,
    status: parsed.status || "draft",
    published_at: parsed.publishedAt || null,
    hero_image_url: parsed.ogImageUrl || null,
  };
}

export function createCollectionHandlers(config: ContentRouteConfig) {
  async function GET(request: NextRequest) {
    try {
      const auth = await requireAdmin();
      if (auth instanceof NextResponse) return auth;
      const { supabase } = auth;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");

      let query = config.applyScope(baseSelect(supabase));
      if (config.orderByPublished) {
        query = query.order("published_at", { ascending: false });
      }
      query = query.order("created_at", { ascending: false });

      if (status && (status === "draft" || status === "published")) {
        query = query.eq("status", status);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error(`[API] Failed to fetch ${config.label} entries:`, error);
        return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
      }

      return NextResponse.json({ data: ((data ?? []) as unknown as AdminRow[]).map(normalizeAdminRow) });
    } catch (error) {
      console.error("[API] Error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  async function POST(request: NextRequest) {
    try {
      const auth = await requireAdmin();
      if (auth instanceof NextResponse) return auth;
      const { supabase } = auth;

      const parsed = parseEntryBody(await request.json());

      if (!parsed.title || !parsed.slug) {
        return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
      }

      const folderError = config.validateFolder?.(parsed.folder);
      if (folderError) {
        return NextResponse.json({ error: folderError }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from("diary")
        .select("id")
        .eq("slug", parsed.slug)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("diary")
        .insert(buildWriteRecord(config, parsed))
        .select()
        .single();

      if (error) {
        console.error(`[API] Failed to create ${config.label} entry:`, error);
        return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
      }

      config.revalidate(data?.slug);

      return NextResponse.json({ data: normalizeAdminRow(data as AdminRow) }, { status: 201 });
    } catch (error) {
      console.error("[API] Error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  return { GET, POST };
}

type ItemContext = { params: Promise<{ id: string }> };

export function createItemHandlers(config: ContentRouteConfig) {
  // scope 内に対象が存在するか確認する（mutation を id のみで行うための前段）
  async function findScopedEntry(supabase: AdminSupabase, id: string) {
    return config
      .applyScope(baseSelect(supabase, "id, slug"))
      .eq("id", id)
      .maybeSingle();
  }

  async function GET(request: NextRequest, { params }: ItemContext) {
    try {
      const auth = await requireAdmin();
      if (auth instanceof NextResponse) return auth;
      const { supabase } = auth;
      const { id } = await params;

      const { data, error } = await config
        .applyScope(baseSelect(supabase))
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }
        console.error(`[API] Failed to fetch ${config.label} entry:`, error);
        return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
      }

      return NextResponse.json({ data: normalizeAdminRow(data as unknown as AdminRow) });
    } catch (error) {
      console.error("[API] Error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  async function PUT(request: NextRequest, { params }: ItemContext) {
    try {
      const auth = await requireAdmin();
      if (auth instanceof NextResponse) return auth;
      const { supabase } = auth;
      const { id } = await params;

      const parsed = parseEntryBody(await request.json());

      if (!parsed.title || !parsed.slug) {
        return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
      }

      const folderError = config.validateFolder?.(parsed.folder);
      if (folderError) {
        return NextResponse.json({ error: folderError }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from("diary")
        .select("id")
        .eq("slug", parsed.slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }

      const { data: target, error: lookupError } = await findScopedEntry(supabase, id);

      if (lookupError) {
        console.error(`[API] Failed to look up ${config.label} entry:`, lookupError);
        return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
      }

      if (!target) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }

      const { data, error } = await supabase
        .from("diary")
        .update({
          ...buildWriteRecord(config, parsed),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[API] Failed to update ${config.label} entry:`, error);
        return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
      }

      config.revalidate(data?.slug);

      return NextResponse.json({ data: normalizeAdminRow(data as AdminRow) });
    } catch (error) {
      console.error("[API] Error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  async function DELETE(request: NextRequest, { params }: ItemContext) {
    try {
      const auth = await requireAdmin();
      if (auth instanceof NextResponse) return auth;
      const { supabase } = auth;
      const { id } = await params;

      const { data: target, error: lookupError } = await findScopedEntry(supabase, id);

      if (lookupError) {
        console.error(`[API] Failed to look up ${config.label} entry:`, lookupError);
        return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
      }

      // 存在しないか、予約フォルダ（別の admin で管理）に属している
      if (!target) {
        return NextResponse.json({ error: "Entry not found or not deletable" }, { status: 404 });
      }

      const { error } = await supabase.from("diary").delete().eq("id", id);

      if (error) {
        console.error(`[API] Failed to delete ${config.label} entry:`, error);
        return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
      }

      config.revalidate((target as { slug?: string | null }).slug);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[API] Error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  return { GET, PUT, DELETE };
}
