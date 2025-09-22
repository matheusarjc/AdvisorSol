import { NextResponse } from "next/server";

const FRED_BASE = "https://api.stlouisfed.org/fred";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") ?? "/series/observations";
  const params = new URLSearchParams(searchParams);
  params.delete("path");
  params.set("api_key", process.env.FRED_API_KEY ?? "");
  params.set("file_type", "json");
  const url = `${FRED_BASE}${path}?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json({ data });
}
