import { apiCache } from "@/lib/cache";

export interface CommodityQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  unit: string;
}

export async function fetchCommodities(): Promise<CommodityQuote[]> {
  return apiCache.withCache(
    "commodities_all",
    async () => {
      const res = await fetch("/api/proxy/commodities");
      if (!res.ok) throw new Error("Commodities fetch failed");
      const json = await res.json();
      return json.data as CommodityQuote[];
    },
    3 * 60 * 1000
  );
}
