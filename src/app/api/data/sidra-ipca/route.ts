import { NextRequest, NextResponse } from "next/server";
import { apiCache } from "@/lib/cache";
import { recordMetric } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const cacheKey = "data_sidra_ipca";
  const started = Date.now();
  try {
    const result = await apiCache.withFallback(cacheKey, async () => {
      const url = new URL("/api/proxy/sidra", request.url);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch sidra ipca");
      const json = await res.json();
      return { data: json.data, ts: Date.now() };
    });
    const dur = Date.now() - started;
    recordMetric("data.sidra_ipca", dur, true);
    return NextResponse.json(result, { headers: { "x-duration": String(dur) } });
  } catch (e: any) {
    const dur = Date.now() - started;
    recordMetric("data.sidra_ipca", dur, false);
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
