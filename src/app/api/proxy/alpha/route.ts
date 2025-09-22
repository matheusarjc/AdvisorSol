import { NextRequest, NextResponse } from "next/server";

const ALPHA_URL = "https://www.alphavantage.co/query";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const func = searchParams.get("function");
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "daily";
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey || !func) {
    // Mock fallback
    if (func === "GLOBAL_QUOTE") {
      return NextResponse.json({ data: { symbol: symbol || "AAPL", price: 195.5, change: 0.8 } });
    }
    if (func === "RSI") {
      return NextResponse.json({ data: { symbol: symbol || "AAPL", rsi: 56.3 } });
    }
    if (func === "SMA") {
      return NextResponse.json({ data: { symbol: symbol || "AAPL", period: 50, sma: 188.2 } });
    }
    if (func === "MACD") {
      return NextResponse.json({
        data: { symbol: symbol || "AAPL", macd: 0.45, signal: 0.4, hist: 0.05 },
      });
    }
    if (func === "TIME_SERIES_DAILY") {
      // Mock daily time series data
      const basePrice = 195.5;
      const data: any = {};
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const variation = (Math.random() - 0.5) * 10;
        const open = basePrice + variation;
        const close = open + (Math.random() - 0.5) * 5;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const volume = Math.floor(Math.random() * 50000000) + 20000000;

        data[dateStr] = {
          "1. open": open.toFixed(2),
          "2. high": high.toFixed(2),
          "3. low": low.toFixed(2),
          "4. close": close.toFixed(2),
          "5. volume": volume.toString(),
        };
      }
      return NextResponse.json({
        data: {
          "Time Series (Daily)": data,
        },
      });
    }
    return NextResponse.json({ error: "Missing API key or function" }, { status: 400 });
  }

  try {
    if (func === "GLOBAL_QUOTE") {
      const url = `${ALPHA_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 15 } });
      if (!res.ok) return NextResponse.json({ error: "Upstream" }, { status: res.status });
      const json = await res.json();
      const q = json?.["Global Quote"] || {};
      const data = {
        symbol,
        price: parseFloat(q["05. price"] || "0"),
        change: parseFloat(q["10. change percent"]?.replace("%", "") || "0"),
      };
      return NextResponse.json({ data });
    }

    if (func === "RSI") {
      const url = `${ALPHA_URL}?function=RSI&symbol=${symbol}&interval=${interval}&time_period=14&series_type=close&apikey=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return NextResponse.json({ error: "Upstream" }, { status: res.status });
      const json = await res.json();
      const series = json?.["Technical Analysis: RSI"] || {};
      const lastKey = Object.keys(series)[0];
      const rsi = lastKey ? parseFloat(series[lastKey]?.RSI || "0") : 0;
      return NextResponse.json({ data: { symbol, rsi } });
    }

    if (func === "SMA") {
      const period = searchParams.get("time_period") || "50";
      const url = `${ALPHA_URL}?function=SMA&symbol=${symbol}&interval=${interval}&time_period=${period}&series_type=close&apikey=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return NextResponse.json({ error: "Upstream" }, { status: res.status });
      const json = await res.json();
      const series = json?.["Technical Analysis: SMA"] || {};
      const lastKey = Object.keys(series)[0];
      const sma = lastKey ? parseFloat(series[lastKey]?.SMA || "0") : 0;
      return NextResponse.json({ data: { symbol, period: Number(period), sma } });
    }

    if (func === "MACD") {
      const url = `${ALPHA_URL}?function=MACD&symbol=${symbol}&interval=${interval}&series_type=close&apikey=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return NextResponse.json({ error: "Upstream" }, { status: res.status });
      const json = await res.json();
      const series = json?.["Technical Analysis: MACD"] || {};
      const lastKey = Object.keys(series)[0];
      const macd = lastKey ? parseFloat(series[lastKey]?.MACD || "0") : 0;
      const signal = lastKey ? parseFloat(series[lastKey]?.MACD_Signal || "0") : 0;
      const hist = lastKey ? parseFloat(series[lastKey]?.MACD_Hist || "0") : 0;
      return NextResponse.json({ data: { symbol, macd, signal, hist } });
    }

    return NextResponse.json({ error: "Unsupported function" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
