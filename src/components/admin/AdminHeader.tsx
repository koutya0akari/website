"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export function AdminHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-night-muted bg-night-soft px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-100">Content Management</h2>
      </div>

      <div className="flex items-center gap-4">
        {email && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User className="h-4 w-4" />
            <span>{email}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md bg-night-muted px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-night hover:text-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
