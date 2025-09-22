import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const symbol = searchParams.get("symbol") || "";
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    // Mock fallback with symbol-specific news
    const generateSymbolNews = (ticker: string) => {
      const companyNames: Record<string, string> = {
        AAPL: "Apple Inc.",
        MSFT: "Microsoft Corporation",
        AMZN: "Amazon.com Inc.",
        GOOGL: "Alphabet Inc.",
        NVDA: "NVIDIA Corporation",
      };

      const companyName = companyNames[ticker] || ticker;

      return [
        {
          id: `${ticker}-earnings-${Date.now()}`,
          title: `${companyName} reports strong quarterly earnings`,
          source: "MarketWatch",
          ts: new Date(Date.now() - 1800000).toISOString(),
          url: `https://example.com/news/${ticker.toLowerCase()}-earnings`,
        },
        {
          id: `${ticker}-analyst-${Date.now()}`,
          title: `Analysts raise price target for ${ticker}`,
          source: "Bloomberg",
          ts: new Date(Date.now() - 3600000).toISOString(),
          url: `https://example.com/news/${ticker.toLowerCase()}-analyst`,
        },
        {
          id: `${ticker}-high-${Date.now()}`,
          title: `${ticker} stock reaches new 52-week high`,
          source: "Reuters",
          ts: new Date(Date.now() - 7200000).toISOString(),
          url: `https://example.com/news/${ticker.toLowerCase()}-high`,
        },
        {
          id: `${ticker}-institutional-${Date.now()}`,
          title: `Institutional investors increase ${ticker} holdings`,
          source: "Financial Times",
          ts: new Date(Date.now() - 10800000).toISOString(),
          url: `https://example.com/news/${ticker.toLowerCase()}-institutional`,
        },
      ];
    };

    const items = symbol
      ? generateSymbolNews(symbol)
      : Array.from({ length: Math.min(limit, 5) }).map((_, i) => ({
          id: `mock-${Date.now()}-${i}`,
          title: `Mercados em foco ${i + 1}`,
          source: "MockNews",
          ts: new Date().toISOString(),
          url: "#",
        }));

    return NextResponse.json({ data: items });
  }

  try {
    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.set("category", "business");
    url.searchParams.set("pageSize", String(Math.min(limit, 20)));
    url.searchParams.set("language", "pt");
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }
    const json = await res.json();
    const items = (json.articles || []).map((a: any, idx: number) => ({
      id: a.url || `news-${idx}`,
      title: a.title,
      source: a.source?.name || "NewsAPI",
      ts: a.publishedAt || new Date().toISOString(),
      url: a.url,
    }));
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
