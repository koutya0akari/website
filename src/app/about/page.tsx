import type { Metadata } from "next";

import { Changelog } from "@/components/changelog";
import { GitHubStats } from "@/components/github-stats";
import { FadeIn } from "@/components/motion/fade-in";
import { RichText } from "@/components/rich-text";
import { getAboutContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Akari Math Lab の活動方針とプロフィール。",
};

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      <FadeIn>
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft to-night p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">About</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Akari Math Lab</h1>
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
        <section className="section-card">
          <h2 className="mb-6 text-2xl font-semibold">GitHub アクティビティ</h2>
          <GitHubStats username="koutya0akari" />
        </section>
      </FadeIn>

      {/* Sections */}
      <FadeIn delay={0.2}>
        <section className="section-card space-y-6">
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
        <FadeIn delay={0.3}>
          <section className="section-card">
            <h2 className="text-2xl font-semibold">🛠️ Skills / Tools</h2>
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

      {/* Changelog */}
      <FadeIn delay={0.4}>
        <section className="section-card">
          <h2 className="mb-6 text-2xl font-semibold">📋 サイト変更履歴</h2>
          <Changelog username="koutya0akari" repo="website" />
        </section>
      </FadeIn>
    </div>
  );
}
