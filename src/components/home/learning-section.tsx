import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { LearningTheme } from "@/lib/types";
import { learningThemes as defaultLearningThemes } from "@/data/home";

type LearningSectionProps = {
  learningThemes?: LearningTheme[];
};

export function LearningSection({ learningThemes }: LearningSectionProps) {
  // 動的データがない場合は静的データにフォールバック
  const themes = learningThemes && learningThemes.length > 0 ? learningThemes : defaultLearningThemes.map((t, i) => ({ ...t, id: String(i) }));

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-night-muted/70 via-night/60 to-night-soft/80 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(100,210,255,0.15),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(247,181,0,0.12),transparent_35%)]" />
      </div>
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">Study Map</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">学習テーマ</h2>

        </div>
      </div>
      <div className="relative mt-4 grid auto-rows-[1fr] gap-5 lg:grid-cols-12">
        {themes.map((theme, index) => {
          const spanClass = index % 2 === 0 ? "lg:col-span-7" : "lg:col-span-5";
          return (
            <SpotlightCard
              key={theme.title}
              className={`relative h-full overflow-hidden p-6 ${spanClass} bg-white/5`}
              spotlightColor="rgba(100, 210, 255, 0.25)"
            >
              <div className="absolute -right-14 top-1/2 h-32 w-32 -translate-y-1/2 rotate-12 rounded-full bg-highlight/10 blur-3xl" />
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-white/70">
                  Theme {index + 1}
                </div>
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/50">Study</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{theme.title}</h3>
              <p className="mt-2 text-sm text-white/75">{theme.summary}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                <span className="h-px flex-1 bg-gradient-to-r from-accent/60 via-white/40 to-transparent" />
                <span>Draft → Publish</span>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
