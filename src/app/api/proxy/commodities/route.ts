import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const data = [
    { symbol: "WTI", name: "Petróleo WTI", price: 78.45, change: -1.25, unit: "barrel" },
    { symbol: "BRENT", name: "Petróleo Brent", price: 82.1, change: -0.95, unit: "barrel" },
    { symbol: "XAU", name: "Ouro", price: 2025.3, change: 0.85, unit: "oz" },
    { symbol: "XAG", name: "Prata", price: 23.85, change: 1.45, unit: "oz" },
    { symbol: "HG", name: "Cobre", price: 3.89, change: -0.78, unit: "lb" },
    { symbol: "ZC", name: "Milho", price: 481.25, change: 2.15, unit: "bushel" },
    { symbol: "ZS", name: "Soja", price: 1247.5, change: 1.35, unit: "bushel" },
  ];

  return NextResponse.json({ data });
}
