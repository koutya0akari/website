import { SmartLink } from "@/components/smart-link";
import { personalIntro } from "@/data/home";
import type { SiteContent, DiaryEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type HeroSectionProps = {
  site: SiteContent;
  diaries: DiaryEntry[];
};

export function HeroSection({ site, diaries }: HeroSectionProps) {
  const timelinePreview = diaries.slice(0, 4);

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/15 bg-gradient-to-br from-night via-[#0b1528] to-night-muted p-6 text-white shadow-card sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-2 rounded-[36px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(100,210,255,0.18),transparent_35%),radial-gradient(circle_at_82%_0%,rgba(247,181,0,0.17),transparent_32%),linear-gradient(120deg,rgba(255,255,255,0.06),transparent_35%)]" />
        <div className="absolute inset-4 rounded-[30px] bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px]" />
        <div className="absolute -right-28 bottom-10 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -left-16 top-6 h-56 w-56 rounded-full bg-highlight/20 blur-[90px]" />
      </div>
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.4em]">
              Math Student
            </span>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-accent/40 blur-[2px]" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>Tokushima University / Algebraic Geometry &amp; Category</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/70">
              Research Log
              <span className="h-1 w-1 rounded-full bg-highlight shadow-[0_0_0_4px_rgba(247,181,0,0.2)]" />
            </div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              {site.heroTitle || "Mathematics as a daily practice"}
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              {site.heroLead ||
                "代数幾何・圏論を軸に学習しています。数学ノートやメモなどの保管場所。"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SmartLink
              href={site.heroPrimaryCtaUrl || "/diary"}
              className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-black shadow-[0_10px_30px_rgba(100,210,255,0.35)] transition hover:-translate-y-0.5 hover:bg-accent/90 active:translate-y-0"
            >
              {site.heroPrimaryCtaLabel || "Math Diary を見る"}
            </SmartLink>
          {site.heroSecondaryCtaLabel && site.heroSecondaryCtaUrl && (
            <SmartLink
              href={site.heroSecondaryCtaUrl}
              className="rounded-full border border-white/25 px-6 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent active:translate-y-0"
            >
              {site.heroSecondaryCtaLabel}
            </SmartLink>
          )}
          <div className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 backdrop-blur">
            {site.heroSecondaryCtaLabel ? "Research Notes" : "Math Diary"}
          </div>
        </div>
          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-5 sm:p-6">
              <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-accent/10 blur-2xl" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Profile</p>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{personalIntro.description}</p>
              <p className="mt-4 text-xs text-white/75">
                {personalIntro.details.map((detail, index) => (
                  <span key={detail.label} className="inline-flex items-center gap-1">
                    <span className="text-white/60">{detail.label}:</span>
                    <span className="text-white">{detail.value}</span>
                    {index < personalIntro.details.length - 1 && <span className="mx-2 text-white/35">/</span>}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
        <div className="relative space-y-4 overflow-hidden rounded-[28px] border border-white/15 bg-black/30 p-5 backdrop-blur sm:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-4 rounded-[22px] border border-white/5" />
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
          </div>
          <div className="relative flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Math Diary</p>
              <h2 className="text-xl font-semibold">最近の足跡（Math Diary）</h2>
            </div>
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">Diary</span>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-1 bottom-1 w-px bg-gradient-to-b from-accent/70 via-white/40 to-transparent" />
            <ul className="space-y-4">
              {timelinePreview.map((entry, index) => (
                <li
                  key={entry.id}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-4 pl-12 shadow-[0_10px_30px_rgba(4,11,22,0.4)]"
                >
                  <div className="absolute left-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/70">
                    <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_6px_rgba(100,210,255,0.18)]" />
                    <span className="absolute -z-10 h-10 w-10 rounded-full bg-accent/10 blur-2xl" />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">{formatDate(entry.publishedAt)}</p>
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="text-xs text-white/65">{entry.summary}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
                        PV {entry.viewCount ?? 0}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">#{index + 1}</span>
                    </div>
                  </div>
                  <SmartLink
                    href={`/diary/${entry.slug}`}
                    className="mt-2 inline-flex text-xs text-accent underline underline-offset-4"
                  >
                    詳細
                  </SmartLink>
                </li>
              ))}
              {timelinePreview.length === 0 && <p className="text-sm text-white/60">学習記録を準備中です。</p>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
