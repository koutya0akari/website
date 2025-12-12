import type { Metadata } from "next";

import { ActivityHeatmap } from "@/components/activity-heatmap";
import { FadeIn } from "@/components/motion/fade-in";
import { SkillRadar } from "@/components/skill-radar";
import { getAboutContent } from "@/lib/content";
import { getDiaryEntries } from "@/lib/diary";

export const metadata: Metadata = {
  title: "About",
  description: "Akari Math Lab の活動方針とプロフィール。",
};

// Skills data for radar chart
const SKILL_DATA = [
  { name: "代数幾何", level: 85 },
  { name: "圏論", level: 90 },
  { name: "ホモロジー代数", level: 75 },
  { name: "数論幾何", level: 70 },
  { name: "LaTeX", level: 95 },
  { name: "プログラミング", level: 80 },
];

export default async function AboutPage() {
  const [about, diaries] = await Promise.all([
    getAboutContent(),
    getDiaryEntries(100), // Get more entries for heatmap
  ]);

  // Generate activity data from diary entries
  const activityData = diaries.map((entry) => ({
    date: entry.publishedAt.split("T")[0],
    count: 1 + Math.floor((entry.viewCount || 0) / 10), // Simple heuristic
  }));

  // Aggregate by date
  const aggregatedActivity = Object.values(
    activityData.reduce(
      (acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { date: item.date, count: 0 };
        }
        acc[item.date].count += item.count;
        return acc;
      },
      {} as Record<string, { date: string; count: number }>
    )
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      <FadeIn>
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft to-night p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">About</p>
          <h1 className="mt-3 text-4xl font-semibold">Akari Math Lab</h1>
          <p className="mt-5 text-lg text-white/80">{about.intro}</p>
          <p className="mt-4 text-white/70">{about.mission}</p>
          {about.quote && (
            <blockquote className="mt-6 border-l-2 border-accent/70 pl-4 text-accent italic">
              &ldquo;{about.quote}&rdquo;
            </blockquote>
          )}
        </section>
      </FadeIn>

      {/* Activity Heatmap */}
      <FadeIn delay={0.1}>
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-white">📊 学習アクティビティ</h2>
          <ActivityHeatmap data={aggregatedActivity} />
        </section>
      </FadeIn>

      {/* Skill Radar */}
      <FadeIn delay={0.2}>
        <section className="rounded-[32px] border border-white/10 bg-night-soft/70 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-white">🎯 専門分野スキル</h2>
          <div className="flex justify-center">
            <SkillRadar skills={SKILL_DATA} size={320} />
          </div>
        </section>
      </FadeIn>

      {/* Sections */}
      <FadeIn delay={0.3}>
        <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8">
          {about.sections.map((section) => (
            <article key={section.heading} className="space-y-2">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              <p className="text-white/70">{section.body}</p>
            </article>
          ))}
        </section>
      </FadeIn>

      {/* Skills Tags */}
      {about.skills.length > 0 && (
        <FadeIn delay={0.4}>
          <section className="rounded-[32px] border border-white/10 bg-night-soft/70 p-8">
            <h2 className="text-2xl font-semibold text-white">🛠️ Skills / Tools</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {about.skills.map((skill) => (
                <span key={skill} className="tag-chip">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
