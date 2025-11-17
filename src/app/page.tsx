import Link from "next/link";

import { DiaryCard } from "@/components/diary/diary-card";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { getDiaryEntries, getResourceItems, getSiteContent } from "@/lib/microcms";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [site, diaries, resources] = await Promise.all([getSiteContent(), getDiaryEntries(3), getResourceItems(3)]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-content flex-col gap-10 px-6 py-12">
        <section className="grid gap-8 rounded-[32px] border border-white/15 bg-gradient-to-br from-night via-night-soft to-night-muted p-8 text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Akari Math Lab</p>
            <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">{site.heroTitle}</h1>
            <p className="text-lg text-white/80">{site.heroLead}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={site.heroPrimaryCtaUrl}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-accent/90"
              >
                {site.heroPrimaryCtaLabel}
              </Link>
              {site.heroSecondaryCtaLabel && site.heroSecondaryCtaUrl && (
                <Link
                  href={site.heroSecondaryCtaUrl}
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white"
                >
                  {site.heroSecondaryCtaLabel}
                </Link>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              <p className="text-white text-base font-semibold">{site.profile.name}</p>
              <p>{site.profile.role}</p>
              <p className="mt-2">{site.profile.summary}</p>
              {site.profile.location && <p className="mt-1 text-white/50">{site.profile.location}</p>}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/15 bg-black/20 p-6">
            <h2 className="text-xl font-semibold text-white">活動記録</h2>
            <ul className="space-y-4">
              {site.timeline.slice(0, 4).map((item) => (
                <li key={item.id} className="border-l-2 border-accent pl-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{formatDate(item.date)}</p>
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-white/70">{item.description}</p>
                  {item.linkUrl && (
                    <Link href={item.linkUrl} className="text-sm text-accent underline underline-offset-4">
                      {item.linkLabel ?? "詳細"}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {site.focuses.length > 0 && (
          <section id="focus" className="grid gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 md:grid-cols-3">
            {site.focuses.map((focus) => (
              <article key={focus.id} className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-accent">{focus.id}</p>
                <h3 className="text-xl font-semibold">{focus.title}</h3>
                <p className="text-white/70">{focus.description}</p>
              </article>
            ))}
          </section>
        )}

        <section id="projects" className="space-y-6 rounded-[32px] border border-white/10 bg-night-soft/60 p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Projects</p>
            <h2 className="text-3xl font-semibold text-white">進行中のプロジェクト</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {site.projects.map((project) => (
              <article key={project.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>{project.status}</span>
                </div>
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <p className="text-white/70">{project.summary}</p>
                <ul className="text-sm text-white/60">
                  {project.highlights.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                {project.link && (
                  <Link href={project.link} className="text-sm text-accent underline underline-offset-4">
                    詳細へ
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Diary</p>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-3xl font-semibold">最近の学習記録</h2>
              <Link href="/diary" className="text-sm text-accent underline-offset-4 hover:underline">
                全て見る
              </Link>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {diaries.map((entry) => (
              <DiaryCard key={entry.id} entry={entry} compact />
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-[32px] border border-white/10 bg-night-soft/50 p-8 md:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Resources</p>
            <h2 className="text-3xl font-semibold">公開資料</h2>
            <ResourceGrid resources={resources} />
            <Link href="/resources" className="inline-block text-sm text-accent underline underline-offset-4">
              その他の資料を見る
            </Link>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Contact</h3>
            <p className="text-white/70">コラボ・取材・登壇依頼などは下記よりお気軽にどうぞ。</p>
            <div className="flex flex-wrap gap-3">
              {site.contactLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-accent hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
