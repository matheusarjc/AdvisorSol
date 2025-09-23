import { NextRequest, NextResponse } from "next/server";
import { apiCache } from "@/lib/cache";
import {
  fetchGlobalQuote,
  fetchTimeSeriesDaily,
  fetchSMA,
  fetchMACD,
  fetchRSI,
} from "@/services/alpha";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "quote"; // quote | timeseries | indicators
  const symbol = searchParams.get("symbol") || "AAPL";
  const cacheKey = `stocks_${type}_${symbol}`;
  const started = Date.now();

  try {
    const result = await apiCache.withFallback(cacheKey, async () => {
      if (type === "quote") {
        const data = await fetchGlobalQuote(symbol);
        return { data, ts: Date.now() };
      }
      if (type === "timeseries") {
        const data = await fetchTimeSeriesDaily(symbol);
        return { data, ts: Date.now() };
      }
      if (type === "indicators") {
        const [rsi, sma50, sma200, macd] = await Promise.all([
          fetchRSI(symbol),
          fetchSMA(symbol, 50),
          fetchSMA(symbol, 200),
          fetchMACD(symbol),
        ]);
        const data = {
          rsi,
          sma50: sma50.sma,
          sma200: sma200.sma,
          macd: macd.macd,
          macdSignal: macd.signal,
          macdHistogram: macd.hist,
        };
        return { data, ts: Date.now() };
      }
      return { data: null, ts: Date.now() };
    });
    return NextResponse.json(result, { headers: { "x-duration": String(Date.now() - started) } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
