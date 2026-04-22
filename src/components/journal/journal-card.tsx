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
        "group relative h-full overflow-hidden rounded-3xl bg-[linear-gradient(165deg,rgba(8,18,36,0.97),rgba(12,25,47,0.95),rgba(7,13,24,0.98))] shadow-[0_18px_48px_rgba(2,8,20,0.32)] transition duration-200",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(100,210,255,0.16),transparent_34%),radial-gradient(circle_at_86%_0%,rgba(247,181,0,0.1),transparent_28%),linear-gradient(180deg,rgba(13,34,62,0.34),transparent_40%)]" />
      <div className="relative h-full">{children}</div>
    </article>
  );
}
