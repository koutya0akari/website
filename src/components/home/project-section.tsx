import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { SiteContent } from "@/lib/types";

type ProjectSectionProps = {
  projects: SiteContent["projects"];
};

export function ProjectSection({ projects }: ProjectSectionProps) {
  return (
    <section id="projects" className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,rgba(100,210,255,0.12),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(247,181,0,0.08),transparent_35%)]" />
      </div>
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Projects</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">進行中のプロジェクト</h2>
          <p className="text-sm text-white/70">資料づくり、ウェブ制作、数理系コミュニティの試みなど。</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/15 px-3 py-1">Labs &amp; Output</span>
          <span className="rounded-full bg-accent/20 px-3 py-1 text-accent">進行中 + 共有予定</span>
        </div>
      </div>
      <div className="relative mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => (
          <SpotlightCard
            key={project.id}
            className="relative h-full space-y-3 overflow-hidden bg-white/5 p-6"
            spotlightColor="rgba(100, 210, 255, 0.2)"
          >
            <div className="absolute -right-14 top-0 h-24 w-24 rotate-12 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/60">
              <span>{project.status || "In progress"}</span>
              <span className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-semibold text-accent">Lab {index + 1}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
            <p className="text-sm text-white/75">{project.summary}</p>
            <div className="space-y-2 text-sm text-white/70">
              {project.highlights.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-highlight" />
                  <span className="rounded-2xl bg-black/20 px-2 py-1">{item}</span>
                </div>
              ))}
            </div>
            {project.link && (
              <SmartLink
                href={project.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:translate-x-0.5"
              >
                詳細へ
                <span aria-hidden>→</span>
              </SmartLink>
            )}
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
