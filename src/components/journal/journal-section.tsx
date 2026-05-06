import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalSectionVariant = "home" | "page" | "listing" | "detail";

type JournalSectionProps = {
  children: ReactNode;
  className?: string;
  variant?: JournalSectionVariant;
};

const variantClasses: Record<JournalSectionVariant, string> = {
  home: "rounded-[22px] p-5 sm:p-8",
  page: "rounded-[22px] p-5 sm:rounded-[36px] sm:p-10",
  listing: "rounded-[22px] p-5 sm:rounded-[32px] sm:p-8",
  detail: "rounded-[22px] p-5 sm:rounded-[32px] sm:p-9",
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
