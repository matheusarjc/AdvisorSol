import { apiCache } from "@/lib/cache";
import { fetchGlobalQuote, fetchTimeSeriesDaily, fetchSMA, fetchMACD, fetchRSI } from "./alpha";

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  pe?: number;
  eps?: number;
  dividend?: number;
  beta?: number;
  rsi?: number;
  ma50?: number;
  ma200?: number;
  sentiment?: string;
  sector?: string;
  rating?: string;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  sma50: number;
  sma200: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
}

// Popular US stocks for the application
const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "BRK.B",
  "UNH",
  "JNJ",
  "V",
  "PG",
  "JPM",
  "HD",
  "MA",
  "DIS",
  "PYPL",
  "ADBE",
  "NFLX",
  "CRM",
  "INTC",
  "AMD",
  "ORCL",
  "CSCO",
  "IBM",
  "QCOM",
];

export async function fetchStockData(symbol: string): Promise<StockData | null> {
  const cacheKey = `stock_data_${symbol}`;

  try {
    return await apiCache.withCache(
      cacheKey,
      async () => {
        const [quote, rsi, sma50, sma200, macd] = await Promise.allSettled([
          fetchGlobalQuote(symbol),
          fetchRSI(symbol),
          fetchSMA(symbol, 50),
          fetchSMA(symbol, 200),
          fetchMACD(symbol),
        ]);

        const quoteData = quote.status === "fulfilled" ? quote.value : null;
        const rsiData = rsi.status === "fulfilled" ? rsi.value : 0;
        const sma50Data = sma50.status === "fulfilled" ? sma50.value.sma : 0;
        const sma200Data = sma200.status === "fulfilled" ? sma200.value.sma : 0;
        const macdData = macd.status === "fulfilled" ? macd.value : { macd: 0, signal: 0, hist: 0 };

        if (!quoteData || quoteData.price === 0) {
          return null;
        }

        // Calculate sentiment based on technical indicators
        let sentiment = "Neutral";
        if (rsiData > 70) sentiment = "Overbought";
        else if (rsiData < 30) sentiment = "Oversold";
        else if (quoteData.price > sma50Data && sma50Data > sma200Data) sentiment = "Bullish";
        else if (quoteData.price < sma50Data && sma50Data < sma200Data) sentiment = "Bearish";

        // Calculate rating
        let rating = "Hold";
        if (sentiment === "Bullish" && rsiData < 70) rating = "Buy";
        else if (sentiment === "Bearish" && rsiData > 30) rating = "Sell";

        return {
          symbol: quoteData.symbol,
          name: getCompanyName(symbol),
          price: quoteData.price,
          change: quoteData.change,
          changePercent: (quoteData.change / (quoteData.price - quoteData.change)) * 100,
          volume: formatVolume(Math.random() * 100000000), // Mock volume for now
          marketCap: formatMarketCap(quoteData.price * getSharesOutstanding(symbol)),
          rsi: rsiData,
          ma50: sma50Data,
          ma200: sma200Data,
          sentiment,
          sector: getSector(symbol),
          rating,
        };
      },
      5 * 60 * 1000
    ); // Cache for 5 minutes
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

export async function fetchMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const results = await Promise.allSettled(symbols.map((symbol) => fetchStockData(symbol)));

  return results
    .filter(
      (result): result is PromiseFulfilledResult<StockData> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);
}

export async function fetchPopularStocks(): Promise<StockData[]> {
  return fetchMultipleStocks(POPULAR_STOCKS.slice(0, 12)); // Limit to 12 for performance
}

export async function fetchStockTimeSeries(symbol: string): Promise<TimeSeriesData[]> {
  const cacheKey = `stock_timeseries_${symbol}`;

  try {
    return await apiCache.withCache(
      cacheKey,
      async () => {
        return await fetchTimeSeriesDaily(symbol);
      },
      15 * 60 * 1000
    ); // Cache for 15 minutes
  } catch (error) {
    console.error(`Error fetching time series for ${symbol}:`, error);
    return [];
  }
}

export async function fetchTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
  const cacheKey = `technical_indicators_${symbol}`;

  try {
    return await apiCache.withCache(
      cacheKey,
      async () => {
        const [rsi, sma50, sma200, macd] = await Promise.allSettled([
          fetchRSI(symbol),
          fetchSMA(symbol, 50),
          fetchSMA(symbol, 200),
          fetchMACD(symbol),
        ]);

        return {
          rsi: rsi.status === "fulfilled" ? rsi.value : 0,
          sma50: sma50.status === "fulfilled" ? sma50.value.sma : 0,
          sma200: sma200.status === "fulfilled" ? sma200.value.sma : 0,
          macd: macd.status === "fulfilled" ? macd.value.macd : 0,
          macdSignal: macd.status === "fulfilled" ? macd.value.signal : 0,
          macdHistogram: macd.status === "fulfilled" ? macd.value.hist : 0,
        };
      },
      5 * 60 * 1000
    );
  } catch (error) {
    console.error(`Error fetching technical indicators for ${symbol}:`, error);
    return {
      rsi: 0,
      sma50: 0,
      sma200: 0,
      macd: 0,
      macdSignal: 0,
      macdHistogram: 0,
    };
  }
}

