import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/site - Get site settings
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("site")
      .select("*")
      .eq("key", "default")
      .maybeSingle();

    if (error) {
      console.error("[API] Failed to fetch site settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    // Return empty object if no settings exist yet
    if (!data) {
      return NextResponse.json({
        data: {
          heroTitle: "",
          heroLead: "",
          heroPrimaryCtaLabel: "",
          heroPrimaryCtaUrl: "",
          heroSecondaryCtaLabel: "",
          heroSecondaryCtaUrl: "",
          focuses: [],
          projects: [],
          timeline: [],
          contactLinks: [],
        },
      });
    }

    return NextResponse.json({
      data: {
        heroTitle: data.hero_title || "",
        heroLead: data.hero_lead || "",
        heroPrimaryCtaLabel: data.hero_primary_cta_label || "",
        heroPrimaryCtaUrl: data.hero_primary_cta_url || "",
        heroSecondaryCtaLabel: data.hero_secondary_cta_label || "",
        heroSecondaryCtaUrl: data.hero_secondary_cta_url || "",
        focuses: data.focuses || [],
        projects: data.projects || [],
        timeline: data.timeline || [],
        contactLinks: data.contact_links || [],
      },
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/site - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      heroTitle,
      heroLead,
      heroPrimaryCtaLabel,
      heroPrimaryCtaUrl,
      heroSecondaryCtaLabel,
      heroSecondaryCtaUrl,
      focuses,
      projects,
      timeline,
      contactLinks,
    } = body;

    // Atomic upsert - NOT NULL カラムには空文字列をデフォルト値として使用
    const { data, error } = await supabase
      .from("site")
      .upsert(
        {
          key: "default",
          hero_title: heroTitle || "",
          hero_lead: heroLead || "",
          hero_primary_cta_label: heroPrimaryCtaLabel || "",
          hero_primary_cta_url: heroPrimaryCtaUrl || "",
          hero_secondary_cta_label: heroSecondaryCtaLabel || "",
          hero_secondary_cta_url: heroSecondaryCtaUrl || "",
          focuses: focuses || [],
          projects: projects || [],
          timeline: timeline || [],
          contact_links: contactLinks || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to update site settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

