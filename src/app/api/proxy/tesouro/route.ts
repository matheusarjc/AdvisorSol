import { NextRequest, NextResponse } from "next/server";

// Multiple sources for Tesouro Direto data
const TD_SOURCES = [
  "https://www.tesourodireto.com.br/json/tdi_prices.json",
  "https://api.tesourodireto.com.br/tdi/v1/titulos",
  "https://www.tesourodireto.com.br/api/tdi/v1/titulos",
];

export async function GET(request: NextRequest) {
  try {
    // Try multiple sources for Tesouro Direto data
    for (const url of TD_SOURCES) {
      try {
        const res = await fetch(url, {
          next: { revalidate: 300 },
          headers: {
            Accept: "application/json",
            "User-Agent": "AdvisorSol/1.0",
          },
        });

        if (res.ok) {
          const json = await res.json();

          // Try different data structures
          let rawData = json?.prices || json?.data || json?.titulos || json;

          if (Array.isArray(rawData) && rawData.length > 0) {
            const data = rawData
              .map((i: any) => ({
                nome: i.nome || i.titulo || i.name || i.descricao,
                vencimento: i.vencimento || i.maturity || i.dataVencimento,
                taxaCompra: parseFloat(
                  i.taxaCompra || i.buyRate || i.taxa_compra || i.taxaCompraManha || 0
                ),
                taxaVenda: parseFloat(
                  i.taxaVenda || i.sellRate || i.taxa_venda || i.taxaVendaManha || 0
                ),
                pu: parseFloat(i.pu || i.preco || i.price || i.precoUnitario || 0),
                indicativo: i.indicativo ?? true,
                indexador: i.indexador || i.index || i.tipoIndexador || "IPCA",
              }))
              .filter((item) => item.nome && item.vencimento);

            if (data.length > 0) {
              return NextResponse.json({ data });
            }
          }
        }
      } catch (sourceError) {
        console.warn(`Failed to fetch from ${url}:`, sourceError);
        continue;
      }
    }

    throw new Error("All TD sources failed");
  } catch (e) {
    console.error("Tesouro Direto API error:", e);
    // Enhanced mock fallback with more realistic data
    const data = [
      {
        nome: "Tesouro IPCA+ 2026",
        vencimento: "2026-08-15",
        taxaCompra: 6.15,
        taxaVenda: 6.05,
        pu: 3100.5,
        indicativo: true,
        indexador: "IPCA",
      },
      {
        nome: "Tesouro IPCA+ 2029",
        vencimento: "2029-05-15",
        taxaCompra: 6.28,
        taxaVenda: 6.18,
        pu: 2800.7,
        indicativo: true,
        indexador: "IPCA",
      },
      {
        nome: "Tesouro IPCA+ 2035",
        vencimento: "2035-05-15",
        taxaCompra: 6.45,
        taxaVenda: 6.35,
        pu: 2600.7,
        indicativo: true,
        indexador: "IPCA",
      },
      {
        nome: "Tesouro Selic 2027",
        vencimento: "2027-03-01",
        taxaCompra: 0.1,
        taxaVenda: 0.08,
        pu: 10800.2,
        indicativo: true,
        indexador: "SELIC",
      },
      {
        nome: "Tesouro Prefixado 2026",
        vencimento: "2026-01-01",
        taxaCompra: 11.8,
        taxaVenda: 11.7,
        pu: 890.5,
        indicativo: true,
        indexador: "Prefixado",
      },
      {
        nome: "Tesouro Prefixado 2029",
        vencimento: "2029-01-01",
        taxaCompra: 12.1,
        taxaVenda: 12.0,
        pu: 780.3,
        indicativo: true,
        indexador: "Prefixado",
      },
    ];
    return NextResponse.json({ data });
  }
}
