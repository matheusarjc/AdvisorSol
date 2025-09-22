import { apiCache } from "@/lib/cache";

// ANBIMA API integration helpers
export async function anbima(endpoint: string, params: Record<string, string> = {}) {
  const cacheKey = `anbima_${endpoint}_${JSON.stringify(params)}`;

  return apiCache.withCache(
    cacheKey,
    async () => {
      const sp = new URLSearchParams({ endpoint, ...params });
      const res = await fetch(`/api/proxy/anbima?${sp.toString()}`);
      if (!res.ok) throw new Error("ANBIMA fetch failed");
      return (await res.json()).data;
    },
    10 * 60 * 1000
  ); // Cache por 10 minutos
}

// Fetch debentures secondary market data
export async function fetchDebentures(params: Record<string, string> = {}) {
  const cacheKey = `anbima_debentures_${JSON.stringify(params)}`;

  return apiCache.withCache(
    cacheKey,
    async () => {
      const data = await anbima("/debentures", params);
      return data ?? [];
    },
    10 * 60 * 1000
  );
}

// Fetch credit curves by rating/sector
export async function fetchCreditCurves(rating?: string, sector?: string) {
  const params: Record<string, string> = {};
  if (rating) params.rating = rating;
  if (sector) params.sector = sector;
  const data = await anbima("/credit-curves", params);
  return data ?? [];
}

// Fetch CRI/CRA/LFS data from Preços & Índices family
export async function fetchCriCraLfs(params: Record<string, string> = {}) {
  const data = await anbima("/cri-cra-lfs", params);
  return data ?? [];
}

// Helper to get latest debentures by rating
export async function fetchDebenaturesByRating(rating: "AAA" | "AA" | "A" | "BBB") {
  const debentures = await fetchDebentures({ rating });
  return debentures;
}

// Fetch DI curve (ANBIMA) for yield curve visualization
export async function fetchDiCurve() {
  const cacheKey = `anbima_di_curve`;

  return apiCache.withCache(
    cacheKey,
    async () => {
      const data = await anbima("/di-curve");
      return data ?? [];
    },
    10 * 60 * 1000
  );
}
