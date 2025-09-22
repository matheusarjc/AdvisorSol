import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 });
  }

  try {
    // ANBIMA doesn't have a public API, so we'll simulate data for now
    // In production, this would integrate with ANBIMA's official data sources
    // or use authorized data providers

    let mockData;

    switch (endpoint) {
      case "/debentures":
        const rating = searchParams.get("rating");
        mockData = generateMockDebentures(rating);
        break;
      case "/credit-curves":
        const curveRating = searchParams.get("rating");
        const sector = searchParams.get("sector");
        mockData = generateMockCreditCurves(curveRating, sector);
        break;
      case "/cri-cra-lfs":
        mockData = generateMockCriCraLfs();
        break;
      default:
        return NextResponse.json({ error: "Unknown endpoint" }, { status: 404 });
    }

    return NextResponse.json({ data: mockData });
  } catch (error) {
    console.error("ANBIMA proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch ANBIMA data" }, { status: 500 });
  }
}

function generateMockDebentures(rating?: string | null) {
  const debentures = [
    {
      issuer: "Petrobras",
      rating: "BBB",
      maturity: "2029-05-15",
      indexer: "IPCA+",
      spread: 275,
      yield: 13.85,
      pu: 1024.5,
      bid: 13.8,
      ask: 13.9,
      sector: "Energia",
      updated_at: new Date().toISOString(),
    },
    {
      issuer: "Vale",
      rating: "A",
      maturity: "2030-12-01",
      indexer: "IPCA+",
      spread: 205,
      yield: 12.95,
      pu: 1018.2,
      bid: 12.9,
      ask: 13.0,
      sector: "Mineração",
      updated_at: new Date().toISOString(),
    },
    {
      issuer: "Itaú Unibanco",
      rating: "AA",
      maturity: "2028-08-20",
      indexer: "IPCA+",
      spread: 145,
      yield: 12.15,
      pu: 1012.8,
      bid: 12.1,
      ask: 12.2,
      sector: "Financeiro",
      updated_at: new Date().toISOString(),
    },
    {
      issuer: "Bradesco",
      rating: "AA",
      maturity: "2027-11-10",
      indexer: "IPCA+",
      spread: 135,
      yield: 11.95,
      pu: 1009.5,
      bid: 11.9,
      ask: 12.0,
      sector: "Financeiro",
      updated_at: new Date().toISOString(),
    },
    {
      issuer: "Ambev",
      rating: "AAA",
      maturity: "2026-03-25",
      indexer: "IPCA+",
      spread: 75,
      yield: 11.25,
      pu: 1005.2,
      bid: 11.2,
      ask: 11.3,
      sector: "Consumo",
      updated_at: new Date().toISOString(),
    },
  ];

  return rating ? debentures.filter((d) => d.rating === rating) : debentures;
}

function generateMockCreditCurves(rating?: string | null, sector?: string | null) {
  const curves = {
    AAA: [
      { vertex: "1Y", rate: 10.85, spread: 35, duration: 0.92 },
      { vertex: "2Y", rate: 11.12, spread: 47, duration: 1.81 },
      { vertex: "3Y", rate: 11.28, spread: 53, duration: 2.65 },
      { vertex: "5Y", rate: 11.45, spread: 65, duration: 4.18 },
      { vertex: "10Y", rate: 11.78, spread: 88, duration: 7.42 },
    ],
    AA: [
      { vertex: "1Y", rate: 11.15, spread: 65, duration: 0.92 },
      { vertex: "2Y", rate: 11.45, spread: 80, duration: 1.81 },
      { vertex: "3Y", rate: 11.65, spread: 90, duration: 2.65 },
      { vertex: "5Y", rate: 11.95, spread: 115, duration: 4.18 },
      { vertex: "10Y", rate: 12.35, spread: 145, duration: 7.42 },
    ],
    A: [
      { vertex: "1Y", rate: 11.45, spread: 95, duration: 0.92 },
      { vertex: "2Y", rate: 11.78, spread: 113, duration: 1.81 },
      { vertex: "3Y", rate: 12.05, spread: 130, duration: 2.65 },
      { vertex: "5Y", rate: 12.45, spread: 165, duration: 4.18 },
      { vertex: "10Y", rate: 12.95, spread: 205, duration: 7.42 },
    ],
    BBB: [
      { vertex: "1Y", rate: 12.25, spread: 175, duration: 0.92 },
      { vertex: "2Y", rate: 12.65, spread: 200, duration: 1.81 },
      { vertex: "3Y", rate: 13.05, spread: 230, duration: 2.65 },
      { vertex: "5Y", rate: 13.55, spread: 275, duration: 4.18 },
      { vertex: "10Y", rate: 14.15, spread: 325, duration: 7.42 },
    ],
  };

  if (rating && curves[rating as keyof typeof curves]) {
    return curves[rating as keyof typeof curves];
  }

  return curves.AAA; // Default to AAA
}

function generateMockCriCraLfs() {
  return [
    {
      issuer: "Brookfield",
      type: "CRI",
      rating: "AA",
      maturity: "2028-06-15",
      indexer: "IPCA+",
      spread: 185,
      yield: 12.75,
      sector: "Real Estate",
      updated_at: new Date().toISOString(),
    },
    {
      issuer: "Votorantim",
      type: "CRA",
      rating: "A",
      maturity: "2027-09-30",
      indexer: "IPCA+",
      spread: 220,
      yield: 13.1,
      sector: "Agronegócio",
      updated_at: new Date().toISOString(),
    },
    {
      issuer: "Banco do Brasil",
      type: "LFS",
      rating: "AA",
      maturity: "2026-12-20",
      indexer: "IPCA+",
      spread: 165,
      yield: 12.55,
      sector: "Financeiro",
      updated_at: new Date().toISOString(),
    },
  ];
}
