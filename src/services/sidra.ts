import { apiCache } from "@/lib/cache";

export interface SidraSubitem {
  codigo: string;
  descricao: string;
  peso: number; // peso no índice
  mensal: number; // variação mensal %
  anual: number; // variação 12m %
}

export async function fetchSidraIpcaSubitems(
  month?: string
): Promise<{ referencia: string; subitens: SidraSubitem[] }> {
  const params = new URLSearchParams();
  if (month) params.set("month", month);
  const key = `sidra_ipca_${month || "latest"}`;
  return apiCache.withCache(
    key,
    async () => {
      const res = await fetch(`/api/proxy/sidra?${params.toString()}`);
      if (!res.ok) throw new Error("SIDRA fetch failed");
      const json = await res.json();
      return json.data as { referencia: string; subitens: SidraSubitem[] };
    },
    10 * 60 * 1000
  );
}
