import { SmartLink } from "@/components/smart-link";
import { RichText } from "@/components/rich-text";
import { personalIntro as defaultPersonalIntro } from "@/data/home";
import { MATH_DIARY_OVERLINE } from "@/lib/diary-labels";
import type { SiteContent, DiaryEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type HeroSectionProps = {
  site: SiteContent;
  diaries: DiaryEntry[];
};

export function HeroSection({ site, diaries }: HeroSectionProps) {
  const timelinePreview = diaries.slice(0, 4);
  
  // 動的データがない場合は静的データにフォールバック
  const profile = site.profile && site.profile.description
    ? site.profile
    : {
        description: defaultPersonalIntro.description,
        details: defaultPersonalIntro.details.map((d, i) => ({ ...d, id: String(i) })),
      };

  return (
    <section className="glass-panel rounded-[22px] p-5 text-white shadow-[var(--card-shadow)] sm:p-7 lg:p-9">
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-7">
          <div className="space-y-3">
            <RichText
              content={
                site.heroLead ||
                "代数幾何・圏論を軸に学習しています。数学ノートやメモなどの保管場所。"
              }
              className="max-w-2xl text-lg text-white/80"
              prose={false}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SmartLink
              href={site.heroPrimaryCtaUrl || "/diary"}
              className="bg-accent px-6 py-3 text-center text-sm font-semibold text-black shadow-[0_10px_30px_rgba(97,227,186,0.28)] transition hover:-translate-y-0.5 hover:bg-accent/90 active:translate-y-0"
            >
              {site.heroPrimaryCtaLabel || "数学メモを見る"}
            </SmartLink>
          {site.heroSecondaryCtaLabel && site.heroSecondaryCtaUrl && (
            <SmartLink
              href={site.heroSecondaryCtaUrl}
              className="border border-highlight/30 px-6 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent active:translate-y-0"
            >
              {site.heroSecondaryCtaLabel}
            </SmartLink>
          )}
        </div>
          <div className="grid gap-4">
            <div className="relative overflow-hidden border border-highlight/20 bg-black/20 p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Profile</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/85">{profile.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {profile.details.map((detail) => (
                  <span key={detail.id || detail.label} className="inline-flex items-center gap-1.5 border border-highlight/20 bg-white/5 px-3 py-1">
                    <span className="bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">{detail.label}</span>
                    <span className="text-white/90">{detail.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="relative space-y-4 overflow-hidden border border-highlight/20 bg-black/20 p-5 backdrop-blur sm:p-6">
          <div className="relative flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">{MATH_DIARY_OVERLINE}</p>
              <h2 className="text-xl font-semibold">最近の足跡</h2>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-1 bottom-1 w-px bg-gradient-to-b from-accent/70 via-accent/20 to-transparent" />
            <ul className="space-y-4">
              {timelinePreview.map((entry, index) => (
                <li
                  key={entry.id}
                  className="relative overflow-hidden border border-accent/15 bg-[#081410]/85 p-4 pl-12 shadow-[0_10px_30px_rgba(4,11,22,0.28)]"
                >
                  <div className="absolute left-3 top-5 flex h-6 w-6 items-center justify-center border border-accent/35 bg-black/70">
                    <span className="h-2 w-2 bg-accent shadow-[0_0_0_6px_rgba(97,227,186,0.18)]" />
                  </div>
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">{formatDate(entry.publishedAt)}</p>
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="text-xs text-white/65">{entry.summary}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-white/80">
                        PV {entry.viewCount ?? 0}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">#{index + 1}</span>
                    </div>
                  </div>
                  <SmartLink
                    href={`/diary/${entry.slug}`}
                    className="relative mt-2 inline-flex text-xs text-accent underline underline-offset-4"
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
