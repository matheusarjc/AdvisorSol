import { NextResponse } from "next/server";

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const seriesId = searchParams.get("series_id");
  const limit = searchParams.get("limit") || "1";
  const sortOrder = searchParams.get("sort_order") || "desc";

  if (!seriesId) {
    return NextResponse.json({ error: "Missing series_id parameter" }, { status: 400 });
  }

  if (!FRED_API_KEY) {
    // Fallback to mock data if no API key
    const mockData = getMockFredData(seriesId);
    return NextResponse.json({ data: mockData });
  }

  try {
    const url = new URL(`${FRED_BASE_URL}/series/observations`);
    url.searchParams.set("series_id", seriesId);
    url.searchParams.set("api_key", FRED_API_KEY);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("limit", limit);
    url.searchParams.set("sort_order", sortOrder);

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      data: {
        observations: data.observations || [],
        series_id: data.series_id,
        title: data.title,
        units: data.units,
      },
    });
  } catch (error) {
    console.error("FRED API error:", error);
    // Fallback to mock data on error
    const mockData = getMockFredData(seriesId);
    return NextResponse.json({ data: mockData });
  }
}

function getMockFredData(seriesId: string | null) {
  const baseDate = new Date().toISOString().split("T")[0];

  const mockValues: Record<string, string> = {
    DGS10: "4.25",
    DGS2: "4.75",
    DGS3MO: "5.35",
    DGS1MO: "5.25",
    DGS6MO: "5.15",
    DGS1: "4.95",
    DGS5: "4.35",
    DGS30: "4.45",
    VIXCLS: "16.5",
    AAA: "4.50",
    BAA: "5.50",
  };

  return {
    observations: [
      {
        date: baseDate,
        value: mockValues[seriesId || ""] || "0.0",
      },
    ],
    series_id: seriesId,
    title: `Mock ${seriesId} Data`,
    units: "Percent",
  };
}
