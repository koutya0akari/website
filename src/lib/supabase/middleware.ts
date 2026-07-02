import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAllowedAdminEmail } from "@/lib/admin-allowlist";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin");

  // セキュリティ: 環境変数がない場合は /admin/* へのアクセスを拒否
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase environment variables. Authentication middleware will not work.",
    );

    // 管理ルートへのアクセスはブロック（環境変数がないと認証できないため）
    if (isAdminApi) {
      return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
    }
    if (isAdminPage) {
      return new NextResponse("Service Unavailable - Authentication not configured", {
        status: 503
      });
    }

    return NextResponse.next({ request });
  }

  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認可: 認証済みでも ADMIN_EMAILS に含まれなければ管理者ではない（未設定は全員拒否）
  const isAdmin = Boolean(user) && isAllowedAdminEmail(user?.email, process.env.ADMIN_EMAILS);

  // ログインページ: 管理者はダッシュボードにリダイレクト
  if (request.nextUrl.pathname === "/login") {
    if (isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Protected routes: /admin/* は認証 + allowlist 必須
  if (isAdminPage && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // /api/admin/* も同様に保護（各ルートの requireAdmin と二重の防御）
  if (isAdminApi && !isAdmin) {
    return NextResponse.json(
      { error: user ? "Forbidden" : "Unauthorized" },
      { status: user ? 403 : 401 },
    );
  }

  // パス情報をヘッダーに追加（サーバーコンポーネントで使用するため）
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}
