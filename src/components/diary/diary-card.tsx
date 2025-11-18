import Link from "next/link";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { DiaryEntry } from "@/lib/types";
import { createExcerpt, escapeHtml, formatDate } from "@/lib/utils";

type DiaryCardProps = {
  entry: DiaryEntry;
  compact?: boolean;
};

export function DiaryCard({ entry, compact = false }: DiaryCardProps) {
  const summaryHtml = entry.summary?.trim()
    ? entry.summary
    : `<p>${escapeHtml(createExcerpt(entry.body))}</p>`;

  return (
    <SpotlightCard className="flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-accent/80">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">{entry.folder ?? "Math Diary"}</span>
        <time className="text-sm text-white/60">{formatDate(entry.publishedAt)}</time>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white">
          <Link href={`/diary/${entry.slug}`} className="hover:text-accent">
            {entry.title}
          </Link>
        </h3>
        <div className="prose-custom mt-2 text-white/70" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
      </div>
      {!compact && entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-white/60">
          {entry.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </SpotlightCard>
  );
}
