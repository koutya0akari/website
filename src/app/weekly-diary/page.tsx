import type { Metadata } from "next";

import { DiaryCard } from "@/components/diary/diary-card";
import { getWeeklyDiaryEntries } from "@/lib/weekly-diary";

export const metadata: Metadata = {
  title: "Weekly Diary",
  description: "週間日記の一覧ページです。",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function WeeklyDiaryPage() {
  const entries = await getWeeklyDiaryEntries(100);

  return (
    <div className="mx-auto max-w-content px-6 py-12 space-y-10">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft to-night p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weekly Diary</p>
        <h1 className="mt-3 text-4xl font-semibold">Weekly Diary</h1>
        <p className="mt-3 text-lg text-white/70">1週間のまとめやメモを残すコーナー。</p>
      </section>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-night-soft p-8 text-white/60">
          週間日記を準備中です。
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <DiaryCard key={entry.id} entry={entry} hrefBase="/weekly-diary" showViewCount={false} />
          ))}
        </div>
      )}
    </div>
  );
}

