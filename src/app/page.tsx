import type { Metadata } from "next";

import { ActivitySection } from "@/components/home/activity-section";
import { ContactSection } from "@/components/home/contact-section";
import { DiarySection } from "@/components/home/diary-section";
import { FocusSection } from "@/components/home/focus-section";
import { HeroSection } from "@/components/home/hero-section";
import { LearningSection } from "@/components/home/learning-section";
import { ProjectSection } from "@/components/home/project-section";
import { SeminarSection } from "@/components/home/seminar-section";
import { FadeIn } from "@/components/motion/fade-in";
import { directContacts, personalIntro } from "@/data/home";
import { getDiaryEntries, getResourceItems, getSiteContent } from "@/lib/microcms";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.heroTitle,
    description: site.heroLead,
  };
}

export default async function HomePage() {
  const [site, diaries, resources] = await Promise.all([getSiteContent(), getDiaryEntries(3), getResourceItems(3)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Akari",
    url: "https://akari0koutya.com",
    sameAs: directContacts.map((c) => c.url),
    jobTitle: "Student / Researcher",
    worksFor: {
      "@type": "Organization",
      name: "Tokushima University",
    },
    description: personalIntro.description,
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute right-[-5%] bottom-[-10%] h-72 w-72 rounded-full bg-highlight/15 blur-3xl" />
          <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <main className="relative mx-auto flex max-w-content flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-12">
          <FadeIn>
            <HeroSection site={site} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <FocusSection focuses={site.focuses} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <LearningSection />
          </FadeIn>
          <FadeIn delay={0.1}>
            <SeminarSection />
          </FadeIn>
          <FadeIn delay={0.1}>
            <ActivitySection />
          </FadeIn>
          <FadeIn delay={0.1}>
            <ProjectSection projects={site.projects} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <DiarySection diaries={diaries} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <ContactSection site={site} resources={resources} />
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
