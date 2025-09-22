import { NextResponse } from "next/server";

// Mock PTAX data for development - in production use real BCB Olinda API
export async function GET(req: Request) {
  // Return mock USD/BRL exchange rate data
  const today = new Date().toISOString();

  const mockData = [
    {
      cotacaoCompra: 5.18,
      cotacaoVenda: 5.19,
      dataHoraCotacao: today,
    },
  ];

  return NextResponse.json({ data: mockData });
}
