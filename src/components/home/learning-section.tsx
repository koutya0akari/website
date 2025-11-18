import { SpotlightCard } from "@/components/ui/spotlight-card";
import { learningThemes } from "@/data/home";

export function LearningSection() {
  return (
    <section className="space-y-6 rounded-[32px] border border-white/10 bg-night-muted/50 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Learning Focus</p>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">学習テーマ</h2>
        <p className="text-white/70">現在集中しているトピックを、簡単なメモとして整理しました。</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {learningThemes.map((theme) => (
          <SpotlightCard key={theme.title} className="p-6">
            <h3 className="text-xl font-semibold text-white">{theme.title}</h3>
            <p className="mt-2 text-white/75">{theme.summary}</p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
