import { SmartLink } from "@/components/smart-link";
import { personalIntro } from "@/data/home";
import type { SiteContent } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type HeroSectionProps = {
  site: SiteContent;
};

export function HeroSection({ site }: HeroSectionProps) {
  return (
    <section className="grid gap-8 rounded-[32px] border border-white/15 bg-gradient-to-br from-night via-night-soft to-night-muted p-6 text-white sm:p-8 lg:grid-cols-[1fr_0.9fr] xl:gap-12">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Akari Math Lab</p>
        <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">{site.heroTitle}</h1>
        <p className="text-lg text-white/80">{site.heroLead}</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <SmartLink
            href={site.heroPrimaryCtaUrl}
            className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-accent/90 hover:scale-105 active:scale-95"
          >
            {site.heroPrimaryCtaLabel}
          </SmartLink>
          {site.heroSecondaryCtaLabel && site.heroSecondaryCtaUrl && (
            <SmartLink
              href={site.heroSecondaryCtaUrl}
              className="rounded-full border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white hover:scale-105 active:scale-95"
            >
              {site.heroSecondaryCtaLabel}
            </SmartLink>
          )}
        </div>
        <div className="rounded-2xl border border-accent/30 bg-black/20 p-5 text-sm text-white/80 sm:p-6">
          <h2 className="text-lg font-semibold text-white">自己紹介</h2>
          <p className="mt-2 text-white/80">{personalIntro.description}</p>
          <dl className="mt-4 space-y-2 text-white">
            {personalIntro.details.map((detail) => (
              <div key={detail.label} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="text-xs uppercase tracking-[0.3em] text-white/60">{detail.label}</dt>
                <dd className="text-sm text-white">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="space-y-4 rounded-3xl border border-white/15 bg-black/20 p-5 sm:p-6">
        <ul className="grid gap-4 sm:grid-cols-2">
          {site.timeline.slice(0, 4).map((item) => (
            <li key={item.id} className="border-l-2 border-accent pl-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{formatDate(item.date)}</p>
              <p className="text-base font-semibold text-white">{item.title}</p>
              <p className="text-sm text-white/70">{item.description}</p>
              {item.linkUrl && (
                <SmartLink href={item.linkUrl} className="text-sm text-accent underline underline-offset-4">
                  {item.linkLabel ?? "詳細"}
                </SmartLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
