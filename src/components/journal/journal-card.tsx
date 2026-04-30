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
        "group relative h-full overflow-hidden rounded-[18px] border border-highlight/20 bg-[var(--glass-bg)] shadow-[0_16px_42px_rgba(2,9,7,0.24)] backdrop-blur transition duration-200",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%)]" />
      <div className="relative h-full">{children}</div>
    </article>
  );
}
