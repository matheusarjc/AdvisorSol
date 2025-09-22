import { NextRequest, NextResponse } from "next/server";

// Official TD site exposes JSON under /json or inline; we'll attempt a known URL and fall back to mock
const TD_URL = "https://www.tesourodireto.com.br/json/tdi_prices.json";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(TD_URL, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("upstream");
    const json = await res.json();
    // Normalize to a simple array
    const data = (json?.prices || json?.data || []).map((i: any) => ({
      nome: i.nome || i.titulo || i.name,
      vencimento: i.vencimento || i.maturity,
      taxaCompra: i.taxaCompra || i.buyRate || i.taxa_compra,
      taxaVenda: i.taxaVenda || i.sellRate || i.taxa_venda,
      pu: i.pu || i.preco || i.price,
      indicativo: i.indicativo ?? true,
      indexador: i.indexador || i.index || "IPCA",
    }));
    return NextResponse.json({ data });
  } catch (e) {
    // Mock fallback
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
    ];
    return NextResponse.json({ data });
  }
}
