"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings } from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Diary", href: "/admin/diary", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-night-muted bg-night-soft">
      <div className="flex h-16 items-center border-b border-night-muted px-6">
        <Link href="/admin/dashboard" className="text-xl font-bold text-accent">
          Admin Panel
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-gray-300 hover:bg-night-muted hover:text-gray-100",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-night-muted p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-night-muted hover:text-gray-300"
        >
          ← Back to Site
        </Link>
      </div>
    </aside>
  );
}
