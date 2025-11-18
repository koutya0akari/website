import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { SiteContent } from "@/lib/types";

type ProjectSectionProps = {
  projects: SiteContent["projects"];
};

export function ProjectSection({ projects }: ProjectSectionProps) {
  return (
    <section id="projects" className="space-y-6 rounded-[32px] border border-white/10 bg-night-soft/60 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Projects</p>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">進行中のプロジェクト</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <SpotlightCard key={project.id} className="space-y-3 p-6">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{project.status}</span>
            </div>
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="text-white/70">{project.summary}</p>
            <ul className="text-sm text-white/60">
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
