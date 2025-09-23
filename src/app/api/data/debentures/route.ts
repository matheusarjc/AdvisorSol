import { NextRequest, NextResponse } from "next/server";
import { apiCache } from "@/lib/cache";
import { recordMetric } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const cacheKey = "data_debentures";
  const started = Date.now();
  try {
    const result = await apiCache.withFallback(cacheKey, async () => {
      const url = new URL("/api/proxy/anbima", request.url);
      url.searchParams.set("endpoint", "/debentures");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch debentures");
      const json = await res.json();
      return { data: json.data, ts: Date.now() };
    });
    const dur = Date.now() - started;
    recordMetric("data.debentures", dur, true);
    return NextResponse.json(result, { headers: { "x-duration": String(dur) } });
  } catch (e: any) {
    const dur = Date.now() - started;
    recordMetric("data.debentures", dur, false);
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
