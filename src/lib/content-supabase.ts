import "server-only";

import type { AboutContent, ResourceItem, SiteContent } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

const SITE_KEY = "default";
const ABOUT_KEY = "default";

type SiteRow = {
  key: string;
  hero_title: string;
  hero_lead: string;
  hero_primary_cta_label: string;
  hero_primary_cta_url: string;
  hero_secondary_cta_label: string | null;
  hero_secondary_cta_url: string | null;
  focuses: unknown;
  projects: unknown;
  timeline: unknown;
  contact_links: unknown;
  updated_at: string;
};

type AboutRow = {
  key: string;
  intro: string;
  mission: string;
  sections: unknown;
  skills: string[] | null;
  quote: string | null;
  updated_at: string;
};

type ResourceRow = {
  id: string;
  microcms_id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  external_url: string | null;
  updated_at: string;
};

function asArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site").select("*").eq("key", SITE_KEY).maybeSingle();

  if (error || !data) {
    if (error) console.error("[Supabase] Failed to fetch site content:", error);
    return {
      heroTitle: "",
      heroLead: "",
      heroPrimaryCtaLabel: "",
      heroPrimaryCtaUrl: "",
      heroSecondaryCtaLabel: undefined,
      heroSecondaryCtaUrl: undefined,
      focuses: [],
      projects: [],
      timeline: [],
      contactLinks: [],
    };
  }

  const row = data as SiteRow;
  return {
    heroTitle: row.hero_title,
    heroLead: row.hero_lead,
    heroPrimaryCtaLabel: row.hero_primary_cta_label,
    heroPrimaryCtaUrl: row.hero_primary_cta_url,
    heroSecondaryCtaLabel: row.hero_secondary_cta_label ?? undefined,
    heroSecondaryCtaUrl: row.hero_secondary_cta_url ?? undefined,
    focuses: asArray(row.focuses),
    projects: asArray(row.projects),
    timeline: asArray(row.timeline),
    contactLinks: asArray(row.contact_links),
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("about").select("*").eq("key", ABOUT_KEY).maybeSingle();

  if (error || !data) {
    if (error) console.error("[Supabase] Failed to fetch about content:", error);
    return { intro: "", mission: "", sections: [], skills: [], quote: undefined };
  }

  const row = data as AboutRow;
  return {
    intro: row.intro,
    mission: row.mission,
    sections: asArray(row.sections),
    skills: row.skills ?? [],
    quote: row.quote ?? undefined,
  };
}

export async function getResourceItems(limit = 100): Promise<ResourceItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Supabase] Failed to fetch resources:", error);
    return [];
  }

  return ((data as ResourceRow[]) ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    fileUrl: row.file_url,
    externalUrl: row.external_url ?? undefined,
  }));
}


