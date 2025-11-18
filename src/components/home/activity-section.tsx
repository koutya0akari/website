import { SpotlightCard } from "@/components/ui/spotlight-card";
import { activityTimeline } from "@/data/home";

export function ActivitySection() {
  return (
    <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Activities</p>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">近年の活動</h2>
        <p className="text-white/70">自主ゼミの運営や学会参加の記録です</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {activityTimeline.map((activity) => (
          <SpotlightCard key={activity.year} className="p-6">
            <h3 className="text-xl font-semibold text-accent">{activity.year}</h3>
            <ul className="mt-3 space-y-2 text-white/80">
              {activity.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
