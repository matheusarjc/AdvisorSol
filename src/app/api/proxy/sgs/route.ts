import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serie = searchParams.get("serie");
  const dataInicial = searchParams.get("dataInicial") ?? "01/01/2000";
  const dataFinal = searchParams.get("dataFinal") ?? "31/12/2099";
  if (!serie) return NextResponse.json({ error: "Missing serie" }, { status: 400 });
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json&dataInicial=${encodeURIComponent(
    dataInicial
  )}&dataFinal=${encodeURIComponent(dataFinal)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json({ data });
}
