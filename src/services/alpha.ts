import { apiCache } from "@/lib/cache";

export interface GlobalQuote {
  symbol: string;
  price: number;
  change: number;
}

export async function fetchGlobalQuote(symbol: string): Promise<GlobalQuote> {
  const key = `alpha_quote_${symbol}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(
        `/api/proxy/alpha?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}`
      );
      if (!res.ok) throw new Error("Alpha quote failed");
      const json = await res.json();
      return json.data as GlobalQuote;
    },
    15 * 1000
  );
}

export async function fetchRSI(symbol: string, interval: string = "daily"): Promise<number> {
  const key = `alpha_rsi_${symbol}_${interval}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(
        `/api/proxy/alpha?function=RSI&symbol=${encodeURIComponent(symbol)}&interval=${interval}`
      );
      if (!res.ok) throw new Error("Alpha RSI failed");
      const json = await res.json();
      return (json.data?.rsi as number) ?? 0;
    },
    60 * 1000
  );
}

export async function fetchSMA(symbol: string, period: number = 50, interval: string = "daily") {
  const key = `alpha_sma_${symbol}_${period}_${interval}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(
        `/api/proxy/alpha?function=SMA&symbol=${encodeURIComponent(
          symbol
        )}&interval=${interval}&time_period=${period}`
      );
      if (!res.ok) throw new Error("Alpha SMA failed");
      const json = await res.json();
      return json.data as { symbol: string; period: number; sma: number };
    },
    60 * 1000
  );
}

export async function fetchMACD(symbol: string, interval: string = "daily") {
  const key = `alpha_macd_${symbol}_${interval}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(
        `/api/proxy/alpha?function=MACD&symbol=${encodeURIComponent(symbol)}&interval=${interval}`
      );
      if (!res.ok) throw new Error("Alpha MACD failed");
      const json = await res.json();
      return json.data as { symbol: string; macd: number; signal: number; hist: number };
    },
    60 * 1000
  );
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchTimeSeriesDaily(symbol: string): Promise<TimeSeriesData[]> {
  const key = `alpha_timeseries_${symbol}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(
        `/api/proxy/alpha?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}`
      );
      if (!res.ok) throw new Error("Alpha time series failed");
      const json = await res.json();
      const timeSeries = json.data?.["Time Series (Daily)"];
      if (!timeSeries) return [];

      return Object.entries(timeSeries)
        .map(([date, data]: [string, any]) => ({
          date,
          open: parseFloat(data["1. open"]),
          high: parseFloat(data["2. high"]),
          low: parseFloat(data["3. low"]),
          close: parseFloat(data["4. close"]),
          volume: parseInt(data["5. volume"]),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    15 * 60 * 1000 // Cache for 15 minutes
  );
}
