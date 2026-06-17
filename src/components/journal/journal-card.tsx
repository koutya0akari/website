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
        "group relative h-full overflow-hidden rounded-[18px] border border-highlight/20 bg-[var(--glass-bg)] transition duration-200",
        className,
      )}
    >
      <div className="relative h-full">{children}</div>
    </article>
  );
}
