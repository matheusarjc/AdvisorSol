import { apiCache } from "@/lib/cache";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  ts: string;
  url?: string;
}

export async function fetchTopNews(limit: number = 10): Promise<NewsItem[]> {
  const key = `news_top_${limit}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(`/api/proxy/news?limit=${limit}`);
      if (!res.ok) throw new Error("News fetch failed");
      const json = await res.json();
      return json.data as NewsItem[];
    },
    60 * 1000
  );
}

export async function fetchSymbolNews(symbol: string, limit: number = 5): Promise<NewsItem[]> {
  const key = `news_symbol_${symbol}_${limit}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(
        `/api/proxy/news?symbol=${encodeURIComponent(symbol)}&limit=${limit}`
      );
      if (!res.ok) throw new Error("Symbol news fetch failed");
      const json = await res.json();
      return json.data as NewsItem[];
    },
    5 * 60 * 1000 // Cache por 5 minutos
  );
}
