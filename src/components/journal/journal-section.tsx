import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalSectionVariant = "home" | "page" | "listing" | "detail";

type JournalSectionProps = {
  children: ReactNode;
  className?: string;
  variant?: JournalSectionVariant;
};

const variantClasses: Record<JournalSectionVariant, string> = {
  home: "rounded-[36px] p-6 sm:p-8",
  page: "rounded-[36px] p-8 sm:p-10",
  listing: "rounded-[32px] p-8",
  detail: "rounded-[32px] p-8 sm:p-9",
};

export function JournalSection({
  children,
  className,
  variant = "home",
}: JournalSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(150deg,rgba(7,16,31,0.98),rgba(11,24,44,0.96),rgba(7,14,28,0.99))] shadow-[0_28px_80px_rgba(2,8,20,0.24)]",
        variantClasses[variant],
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(247,181,0,0.1),transparent_32%),radial-gradient(circle_at_84%_0%,rgba(100,210,255,0.18),transparent_38%),linear-gradient(120deg,rgba(12,31,57,0.36),transparent_24%,transparent_72%,rgba(247,181,0,0.04))]" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent/12 blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}
