import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { activityTimeline } from "@/data/home";
import { getActivityByYear, type ActivityYear } from "@/lib/diary-supabase";

type MergedActivity = {
  year: string;
  manualItems: string[];
  diaryItems: { title: string; slug: string; date: string }[];
};

function mergeActivities(
  manual: typeof activityTimeline,
  diary: ActivityYear[]
): MergedActivity[] {
  const yearSet = new Set<string>();

  // 全ての年を収集
  manual.forEach((a) => yearSet.add(a.year));
  diary.forEach((a) => yearSet.add(a.year));

  // 年を降順でソート
  const sortedYears = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));

  return sortedYears.map((year) => {
    const manualActivity = manual.find((a) => a.year === year);
    const diaryActivity = diary.find((a) => a.year === year);

    return {
      year,
      manualItems: manualActivity?.items || [],
      diaryItems: diaryActivity?.items || [],
    };
  });
}

export async function ActivitySection() {
  const diaryActivity = await getActivityByYear();
  const mergedActivities = mergeActivities(activityTimeline, diaryActivity);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-night-soft/80 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(100,210,255,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(247,181,0,0.08),transparent_35%)]" />
        <div className="absolute left-1/2 top-16 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-accent/60 via-white/25 to-transparent lg:block" />
      </div>
      <div className="relative space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Activities</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">近年の活動</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(100,210,255,0.2)]" />
            Diary から自動更新
          </div>
        </div>
        <div className="relative space-y-8">
          {mergedActivities.map((activity, index) => {
            const hasManualItems = activity.manualItems.length > 0;
            const hasDiaryItems = activity.diaryItems.length > 0;

            const card = (
              <SpotlightCard className="h-full p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{activity.year}</h3>
                  <div className="flex gap-2">
                    {hasManualItems && (
                      <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                        Community
                      </span>
                    )}
                    {hasDiaryItems && (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Diary
                      </span>
                    )}
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-white/80">
                  {/* 手動で追加した活動 */}
                  {activity.manualItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {/* Diary から自動取得した活動 */}
                  {activity.diaryItems.slice(0, 5).map((item) => (
                    <li key={item.slug} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <Link
                        href={`/diary/${item.slug}`}
                        className="text-white/80 underline-offset-2 hover:text-white hover:underline"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                  {activity.diaryItems.length > 5 && (
                    <li className="text-xs text-white/50">
                      他 {activity.diaryItems.length - 5} 件の記事
                    </li>
                  )}
                </ul>
              </SpotlightCard>
            );

            return (
              <div key={activity.year} className="relative">
                <div className="hidden items-center gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
                  {index % 2 === 0 ? card : <div className="h-full" />}
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm font-semibold text-white">
                      {activity.year}
                    </div>
                    {index < mergedActivities.length - 1 && <div className="h-16 w-px bg-white/15" />}
                  </div>
                  {index % 2 !== 0 ? card : <div className="h-full" />}
                </div>
                <div className="lg:hidden">{card}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
