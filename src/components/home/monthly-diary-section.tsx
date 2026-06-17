import Link from "next/link";

import { JournalSection } from "@/components/journal/journal-section";
import { MonthlyDiaryCard } from "@/components/monthly-diary/monthly-diary-card";
import { MONTHLY_DIARY_LABEL, MONTHLY_DIARY_OVERLINE } from "@/lib/diary-labels";
import type { DiaryEntry } from "@/lib/types";

type MonthlyDiarySectionProps = {
  entries: DiaryEntry[];
};

export function MonthlyDiarySection({ entries }: MonthlyDiarySectionProps) {
  return (
    <JournalSection variant="home">
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">{MONTHLY_DIARY_OVERLINE}</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{MONTHLY_DIARY_LABEL}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/monthly-diary"
            className="w-full rounded-full bg-accent/10 px-4 py-2 text-center text-sm text-white/85 transition-colors hover:bg-accent/15 hover:text-accent sm:w-auto"
          >
            すべて見る
          </Link>
        </div>
      </div>

      <div className="relative mt-4 grid gap-5 lg:grid-cols-2">
        {entries.length === 0 ? (
          <div className="rounded-[18px] border border-highlight/20 bg-night p-6 text-sm text-white/62">
            日記を準備中です。
          </div>
        ) : (
          entries.map((entry) => <MonthlyDiaryCard key={entry.id} entry={entry} compact />)
        )}
      </div>
    </JournalSection>
  );
}
