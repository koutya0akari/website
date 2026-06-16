import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { SeminarTheme } from "@/lib/types";
import { seminarThemes as defaultSeminarThemes } from "@/data/home";

type SeminarSectionProps = {
  seminars?: SeminarTheme[];
};

export function SeminarSection({ seminars }: SeminarSectionProps) {
  // 動的データがない場合は静的データにフォールバック
  const themes = seminars && seminars.length > 0 ? seminars : defaultSeminarThemes.map((t, i) => ({ ...t, id: String(i) }));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-night-soft p-5 sm:p-8">
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Seminars</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">自主ゼミのテーマ</h2>
        </div>
      </div>
      <div className="relative mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => (
          <SpotlightCard
            key={theme.title}
            className="relative h-full space-y-3 overflow-hidden bg-white/5 p-5 sm:p-6"
          >
            <div className="relative space-y-2">
              <h3 className="text-lg font-semibold text-white">{theme.title}</h3>
              <p className="text-sm text-white/75">{theme.summary}</p>
            </div>
            {theme.references && (
              <div className="relative space-y-2 border-t border-transparent pt-2 text-xs">
                <p className="text-white/60">References</p>
                <div className="flex flex-wrap gap-2">
                  {theme.references.map((ref) => (
                    <SmartLink
                      key={ref.url}
                      href={ref.url}
                      className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-accent underline-offset-4 hover:underline"
                    >
                      {ref.label}
                    </SmartLink>
                  ))}
                </div>
              </div>
            )}
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
