import { SpotlightCard } from "@/components/ui/spotlight-card";
import { learningThemes } from "@/data/home";

export function LearningSection() {
  return (
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-gradient-to-br from-night-muted/70 via-night/60 to-night-soft/80 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">Study Map</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">学習テーマ</h2>
          <p className="text-sm text-white/70">今の興味と、次に繋げたい抽象のラインを週次で更新。</p>
        </div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">ノート化 → 公開を目標</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {learningThemes.map((theme) => (
          <SpotlightCard key={theme.title} className="relative overflow-hidden p-6">
            <div className="absolute right-3 top-3 h-10 w-10 rounded-full bg-highlight/15 blur-xl" />
            <h3 className="text-lg font-semibold text-white">{theme.title}</h3>
            <p className="mt-2 text-sm text-white/75">{theme.summary}</p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
