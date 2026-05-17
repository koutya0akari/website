"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Menu, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email || null);
    });
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-night-muted bg-night-soft px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-night-muted text-gray-300 hover:bg-night-muted hover:text-gray-100 md:hidden"
            aria-label="Open admin navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="truncate text-base font-semibold text-gray-100 sm:text-lg">
            Content Management
          </h2>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
          {email && (
            <div className="hidden min-w-0 items-center gap-2 text-sm text-gray-400 sm:flex">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-md bg-night-muted px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-night hover:text-gray-100 sm:px-4"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close admin navigation"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-night-soft shadow-2xl">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-md border border-night-muted text-gray-300 hover:bg-night-muted hover:text-gray-100"
              aria-label="Close admin navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <AdminSidebar
              onNavigate={() => setIsMenuOpen(false)}
              className="h-full w-full border-r-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
