import { NextRequest, NextResponse } from "next/server";
import { getSectorKnowledge, getSectorIds, searchJobTitles, getAllSectors } from "@/data";

export const runtime = "edge";

/**
 * GET /api/knowledge
 *
 * Returns Local Knowledge Pack data for Saudi/Gulf job sectors.
 * Used by the frontend for sector-specific suggestions, autocomplete, and insights.
 *
 * Query params:
 *   ?sector=tech|hr|marketing|finance|admin  — returns specific sector
 *   ?search=query&lang=en|ar               — searches job titles
 *   ?sectors=list                           — returns all sector IDs and names
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector");
  const search = searchParams.get("search");
  const lang = searchParams.get("lang") as "en" | "ar" | null;
  const list = searchParams.get("sectors");

  try {
    // List all sectors (lightweight)
    if (list === "list") {
      const all = getAllSectors();
      return NextResponse.json({
        success: true,
        data: all.map((s) => ({
          id: s.id,
          nameEn: s.nameEn,
          nameAr: s.nameAr,
          jobTitleCount: s.jobTitles.length,
          keywordCount: s.keywords.length,
        })),
      });
    }

    // Search job titles
    if (search) {
      const results = searchJobTitles(search, lang || "en");
      return NextResponse.json({
        success: true,
        data: results.slice(0, 20), // max 20 results
        query: search,
      });
    }

    // Get specific sector
    if (sector) {
      const data = getSectorKnowledge(sector);
      if (!data) {
        return NextResponse.json(
          {
            success: false,
            error: `Sector "${sector}" not found. Available: ${getSectorIds().join(", ")}`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data });
    }

    // Default: return all sector IDs
    return NextResponse.json({
      success: true,
      data: {
        sectors: getSectorIds(),
        hint: "Use ?sector=tech to get a specific sector, ?search=query to search job titles, or ?sectors=list for sector summaries.",
      },
    });
  } catch (error: any) {
    console.error("Knowledge API error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
