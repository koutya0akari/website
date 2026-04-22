import type { Metadata } from "next";

import { MonthlyDiaryCard } from "@/components/monthly-diary/monthly-diary-card";
import { MONTHLY_DIARY_LABEL } from "@/lib/diary-labels";
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
    <div className="mx-auto max-w-content space-y-10 px-6 py-12">
      <section className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(150deg,rgba(9,17,31,0.98),rgba(13,23,43,0.94))] p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-3 rounded-[30px] border border-white/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(248,214,116,0.14),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(100,210,255,0.16),transparent_36%)]" />
        </div>

        <div className="relative">
          <div>
            <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">{MONTHLY_DIARY_LABEL}</h1>
          </div>
        </div>
      </section>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-night-soft/80 p-8 text-white/60">
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
