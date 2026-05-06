import type { Metadata } from "next";

import { JournalSection } from "@/components/journal/journal-section";
import { MonthlyDiaryCard } from "@/components/monthly-diary/monthly-diary-card";
import { MONTHLY_DIARY_LABEL, MONTHLY_DIARY_OVERLINE } from "@/lib/diary-labels";
import { getMonthlyDiaryEntries } from "@/lib/monthly-diary";

export const metadata: Metadata = {
  title: MONTHLY_DIARY_LABEL,
  description: "月ごとの日記をまとめた一覧ページです。",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function MonthlyDiaryPage() {
  const entries = await getMonthlyDiaryEntries(100);

  return (
    <div className="mx-auto max-w-content space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12">
      <JournalSection variant="page">
        <div className="relative">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{MONTHLY_DIARY_OVERLINE}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-5xl">{MONTHLY_DIARY_LABEL}</h1>
          </div>
        </div>
      </JournalSection>

      {entries.length === 0 ? (
        <div className="glass-panel rounded-[20px] p-5 text-white/62 shadow-[var(--card-shadow)] sm:p-8">
          日記を準備中です。
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {entries.map((entry) => (
            <MonthlyDiaryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
