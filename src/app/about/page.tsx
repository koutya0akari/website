import type { Metadata } from "next";

import { getAboutContent } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "About",
  description: "Akari Math Lab の活動方針とプロフィール。",
};

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft to-night p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">About</p>
        <h1 className="mt-3 text-4xl font-semibold">Akari Math Lab</h1>
        <p className="mt-5 text-lg text-white/80">{about.intro}</p>
        <p className="mt-4 text-white/70">{about.mission}</p>
        {about.quote && <blockquote className="mt-6 border-l-2 border-accent/70 pl-4 text-accent">{about.quote}</blockquote>}
      </section>
      <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8">
        {about.sections.map((section) => (
          <article key={section.heading} className="space-y-2">
            <h2 className="text-2xl font-semibold">{section.heading}</h2>
            <p className="text-white/70">{section.body}</p>
          </article>
        ))}
      </section>
      {about.skills.length > 0 && (
        <section className="rounded-[32px] border border-white/10 bg-night-soft/70 p-8">
          <h2 className="text-2xl font-semibold text-white">Skills / Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {about.skills.map((skill) => (
              <span key={skill} className="tag-chip">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
