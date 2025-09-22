import { apiCache } from "@/lib/cache";

export interface TesouroTitulo {
  nome: string;
  vencimento: string; // YYYY-MM-DD
  taxaCompra: number;
  taxaVenda: number;
  pu: number;
  indicativo: boolean;
  indexador: string;
}

export async function fetchTesouroTitulos(): Promise<TesouroTitulo[]> {
  return apiCache.withCache(
    "tesouro_titulos",
    async () => {
      const res = await fetch("/api/proxy/tesouro");
      if (!res.ok) throw new Error("Tesouro fetch failed");
      const json = await res.json();
      return json.data as TesouroTitulo[];
    },
    5 * 60 * 1000
  );
}
