import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dataInicial = searchParams.get("dataInicial");
  const dataFinal = searchParams.get("dataFinal");
  const endpoint =
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial='" +
    encodeURIComponent(dataInicial ?? "01-01-2000") +
    "',dataFinal='" +
    encodeURIComponent(dataFinal ?? "12-31-2099") +
    "')?$top=10000&$format=json";
  const res = await fetch(endpoint, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json({ data: data.value });
}
