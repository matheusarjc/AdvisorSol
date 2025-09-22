import { NextResponse } from "next/server";

const PTAX_BASE_URL = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dataInicial = searchParams.get("dataInicial");
  const dataFinal = searchParams.get("dataFinal");

  try {
    // Build URL for BCB PTAX API
    const url = new URL(
      `${PTAX_BASE_URL}/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)`
    );

    // Set default dates if not provided
    const startDate =
      dataInicial || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const endDate = dataFinal || new Date().toISOString().split("T")[0];

    url.searchParams.set("@dataInicial", `'${startDate}'`);
    url.searchParams.set("@dataFinalCotacao", `'${endDate}'`);
    url.searchParams.set("$format", "json");

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        Accept: "application/json",
        "User-Agent": "AdvisorSol/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`PTAX API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      data:
        data.value?.map((item: any) => ({
          cotacaoCompra: item.cotacaoCompra,
          cotacaoVenda: item.cotacaoVenda,
          dataHoraCotacao: item.dataHoraCotacao,
        })) || [],
    });
  } catch (error) {
    console.error("PTAX API error:", error);
    // Fallback to mock data on error
    const mockData = getMockPTAXData();
    return NextResponse.json({ data: mockData });
  }
}

function getMockPTAXData() {
  const today = new Date().toISOString();

  return [
    {
      cotacaoCompra: 5.18,
      cotacaoVenda: 5.19,
      dataHoraCotacao: today,
    },
  ];
}
