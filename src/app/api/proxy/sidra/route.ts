import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Mock SIDRA IPCA subitems by weight/variation
  // In production, integrate with IBGE SIDRA API (tabela 7060 etc.)
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const data = [
    { codigo: "FOOD", descricao: "Alimentação e bebidas", peso: 23.1, mensal: 0.65, anual: 4.8 },
    { codigo: "HAB", descricao: "Habitação", peso: 15.2, mensal: 0.18, anual: 3.2 },
    { codigo: "TRN", descricao: "Transportes", peso: 20.6, mensal: -0.4, anual: 2.1 },
    { codigo: "HLT", descricao: "Saúde e cuidados pessoais", peso: 13.5, mensal: 0.55, anual: 6.9 },
    { codigo: "EDU", descricao: "Educação", peso: 6.2, mensal: 1.2, anual: 8.1 },
    { codigo: "COM", descricao: "Comunicação", peso: 4.1, mensal: 0.1, anual: 1.3 },
  ];

  return NextResponse.json({ data: { referencia: month, subitens: data } });
}
