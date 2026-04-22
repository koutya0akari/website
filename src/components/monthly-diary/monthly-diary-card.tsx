import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { formatMonthlyDiaryLabel, getMonthlyDiarySummary } from "@/lib/monthly-diary-utils";
import type { DiaryEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type MonthlyDiaryCardProps = {
  entry: DiaryEntry;
  compact?: boolean;
};

export function MonthlyDiaryCard({ entry, compact = false }: MonthlyDiaryCardProps) {
  const monthLabel = formatMonthlyDiaryLabel(entry.publishedAt);
  const summary = getMonthlyDiarySummary(entry.summary, entry.body, compact ? 120 : 220);
  const visibleTags = entry.tags.slice(0, compact ? 2 : 4);
  const detailHref = `/monthly-diary/${entry.slug}` as Route;

  return (
    <SpotlightCard
      className={`h-full border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] ${
        compact ? "p-0" : "p-0"
      }`}
      spotlightColor="rgba(100, 210, 255, 0.16)"
    >
      <div className="flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-white/70">
                {monthLabel}
              </span>
              <span>{formatDate(entry.publishedAt, "yyyy.MM.dd")}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className={`${compact ? "text-2xl" : "text-3xl"} font-semibold text-white`}>
            <Link href={detailHref} className="transition hover:text-accent">
              {entry.title}
            </Link>
          </h3>
          <p className={`leading-7 text-white/72 ${compact ? "text-sm" : "text-base"}`}>{summary}</p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-xs text-white/55">
              {visibleTags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
            <Link href={detailHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:gap-2">
              この月を読む
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
