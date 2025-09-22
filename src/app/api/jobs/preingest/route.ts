import { NextResponse } from "next/server";

export async function GET() {
  // TODO: chamar clientes (SGS, Treasury, FRED, ANBIMA) e armazenar em cache/Firestore
  // Por enquanto, apenas retorna 200 para validar o job endpoint
  return NextResponse.json({ ok: true });
}
