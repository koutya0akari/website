import type { Metadata } from "next";

import { ActivitySection } from "@/components/home/activity-section";
import { ContactSection } from "@/components/home/contact-section";
import { FocusSection } from "@/components/home/focus-section";
import { HeroSection } from "@/components/home/hero-section";
import { LearningSection } from "@/components/home/learning-section";
import { ProjectSection } from "@/components/home/project-section";
import { SeminarSection } from "@/components/home/seminar-section";
import { WeeklyDiarySection } from "@/components/home/weekly-diary-section";
import { FadeIn } from "@/components/motion/fade-in";
import { directContacts, personalIntro } from "@/data/home";
import { getResourceItems, getSiteContent } from "@/lib/content";
import { getDiaryEntries } from "@/lib/diary";
import { getWeeklyDiaryEntries } from "@/lib/weekly-diary";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.heroTitle,
    description: site.heroLead,
  };
}

export default async function HomePage() {
  const [site, diaries, weeklyDiaries, resources] = await Promise.all([
    getSiteContent(),
    getDiaryEntries(3),
    getWeeklyDiaryEntries(2),
    getResourceItems(3),
  ]);

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
        <main className="relative mx-auto flex max-w-content flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-12">
          <FadeIn>
            <HeroSection site={site} diaries={diaries} />
          </FadeIn>
          <FadeIn delay={0.08}>
            <WeeklyDiarySection entries={weeklyDiaries} />
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
            <ContactSection site={site} resources={resources} />
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
