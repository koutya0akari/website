export type CMSImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type FocusArea = {
  id: string;
  title: string;
  description: string;
};

export type ProjectSummary = {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  link?: string;
  status?: string;
};

export type TimelineItem = {
  id: string;
  title: string;
  date: string;
  description?: string;
  linkLabel?: string;
  linkUrl?: string;
};

export type ContactLink = {
  id: string;
  label: string;
  url: string;
};

export type SiteContent = {
  heroTitle: string;
  heroLead: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaUrl?: string;
  focuses: FocusArea[];
  projects: ProjectSummary[];
  timeline: TimelineItem[];
  contactLinks: ContactLink[];
};

export type DiaryEntry = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  folder?: string;
  tags: string[];
  heroImage?: CMSImage;
  publishedAt: string;
  updatedAt?: string;
  viewCount?: number;
};

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  externalUrl?: string;
};

export type AboutSection = {
  heading: string;
  body: string;
};

export type AboutContent = {
  intro: string;
  mission: string;
  sections: AboutSection[];
  skills: string[];
  quote?: string;
};
