import { NextRequest, NextResponse } from "next/server";

async function check(url: string, request: NextRequest) {
  const started = Date.now();
  try {
    const abs = new URL(url, request.url).toString();
    const res = await fetch(abs, { cache: "no-store" });
    const duration = Date.now() - started;
    if (!res.ok) return { status: "fail", duration } as const;
    const json = await res.json();
    const ts = (json && (json.ts as number)) || null;
    return { status: "ok", duration, ts } as const;
  } catch {
    return { status: "fail", duration: Date.now() - started } as const;
  }
}

export async function GET(request: NextRequest) {
  const results = await Promise.all([
    check("/api/data/di-curve", request),
    check("/api/data/tesouro", request),
    check("/api/data/debentures", request),
    check("/api/data/sidra-ipca", request),
    check("/api/data/sgs-series?serie=11", request),
    check("/api/data/sgs-series?serie=433", request),
    check("/api/data/sgs-series?serie=4389", request),
    check("/api/data/stocks?type=quote&symbol=AAPL", request),
    check("/api/data/stocks?type=indicators&symbol=AAPL", request),
    check("/api/data/stocks?type=timeseries&symbol=AAPL", request),
  ]);

  const [di, tesouro, debentures, sidra, sgsSelic, sgsIpca, sgsCdi, stkQ, stkI, stkT] = results;
  const statusValues = results.map((r) => r.status);
  const overall = statusValues.every((s) => s === "ok")
    ? "ok"
    : statusValues.some((s) => s === "ok")
    ? "degraded"
    : "fail";

  return NextResponse.json({
    overall,
    sources: {
      di_curve: di,
      tesouro,
      debentures,
      sidra_ipca: sidra,
      sgs: { selic: sgsSelic, ipca: sgsIpca, cdi: sgsCdi },
      stocks: { quote: stkQ, indicators: stkI, timeseries: stkT },
    },
    ts: Date.now(),
  });
}
