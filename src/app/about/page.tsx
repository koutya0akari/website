import type { Metadata } from "next";

import { GitHubStats } from "@/components/github-stats";
import { FadeIn } from "@/components/motion/fade-in";
import { RichText } from "@/components/rich-text";
import { SkillRadar } from "@/components/skill-radar";
import { getAboutContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Akari Math Lab の活動方針とプロフィール。",
};

// Skills data for radar chart
const SKILL_DATA = [
  { name: "代数幾何&数論幾何", level: 55 },
  { name: "可換環論", level: 45 },
  { name: "表現論", level: 30 },
  { name: "圏論", level: 50 },
  { name: "LaTeX", level: 55 },
  { name: "プログラミング", level: 40 },
];

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      <FadeIn>
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft to-night p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">About</p>
          <h1 className="mt-3 text-4xl font-semibold">Akari Math Lab</h1>
          <RichText content={about.intro} className="mt-5 text-lg text-white/80" prose={false} />
          <RichText content={about.mission} className="mt-4 text-white/70" prose={false} />
          {about.quote && (
            <blockquote className="mt-6 border-l-2 border-accent/70 pl-4 text-accent italic">
              <RichText content={about.quote} as="span" inline prose={false} />
            </blockquote>
          )}
        </section>
      </FadeIn>

      {/* GitHub Stats */}
      <FadeIn delay={0.1}>
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-white">GitHub アクティビティ</h2>
          <GitHubStats username="koutya0akari" />
        </section>
      </FadeIn>

      {/* Skill Radar */}
      <FadeIn delay={0.2}>
        <section className="rounded-[32px] border border-white/10 bg-night-soft/70 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-white">専門分野スキル</h2>
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
              <RichText content={section.body} className="text-white/70" prose />
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
