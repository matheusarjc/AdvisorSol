import { NextRequest, NextResponse } from "next/server";

const ALPHA_URL = "https://www.alphavantage.co/query";
const ALPHA_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const func = searchParams.get("function");
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "daily";
  const timePeriod = searchParams.get("time_period") || "14";

  if (!func || !symbol) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (!ALPHA_API_KEY) {
    // Fallback to mock data if no API key
    return NextResponse.json({ data: getMockAlphaData(func, symbol, interval, timePeriod) });
  }

  try {
    const url = new URL(ALPHA_URL);
    url.searchParams.set("function", func);
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("apikey", ALPHA_API_KEY);

    if (func === "TIME_SERIES_DAILY") {
      url.searchParams.set("outputsize", "compact");
    } else if (func === "RSI") {
      url.searchParams.set("interval", interval);
      url.searchParams.set("time_period", timePeriod);
      url.searchParams.set("series_type", "close");
    } else if (func === "SMA") {
      url.searchParams.set("interval", interval);
      url.searchParams.set("time_period", timePeriod);
      url.searchParams.set("series_type", "close");
    } else if (func === "MACD") {
      url.searchParams.set("interval", interval);
      url.searchParams.set("series_type", "close");
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API limit exceeded
    if (data["Note"]) {
      console.warn("Alpha Vantage API limit exceeded, using mock data");
      return NextResponse.json({ data: getMockAlphaData(func, symbol, interval, timePeriod) });
    }

    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Alpha Vantage API error:", error);
    // Fallback to mock data on error
    return NextResponse.json({ data: getMockAlphaData(func, symbol, interval, timePeriod) });
  }
}

function getMockAlphaData(func: string, symbol: string, interval: string, timePeriod: string) {
  const basePrice = 195.5;

  if (func === "GLOBAL_QUOTE") {
    return {
      "Global Quote": {
        "01. symbol": symbol,
        "02. open": (basePrice + (Math.random() - 0.5) * 2).toFixed(2),
        "03. high": (basePrice + Math.random() * 3).toFixed(2),
        "04. low": (basePrice - Math.random() * 3).toFixed(2),
        "05. price": basePrice.toFixed(2),
        "06. volume": Math.floor(Math.random() * 50000000 + 20000000).toString(),
        "07. latest trading day": new Date().toISOString().split("T")[0],
        "08. previous close": (basePrice - (Math.random() - 0.5) * 2).toFixed(2),
        "09. change": ((Math.random() - 0.5) * 4).toFixed(2),
        "10. change percent": `${((Math.random() - 0.5) * 4).toFixed(2)}%`,
      },
    };
  }

  if (func === "RSI") {
    return {
      "Technical Analysis: RSI": {
        [new Date().toISOString().split("T")[0]]: {
          RSI: (50 + (Math.random() - 0.5) * 40).toFixed(2),
        },
      },
    };
  }

  if (func === "SMA") {
    return {
      "Technical Analysis: SMA": {
        [new Date().toISOString().split("T")[0]]: {
          SMA: (basePrice + (Math.random() - 0.5) * 10).toFixed(2),
        },
      },
    };
  }

  if (func === "MACD") {
    return {
      "Technical Analysis: MACD": {
        [new Date().toISOString().split("T")[0]]: {
          MACD: ((Math.random() - 0.5) * 2).toFixed(4),
          MACD_Signal: ((Math.random() - 0.5) * 2).toFixed(4),
          MACD_Hist: ((Math.random() - 0.5) * 0.5).toFixed(4),
        },
      },
    };
  }

  if (func === "TIME_SERIES_DAILY") {
    const data: Record<string, any> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const variation = (Math.random() - 0.5) * 10;
      const open = basePrice + variation;
      const close = basePrice + variation + (Math.random() - 0.5) * 4;
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
    return {
      "Time Series (Daily)": data,
    };
  }

  return { error: "Unknown function" };
}
