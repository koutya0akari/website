import { SpotlightCard } from "@/components/ui/spotlight-card";
import { activityTimeline } from "@/data/home";

export function ActivitySection() {
  return (
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-night-soft/70 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Activities</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">近年の活動</h2>
          <p className="text-sm text-white/70">自主ゼミ、カンファレンス、コミュニティ運営のログ。</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">更新頻度: 学期ごと</span>
      </div>
      <div className="relative space-y-6">
        <div className="absolute left-4 top-2 bottom-4 w-px bg-gradient-to-b from-accent/60 via-white/30 to-transparent" />
        {activityTimeline.map((activity) => (
          <div key={activity.year} className="relative pl-10">
            <div className="absolute left-1.5 top-1.5 h-5 w-5 rounded-full border-2 border-night bg-accent shadow-card" />
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">{activity.year}</h3>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">Math</span>
              </div>
              <ul className="mt-3 space-y-2 text-white/80">
                {activity.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </div>
        ))}
      </div>
    </section>
  );
}
