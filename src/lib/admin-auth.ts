import "server-only";

import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAllowedAdminEmail } from "@/lib/admin-allowlist";
import { apiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type AdminContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
};

// admin API ルート共通の認証 + 認可チェック。
// 使い方: const auth = await requireAdmin(); if (auth instanceof NextResponse) return auth;
export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  if (!isAllowedAdminEmail(user.email, process.env.ADMIN_EMAILS)) {
    return apiError("Forbidden", 403);
  }

  return { supabase, user };
}
