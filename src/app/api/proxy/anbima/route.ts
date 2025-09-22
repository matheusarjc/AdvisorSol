import { NextResponse } from "next/server";

// Placeholder: ANBIMA feed geralmente requer token/headers específicos.
// Este proxy apenas demonstra a estrutura; os detalhes de autenticação devem ser adicionados via env.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });
  const url = `https://api.anbima.com.br${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.ANBIMA_TOKEN ?? ""}`,
    },
    next: { revalidate: 600 },
  });
  if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json({ data });
}
