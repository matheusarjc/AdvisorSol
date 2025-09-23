import { NextResponse } from "next/server";
import { getMetricsSnapshot } from "@/lib/metrics";

export async function GET() {
  const snapshot = getMetricsSnapshot();
  return NextResponse.json({ metrics: snapshot, ts: Date.now() });
}
