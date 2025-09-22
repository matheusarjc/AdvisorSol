import { NextRequest, NextResponse } from "next/server";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const symbol = searchParams.get("symbol") || "";
  const query = symbol ? `${symbol} stock market` : "financial market";

  if (!NEWS_API_KEY) {
    // Fallback to mock data if no API key
    return NextResponse.json({ data: getMockNewsData(symbol, limit) });
  }

  try {
    const url = new URL(`${NEWS_API_URL}/everything`);
    url.searchParams.set("q", query);
    url.searchParams.set("apiKey", NEWS_API_KEY);
    url.searchParams.set("pageSize", String(Math.min(limit, 20)));
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");

    // Add financial news sources
    url.searchParams.set("sources", "bloomberg,reuters,financial-times,marketwatch,cnbc");

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message);
    }

    const articles = (data.articles || []).map((article: any, idx: number) => ({
      id: article.url || `news-${Date.now()}-${idx}`,
      title: article.title,
      source: article.source?.name || "NewsAPI",
      ts: article.publishedAt || new Date().toISOString(),
      url: article.url,
      description: article.description,
    }));

    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error("News API error:", error);
    // Fallback to mock data on error
    return NextResponse.json({ data: getMockNewsData(symbol, limit) });
  }
}

function getMockNewsData(symbol: string, limit: number) {
  if (symbol) {
    // Generate symbol-specific news
    const companyNames: Record<string, string> = {
      AAPL: "Apple Inc.",
      MSFT: "Microsoft Corporation",
      AMZN: "Amazon.com Inc.",
      GOOGL: "Alphabet Inc.",
      NVDA: "NVIDIA Corporation",
    };

    const companyName = companyNames[symbol] || symbol;

    return [
      {
        id: `${symbol}-earnings-${Date.now()}`,
        title: `${companyName} reports strong quarterly earnings`,
        source: "MarketWatch",
        ts: new Date(Date.now() - 1800000).toISOString(),
        url: `https://example.com/news/${symbol.toLowerCase()}-earnings`,
        description: `${symbol} beats analyst expectations with revenue growth of 15% year-over-year.`,
      },
      {
        id: `${symbol}-analyst-${Date.now()}`,
        title: `Analysts raise price target for ${symbol}`,
        source: "Bloomberg",
        ts: new Date(Date.now() - 3600000).toISOString(),
        url: `https://example.com/news/${symbol.toLowerCase()}-analyst`,
        description: `Multiple analysts increase their price targets following positive outlook for ${companyName}.`,
      },
      {
        id: `${symbol}-high-${Date.now()}`,
        title: `${symbol} stock reaches new 52-week high`,
        source: "Reuters",
        ts: new Date(Date.now() - 7200000).toISOString(),
        url: `https://example.com/news/${symbol.toLowerCase()}-high`,
        description: `${companyName} shares surge 3.2% in today's trading session.`,
      },
      {
        id: `${symbol}-institutional-${Date.now()}`,
        title: `Institutional investors increase ${symbol} holdings`,
        source: "Financial Times",
        ts: new Date(Date.now() - 10800000).toISOString(),
        url: `https://example.com/news/${symbol.toLowerCase()}-institutional`,
        description: `Large funds report increased positions in ${companyName} in latest filings.`,
      },
    ].slice(0, limit);
  }

  // General financial news
  return Array.from({ length: Math.min(limit, 5) }).map((_, i) => ({
    id: `mock-${Date.now()}-${i}`,
    title: `Financial Market Update ${i + 1}`,
    source: "MockNews",
    ts: new Date(Date.now() - i * 3600000).toISOString(),
    url: `https://example.com/news${i + 1}`,
    description: `Latest developments in global financial markets affecting investor sentiment.`,
  }));
}
