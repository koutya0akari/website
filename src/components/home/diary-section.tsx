import Link from "next/link";

import { DiaryCard } from "@/components/diary/diary-card";
import { JournalSection } from "@/components/journal/journal-section";
import { MATH_DIARY_OVERLINE } from "@/lib/diary-labels";
import type { DiaryEntry } from "@/lib/types";

type DiarySectionProps = {
  diaries: DiaryEntry[];
};

export function DiarySection({ diaries }: DiarySectionProps) {
  return (
    <JournalSection variant="home">
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">{MATH_DIARY_OVERLINE}</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">最近の数学メモ</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/diary"
            className="w-full rounded-full bg-accent/10 px-4 py-2 text-center text-sm text-white/85 transition hover:-translate-y-0.5 hover:bg-accent/14 hover:text-accent sm:w-auto"
          >
            すべて見る
          </Link>
        </div>
      </div>
      <div className="relative mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {diaries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} compact />
        ))}
      </div>
    </JournalSection>
  );
}
