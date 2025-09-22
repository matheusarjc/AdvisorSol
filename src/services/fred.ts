import { apiCache } from "@/lib/cache";

function useMocks() {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

export async function fred(path: string, params: Record<string, string>) {
  const cacheKey = `fred_${path}_${JSON.stringify(params)}`;

  return apiCache.withCache(
    cacheKey,
    async () => {
      const sp = new URLSearchParams({ path, ...params });
      const res = await fetch(`/api/proxy/fred?${sp.toString()}`);
      if (!res.ok) throw new Error("FRED fetch failed");
      return (await res.json()).data;
    },
    2 * 60 * 1000
  ); // Cache por 2 minutos
}

export async function fetchLatestSeriesValue(seriesId: string): Promise<number | null> {
  const cacheKey = `fred_latest_${seriesId}`;

  return apiCache.withCache(
    cacheKey,
    async () => {
      if (useMocks()) {
        const mock: Record<string, number> = {
          DGS10: 4.25,
          DGS2: 4.75,
          DGS3MO: 5.35,
          DGS1MO: 5.25,
          DGS6MO: 5.15,
          DGS1: 4.95,
          DGS5: 4.35,
          DGS30: 4.45,
          VIXCLS: 16.5,
          AAA: 5.3,
          BAA: 6.9,
        };
        return mock[seriesId] ?? 0;
      }
      const data = await fred("/series/observations", {
        series_id: seriesId,
        sort_order: "desc",
        limit: "1",
      });
      const obs = data?.observations?.[0];
      if (!obs) return null;
      const v = parseFloat(obs.value);
      return isNaN(v) ? null : v;
    },
    2 * 60 * 1000
  );
}

// Corporate yields benchmarks (Moody's)
export async function fetchLatestAAAYield(): Promise<number | null> {
  return fetchLatestSeriesValue("AAA");
}

export async function fetchLatestBAAYield(): Promise<number | null> {
  return fetchLatestSeriesValue("BAA");
}

// Approximate IG spread using Baa - AAA as proxy (bps)
export async function approximateCorpSpreadBaaMinusAaa(): Promise<number | null> {
  const [aaa, baa] = await Promise.all([fetchLatestAAAYield(), fetchLatestBAAYield()]);
  if (aaa == null || baa == null) return null;
  return Math.round((baa - aaa) * 100); // convert to bps
}
