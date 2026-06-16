import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalSectionVariant = "home" | "page" | "listing" | "detail";

type JournalSectionProps = {
  children: ReactNode;
  className?: string;
  variant?: JournalSectionVariant;
};

const variantClasses: Record<JournalSectionVariant, string> = {
  home: "rounded-2xl p-5 sm:p-8",
  page: "rounded-2xl p-5 sm:p-10",
  listing: "rounded-2xl p-5 sm:p-8",
  detail: "rounded-2xl p-5 sm:p-9",
};

export function JournalSection({
  children,
  className,
  variant = "home",
}: JournalSectionProps) {
  return (
    <section
      className={cn(
        "glass-panel relative overflow-hidden",
        variantClasses[variant],
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
}
