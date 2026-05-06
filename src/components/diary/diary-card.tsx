import Link from "next/link";

import { JournalCard } from "@/components/journal/journal-card";
import { MATH_DIARY_LABEL, getDiaryDisplayLabel } from "@/lib/diary-labels";
import type { DiaryEntry } from "@/lib/types";
import { createExcerpt, escapeHtml, formatDate } from "@/lib/utils";

type DiaryCardProps = {
  entry: DiaryEntry;
  compact?: boolean;
  hrefBase?: string;
  showViewCount?: boolean;
};

export function DiaryCard({
  entry,
  compact = false,
  hrefBase = "/diary",
  showViewCount = true,
}: DiaryCardProps) {
  const summaryHtml = entry.summary?.trim()
    ? entry.summary
    : `<p>${escapeHtml(createExcerpt(entry.body))}</p>`;
  const viewCountLabel =
    typeof entry.viewCount === "number" && Number.isFinite(entry.viewCount)
      ? `${entry.viewCount.toLocaleString("ja-JP")} PV`
      : null;

  return (
    <JournalCard className="flex flex-col gap-4 p-5 hover:-translate-y-0.5 sm:p-6">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">
          {getDiaryDisplayLabel(entry.folder, MATH_DIARY_LABEL)}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
          <time className="text-sm text-white/60">{formatDate(entry.publishedAt)}</time>
          {showViewCount && (
            <span className="border border-accent/20 bg-accent/10 px-2 py-1 text-[11px] text-white/78">
              {viewCountLabel ?? "PV集計中"}
            </span>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold leading-snug text-white sm:text-xl">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={`${hrefBase}/${entry.slug}` as any} className="hover:text-accent">
            {entry.title}
          </Link>
        </h3>
        <div className="prose-custom prose-preserve-whitespace mt-2 text-white/70" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
      </div>
      {!compact && entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 text-[11px] text-white/60 sm:text-xs">
          {entry.tags.map((tag) => (
            <span key={tag} className="tag-chip border-highlight/20 bg-black/15">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </JournalCard>
  );
}
