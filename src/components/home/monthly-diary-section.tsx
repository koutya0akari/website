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
      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">{MONTHLY_DIARY_OVERLINE}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{MONTHLY_DIARY_LABEL}</h2>
        </div>
        <Link
          href="/monthly-diary"
          className="inline-flex w-full justify-center border border-accent/20 bg-accent/10 px-4 py-2 text-sm text-white/85 transition hover:-translate-y-0.5 hover:bg-accent/14 hover:text-accent sm:w-fit"
        >
          日記一覧へ
        </Link>
      </div>

      <div className="relative mt-6 grid gap-5 lg:grid-cols-2">
        {entries.length === 0 ? (
          <div className="rounded-[18px] border border-highlight/20 bg-black/15 p-6 text-sm text-white/62">
            日記を準備中です。
          </div>
        ) : (
          entries.map((entry) => <MonthlyDiaryCard key={entry.id} entry={entry} compact />)
        )}
      </div>
    </JournalSection>
  );
}
