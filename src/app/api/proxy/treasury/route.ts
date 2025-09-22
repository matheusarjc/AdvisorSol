import { NextResponse } from "next/server";

const BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint") ?? "/v2/accounting/od/avg_interest_rates";
  const params = new URLSearchParams(searchParams);
  params.delete("endpoint");
  const url = `${BASE}${endpoint}?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json({ data });
}
