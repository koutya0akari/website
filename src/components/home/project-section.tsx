import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { SiteContent } from "@/lib/types";

type ProjectSectionProps = {
  projects: SiteContent["projects"];
};

export function ProjectSection({ projects }: ProjectSectionProps) {
  return (
    <section id="projects" className="space-y-6 rounded-[30px] border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Projects</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">進行中のプロジェクト</h2>
          <p className="text-sm text-white/70">資料づくり、ウェブ制作、数理系コミュニティの試みなど。</p>
        </div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">Labs & Output</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <SpotlightCard key={project.id} className="space-y-3 p-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/60">
              <span>{project.status || "In progress"}</span>
              <span className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-semibold text-accent">Math Lab</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
            <p className="text-sm text-white/75">{project.summary}</p>
            <ul className="text-sm text-white/70">
              {project.highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            {project.link && (
              <SmartLink href={project.link} className="text-sm text-accent underline underline-offset-4">
                詳細へ
              </SmartLink>
            )}
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
