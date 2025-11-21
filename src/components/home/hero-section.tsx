import { SmartLink } from "@/components/smart-link";
import { personalIntro } from "@/data/home";
import type { SiteContent } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type HeroSectionProps = {
  site: SiteContent;
};

export function HeroSection({ site }: HeroSectionProps) {
  const timelinePreview = site.timeline.slice(0, 4);

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-br from-night via-[#0b1b33] to-night-muted p-6 text-white shadow-card sm:p-8 lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-32 w-32 rounded-full bg-highlight/20 blur-3xl" />
        <div className="absolute inset-6 rounded-[28px] border border-white/5" />
      </div>
      <div className="relative flex flex-col gap-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
          Math Student
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </div>
        <div className="space-y-3">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            {site.heroTitle || "Mathematics as a daily practice"}
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            {site.heroLead ||
              "代数幾何・圏論を軸に、手を動かしながら抽象の手触りを掴むためのノートと資料を公開しています。"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SmartLink
            href={site.heroPrimaryCtaUrl || "/diary"}
            className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-accent/90 hover:scale-[1.02] active:scale-95"
          >
            {site.heroPrimaryCtaLabel || "Math Diary を見る"}
          </SmartLink>
          {site.heroSecondaryCtaLabel && site.heroSecondaryCtaUrl && (
            <SmartLink
              href={site.heroSecondaryCtaUrl}
              className="rounded-full border border-white/25 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-accent hover:text-accent hover:scale-[1.02] active:scale-95"
            >
              {site.heroSecondaryCtaLabel}
            </SmartLink>
          )}
          <div className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 backdrop-blur">
            学部 {personalIntro.details[0]?.value ?? "Math Major"} / {personalIntro.details[1]?.value ?? "Research Notes"}
          </div>
        </div>
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/30 p-5 sm:grid-cols-[1.2fr_1fr] sm:p-6">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">About</p>
            <p className="text-sm leading-relaxed text-white/85">{personalIntro.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-white/70">
              {personalIntro.details.map((detail) => (
                <span key={detail.label} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  {detail.label}: {detail.value}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Signal</p>
            <div className="mt-2 space-y-2 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Weekly log</span>
                <span className="rounded-full bg-accent/20 px-2 py-1 text-[11px] font-semibold text-accent">Math Diary</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Resources</span>
                <span className="text-white/60">講義ノート・スライド</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Focus</span>
                <span className="text-white/60">代数幾何 / 圏論</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative space-y-4 rounded-3xl border border-white/15 bg-black/30 p-5 backdrop-blur sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Timeline</p>
            <h2 className="text-xl font-semibold">最近の足跡</h2>
          </div>
          <span className="rounded-full bg-highlight/20 px-3 py-1 text-xs font-semibold text-highlight">Study</span>
        </div>
        <ul className="space-y-3">
          {timelinePreview.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">{formatDate(item.date)}</p>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs text-white/65">{item.description}</p>
              {item.linkUrl && (
                <SmartLink href={item.linkUrl} className="text-xs text-accent underline underline-offset-4">
                  {item.linkLabel ?? "詳細"}
                </SmartLink>
              )}
            </li>
          ))}
          {timelinePreview.length === 0 && <p className="text-sm text-white/60">アップデートを準備中です。</p>}
        </ul>
      </div>
    </section>
  );
}
