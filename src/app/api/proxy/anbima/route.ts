import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    const rating = searchParams.get("rating");
    const sector = searchParams.get("sector");

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 });
    }

    // ANBIMA API base URL
    const baseUrl = "https://api.anbima.com.br";
    let url = `${baseUrl}${endpoint}`;

    // Add query parameters if provided
    const params = new URLSearchParams();
    if (rating) params.append("rating", rating);
    if (sector) params.append("sector", sector);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // For development, return mock data
    if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      const mockData = getMockAnbimaData(endpoint);
      return NextResponse.json({ data: mockData });
    }

    // Make request to ANBIMA API
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AdvisorSol/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`ANBIMA API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("ANBIMA proxy error:", error);

    // Return mock data on error
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    const mockData = getMockAnbimaData(endpoint || "");

    return NextResponse.json({ data: mockData });
  }
}

function getMockAnbimaData(endpoint: string) {
  const today = new Date().toISOString().split("T")[0];

  switch (endpoint) {
    case "/debentures":
      return [
        {
          codigo: "DEB001",
          emissor: "Empresa ABC S.A.",
          indexador: "IPCA+",
          du: 36,
          duration: 2.8,
          spread_soberano: 150,
          rating: "AA",
          setor: "Energia",
          taxa_bid: 5.25,
          taxa_ask: 5.15,
          pu: 98.5,
          updated_at: today,
        },
        {
          codigo: "DEB002",
          emissor: "Corporação XYZ Ltda.",
          indexador: "CDI+",
          du: 24,
          duration: 2.1,
          spread_soberano: 200,
          rating: "A",
          setor: "Financeiro",
          taxa_bid: 6.1,
          taxa_ask: 6.0,
          pu: 97.25,
          updated_at: today,
        },
        {
          codigo: "DEB003",
          emissor: "Indústria DEF S.A.",
          indexador: "IPCA+",
          du: 60,
          duration: 4.2,
          spread_soberano: 180,
          rating: "AA-",
          setor: "Industrial",
          taxa_bid: 5.45,
          taxa_ask: 5.35,
          pu: 96.8,
          updated_at: today,
        },
      ];

    case "/credit-curves":
      return [
        {
          rating: "AA",
          setor: "Energia",
          curva: [
            { prazo: 1, spread: 120 },
            { prazo: 2, spread: 135 },
            { prazo: 3, spread: 150 },
            { prazo: 5, spread: 180 },
            { prazo: 10, spread: 220 },
          ],
        },
        {
          rating: "A",
          setor: "Financeiro",
          curva: [
            { prazo: 1, spread: 180 },
            { prazo: 2, spread: 200 },
            { prazo: 3, spread: 220 },
            { prazo: 5, spread: 260 },
            { prazo: 10, spread: 320 },
          ],
        },
      ];

    default:
      return [];
  }
}
