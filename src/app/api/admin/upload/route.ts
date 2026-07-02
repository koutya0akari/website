import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

// SVG は公開 URL で開くと埋め込みスクリプトが実行され得る（stored XSS）ため許可しない。
// 保存する拡張子もこのマップから引き、クライアントのファイル名は信用しない。
const MIME_EXTENSIONS: Record<string, string> = {
  // Images
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  // Documents
  "application/pdf": "pdf",
  // Archives
  "application/zip": "zip",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/admin/upload - Upload a file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const extension = MIME_EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const safeFileName = file.name
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, "-") // Replace special chars
      .substring(0, 50); // Limit length
    const fileName = `${folder}/${timestamp}-${randomString}-${safeFileName}.${extension}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("media")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return apiError("Failed to upload file", 500, error, "Upload");
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/admin/upload - List uploaded files
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // List files in storage
    const { data, error } = await supabase.storage
      .from("media")
      .list(folder, {
        limit,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return apiError("Failed to list files", 500, error, "Upload");
    }

    // Get public URLs for each file
    const files = (data || [])
      .filter((item) => item.name !== ".emptyFolderPlaceholder")
      .map((item) => {
        const path = folder ? `${folder}/${item.name}` : item.name;
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
        return {
          name: item.name,
          path,
          url: urlData.publicUrl,
          size: item.metadata?.size,
          type: item.metadata?.mimetype,
          createdAt: item.created_at,
        };
      });

    return NextResponse.json({ data: files });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/upload - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { supabase } = auth;

    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    const { error } = await supabase.storage.from("media").remove([path]);

    if (error) {
      return apiError("Failed to delete file", 500, error, "Upload");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
