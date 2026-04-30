import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalSectionVariant = "home" | "page" | "listing" | "detail";

type JournalSectionProps = {
  children: ReactNode;
  className?: string;
  variant?: JournalSectionVariant;
};

const variantClasses: Record<JournalSectionVariant, string> = {
  home: "rounded-[22px] p-6 sm:p-8",
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
        "glass-panel relative overflow-hidden shadow-[var(--card-shadow)]",
        variantClasses[variant],
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
}
