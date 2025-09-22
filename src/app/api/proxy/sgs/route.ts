import { NextResponse } from "next/server";

// Mock SGS data for development - in production you'd use the real BCB API
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serie = searchParams.get("serie");

  if (!serie) return NextResponse.json({ error: "Missing serie" }, { status: 400 });

  // Return mock data based on series
  const mockData = getMockSGSData(serie);
  return NextResponse.json({ data: mockData });
}

function getMockSGSData(serie: string) {
  const today = new Date();
  const dataStr = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  switch (serie) {
    case "11": // Selic Meta
      return [{ data: dataStr, valor: "11.25" }];
    case "433": // IPCA
      return [{ data: dataStr, valor: "4.23" }];
    case "4389": // CDI
      return [{ data: dataStr, valor: "11.15" }];
    case "1178": // IPCA-15
      return [{ data: dataStr, valor: "4.18" }];
    case "4390": // IGPM
      return [{ data: dataStr, valor: "5.12" }];
    default:
      return [{ data: dataStr, valor: "0.0" }];
  }
}
