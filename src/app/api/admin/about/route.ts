import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/about - Get about settings
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
      .from("about")
      .select("*")
      .eq("key", "default")
      .maybeSingle();

    if (error) {
      console.error("[API] Failed to fetch about settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    // Return empty object if no settings exist yet
    if (!data) {
      return NextResponse.json({
        data: {
          intro: "",
          mission: "",
          sections: [],
          skills: [],
          quote: "",
        },
      });
    }

    return NextResponse.json({
      data: {
        intro: data.intro || "",
        mission: data.mission || "",
        sections: data.sections || [],
        skills: data.skills || [],
        quote: data.quote || "",
      },
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/about - Update about settings
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
    const { intro, mission, sections, skills, quote } = body;

    // Upsert about settings
    const { data, error } = await supabase
      .from("about")
      .upsert(
        {
          key: "default",
          intro: intro || null,
          mission: mission || null,
          sections: sections || [],
          skills: skills || [],
          quote: quote || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      .select()
      .single();

    if (error) {
      console.error("[API] Failed to update about settings:", error);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

