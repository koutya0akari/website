import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ToastProvider } from "@/components/admin/ToastProvider";

// Note: 認証保護は middleware.ts (src/lib/supabase/middleware.ts) で実装
// /admin/* ルートは全て認証が必要
// 未認証ユーザーは自動的に /login にリダイレクトされる

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-night">
        <AdminSidebar className="sticky top-0 hidden h-screen shrink-0 md:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
