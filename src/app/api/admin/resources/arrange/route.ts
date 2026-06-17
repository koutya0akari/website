import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// 公開資料の「掲載順」と「表示/非表示」を保存するエンドポイント。
// GitHub 由来の PDF は metadata 行が無い場合があるため、その場合は file_url を
// キーに resources 行を新規作成して状態を永続化する。
// クライアントは表示順に並べた全項目を送る（部分更新ではなく全体を送る）。

type ArrangeItem = {
  metadataId: string | null;
  fileUrl: string | null;
  title: string;
  category: string;
  externalUrl: string | null;
  hidden: boolean;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createMicrocmsId(fileUrl: string, externalUrl: string, title: string) {
  const source = fileUrl || externalUrl || title || crypto.randomUUID();
  const sanitized = source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${sanitized || "resource"}-${crypto.randomUUID()}`;
}

// POST /api/admin/resources/arrange
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
    const items = body?.items;
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index] as ArrangeItem;
      const hidden = item?.hidden === true;
      const metadataId = normalizeText(item?.metadataId);
      const fileUrl = normalizeText(item?.fileUrl);

      if (metadataId) {
        const { error } = await supabase
          .from("resources")
          .update({ sort_order: index, hidden, updated_at: now })
          .eq("id", metadataId);
        if (error) {
          console.error("[API] Failed to update resource order:", error);
          return NextResponse.json({ error: "Failed to save order", detail: error.message }, { status: 500 });
        }
        continue;
      }

      // metadata 行が無い GitHub PDF: file_url で既存を探し、無ければ作成する。
      if (!fileUrl) {
        continue;
      }

      const { data: existing, error: lookupError } = await supabase
        .from("resources")
        .select("id")
        .eq("file_url", fileUrl)
        .maybeSingle();

      if (lookupError) {
        console.error("[API] Failed to look up resource:", lookupError);
        return NextResponse.json({ error: "Failed to save order", detail: lookupError.message }, { status: 500 });
      }

      if (existing) {
        const { error } = await supabase
          .from("resources")
          .update({ sort_order: index, hidden, updated_at: now })
          .eq("id", existing.id);
        if (error) {
          console.error("[API] Failed to update resource order:", error);
          return NextResponse.json({ error: "Failed to save order", detail: error.message }, { status: 500 });
        }
      } else {
        const title = normalizeText(item?.title);
        const category = normalizeText(item?.category);
        const externalUrl = normalizeText(item?.externalUrl);
        const { error } = await supabase.from("resources").insert({
          microcms_id: createMicrocmsId(fileUrl, externalUrl, title),
          title,
          description: "",
          category,
          file_url: fileUrl,
          external_url: externalUrl || null,
          sort_order: index,
          hidden,
        });
        if (error) {
          console.error("[API] Failed to create resource order row:", error);
          return NextResponse.json({ error: "Failed to save order", detail: error.message }, { status: 500 });
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/resources");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
