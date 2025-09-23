import { NextRequest, NextResponse } from "next/server";
import { apiCache } from "@/lib/cache";
import { recordMetric } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const started = Date.now();
  const { searchParams } = new URL(request.url);
  const serie = searchParams.get("serie");
  const dataInicial = searchParams.get("dataInicial") || undefined;
  const dataFinal = searchParams.get("dataFinal") || undefined;

  if (!serie) {
    return NextResponse.json({ error: "serie is required" }, { status: 400 });
  }

  const cacheKey = `data_sgs_${serie}_${dataInicial}_${dataFinal}`;

  try {
    const result = await apiCache.withFallback(cacheKey, async () => {
      const url = new URL("/api/proxy/sgs", request.url);
      url.searchParams.set("serie", String(serie));
      if (dataInicial) url.searchParams.set("dataInicial", dataInicial);
      if (dataFinal) url.searchParams.set("dataFinal", dataFinal);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch sgs series");
      const json = await res.json();
      return { data: json.data, ts: Date.now() };
    });
    const dur = Date.now() - started;
    recordMetric("data.sgs_series", dur, true);
    return NextResponse.json(result, { headers: { "x-duration": String(dur) } });
  } catch (e: any) {
    const dur = Date.now() - started;
    recordMetric("data.sgs_series", dur, false);
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