// Helper functions
function getCompanyName(symbol: string): string {
  const names: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    TSLA: "Tesla Inc.",
    META: "Meta Platforms Inc.",
    NVDA: "NVIDIA Corporation",
    "BRK.B": "Berkshire Hathaway Inc.",
    UNH: "UnitedHealth Group Inc.",
    JNJ: "Johnson & Johnson",
    V: "Visa Inc.",
    PG: "Procter & Gamble Co.",
    JPM: "JPMorgan Chase & Co.",
    HD: "Home Depot Inc.",
    MA: "Mastercard Inc.",
    DIS: "Walt Disney Co.",
    PYPL: "PayPal Holdings Inc.",
    ADBE: "Adobe Inc.",
    NFLX: "Netflix Inc.",
    CRM: "Salesforce Inc.",
    INTC: "Intel Corporation",
    AMD: "Advanced Micro Devices Inc.",
    ORCL: "Oracle Corporation",
    CSCO: "Cisco Systems Inc.",
    IBM: "International Business Machines Corp.",
    QCOM: "QUALCOMM Inc.",
  };
  return names[symbol] || symbol;
}

function getSector(symbol: string): string {
  const sectors: Record<string, string> = {
    AAPL: "Technology",
    MSFT: "Technology",
    GOOGL: "Technology",
    AMZN: "Consumer Discretionary",
    TSLA: "Consumer Discretionary",
    META: "Technology",
    NVDA: "Technology",
    "BRK.B": "Financial Services",
    UNH: "Healthcare",
    JNJ: "Healthcare",
    V: "Financial Services",
    PG: "Consumer Staples",
    JPM: "Financial Services",
    HD: "Consumer Discretionary",
    MA: "Financial Services",
    DIS: "Communication Services",
    PYPL: "Financial Services",
    ADBE: "Technology",
    NFLX: "Communication Services",
    CRM: "Technology",
    INTC: "Technology",
    AMD: "Technology",
    ORCL: "Technology",
    CSCO: "Technology",
    IBM: "Technology",
    QCOM: "Technology",
  };
  return sectors[symbol] || "Unknown";
}

function getSharesOutstanding(symbol: string): number {
  // Approximate shares outstanding (in millions)
  const shares: Record<string, number> = {
    AAPL: 15500,
    MSFT: 7400,
    GOOGL: 12500,
    AMZN: 10500,
    TSLA: 3200,
    META: 2700,
    NVDA: 2500,
    "BRK.B": 1500,
    UNH: 950,
    JNJ: 2600,
    V: 2100,
    PG: 2400,
    JPM: 3000,
    HD: 1000,
    MA: 950,
    DIS: 1800,
    PYPL: 1100,
    ADBE: 460,
    NFLX: 440,
    CRM: 1000,
    INTC: 4100,
    AMD: 1600,
    ORCL: 2700,
    CSCO: 4100,
    IBM: 900,
    QCOM: 1100,
  };
  return shares[symbol] || 1000;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toFixed(0);
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000000000) {
    return `$${(marketCap / 1000000000000).toFixed(2)}T`;
  } else if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(1)}B`;
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(1)}M`;
  }
  return `$${marketCap.toFixed(0)}`;
}
