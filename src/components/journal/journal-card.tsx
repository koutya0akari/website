import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalCardProps = {
  children: ReactNode;
  className?: string;
};

export function JournalCard({ children, className }: JournalCardProps) {
  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-[18px] border border-highlight/20 bg-[linear-gradient(90deg,transparent_0_3.25rem,var(--notebook-margin)_3.25rem_3.32rem,transparent_3.32rem),repeating-linear-gradient(0deg,transparent_0_1.85rem,var(--notebook-line)_1.85rem_1.91rem),rgba(12,27,23,0.68)] shadow-[0_16px_42px_rgba(2,9,7,0.24)] transition duration-200",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_32%)]" />
      <div className="relative h-full">{children}</div>
    </article>
  );
}
