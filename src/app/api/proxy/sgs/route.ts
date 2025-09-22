import { NextResponse } from "next/server";

const SGS_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serie = searchParams.get("serie");
  const dataInicial = searchParams.get("dataInicial");
  const dataFinal = searchParams.get("dataFinal");

  if (!serie) {
    return NextResponse.json({ error: "Missing serie parameter" }, { status: 400 });
  }

  try {
    // Build URL for BCB SGS API
    const url = new URL(`${SGS_BASE_URL}.${serie}/dados`);

    if (dataInicial) {
      url.searchParams.set("dataInicial", dataInicial);
    }
    if (dataFinal) {
      url.searchParams.set("dataFinal", dataFinal);
    }

    // Add format parameter
    url.searchParams.set("formato", "json");

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        Accept: "application/json",
        "User-Agent": "AdvisorSol/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`SGS API error: ${response.status}`);
    }

    const data = await response.json();

    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : [];

    return NextResponse.json({
      data: dataArray.map((item: any) => ({
        data: item.data,
        valor: item.valor,
      })),
    });
  } catch (error) {
    console.error("SGS API error:", error);
    // Fallback to mock data on error
    const mockData = getMockSGSData(serie);
    return NextResponse.json({ data: mockData });
  }
}

function getMockSGSData(serie: string) {
  const today = new Date();
  const dataStr = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  const mockValues: Record<string, string> = {
    "11": "11.25", // Selic
    "433": "4.23", // IPCA
    "4389": "11.15", // CDI
    "12": "4.18", // IPCA-15
    "189": "4.50", // IGP-M
  };

  return [
    {
      data: dataStr,
      valor: mockValues[serie] || "0.0",
    },
  ];
}
