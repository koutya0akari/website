import { SpotlightCard } from "@/components/ui/spotlight-card";
import { activityTimeline } from "@/data/home";
import { getGitHubActivityByYear, type GitHubActivityYear, type GitHubCommit } from "@/lib/github";
import { getSiteContent } from "@/lib/content-supabase";
import type { ActivityItem } from "@/lib/types";

type MergedActivity = {
  year: string;
  manualItems: string[];
  commits: GitHubCommit[];
};

type ManualActivity = {
  year: string;
  items: string[];
};

function mergeActivities(
  manual: ManualActivity[],
  github: GitHubActivityYear[]
): MergedActivity[] {
  const yearSet = new Set<string>();

  // 全ての年を収集
  manual.forEach((a) => yearSet.add(a.year));
  github.forEach((a) => yearSet.add(a.year));

  // 年を降順でソート
  const sortedYears = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));

  return sortedYears.map((year) => {
    const manualActivity = manual.find((a) => a.year === year);
    const githubActivity = github.find((a) => a.year === year);

    return {
      year,
      manualItems: manualActivity?.items || [],
      commits: githubActivity?.commits || [],
    };
  });
}

export async function ActivitySection() {
  const [siteContent, githubActivity] = await Promise.all([
    getSiteContent(),
    getGitHubActivityByYear(),
  ]);
  
  // データベースに活動データがあればそちらを使用、なければ静的データを使用
  const manualActivities: ManualActivity[] = 
    siteContent.activities && siteContent.activities.length > 0
      ? siteContent.activities.map((a: ActivityItem) => ({ year: a.year, items: a.items }))
      : activityTimeline;
  
  const mergedActivities = mergeActivities(manualActivities, githubActivity);

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-transparent bg-night-soft/80 p-5 sm:rounded-[32px] sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[22px] border border-transparent sm:rounded-[28px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(100,210,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(247,181,0,0.06),transparent_35%)] sm:bg-[radial-gradient(circle_at_20%_20%,rgba(100,210,255,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(247,181,0,0.08),transparent_35%)]" />
        <div className="absolute left-1/2 top-16 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-accent/60 via-white/25 to-transparent lg:block" />
      </div>
      <div className="relative space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Activities</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">近年の活動</h2>
          </div>
        </div>
        <div className="relative space-y-8">
          {mergedActivities.map((activity, index) => {
            const card = (
              <SpotlightCard className="h-full p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold text-white">{activity.year}</h3>
                </div>
                <ul className="mt-3 space-y-2 text-white/80">
                  {/* 手動で追加した活動 */}
                  {activity.manualItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {/* GitHub コミット */}
                  {activity.commits.slice(0, 3).map((commit) => (
                    <li key={commit.sha} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 underline-offset-2 hover:text-white hover:underline"
                      >
                        <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-xs">
                          {commit.sha.slice(0, 7)}
                        </code>{" "}
                        {commit.message.length > 50
                          ? commit.message.slice(0, 50) + "..."
                          : commit.message}
                      </a>
                    </li>
                  ))}
                  {activity.commits.length > 3 && (
                    <li className="text-xs text-white/50">
                      他 {activity.commits.length - 3} 件のコミット
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-black/40 text-sm font-semibold text-white">
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
