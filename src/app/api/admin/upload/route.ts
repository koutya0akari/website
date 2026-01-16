import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  // Archives
  "application/zip",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/admin/upload - Upload a file to Supabase Storage
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
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
    const extension = file.name.split(".").pop() || "";
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
      console.error("[Upload] Storage error:", error);
      return NextResponse.json(
        { error: "Failed to upload file", details: error.message },
        { status: 500 }
      );
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
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      console.error("[Upload] List error:", error);
      return NextResponse.json(
        { error: "Failed to list files", details: error.message },
        { status: 500 }
      );
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
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    const { error } = await supabase.storage.from("media").remove([path]);

    if (error) {
      console.error("[Upload] Delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete file", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
