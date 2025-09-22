import { apiCache } from "@/lib/cache";

function useMocks() {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

export async function fetchPTAX(dataInicial?: string, dataFinal?: string) {
  const cacheKey = `ptax_${dataInicial}_${dataFinal}`;

  return apiCache.withCache(
    cacheKey,
    async () => {
      if (useMocks()) {
        const today = new Date().toISOString();
        return [{ cotacaoCompra: 5.18, cotacaoVenda: 5.19, dataHoraCotacao: today }];
      }
      const params = new URLSearchParams();
      if (dataInicial) params.set("dataInicial", dataInicial);
      if (dataFinal) params.set("dataFinal", dataFinal);
      const res = await fetch(`/api/proxy/ptax?${params.toString()}`);
      if (!res.ok) throw new Error("PTAX fetch failed");
      const json = await res.json();
      return json.data as Array<any>;
    },
    5 * 60 * 1000
  ); // Cache por 5 minutos
}

export async function fetchLatestPTAX(): Promise<{ compra: number; venda: number } | null> {
  const cacheKey = "ptax_latest";

  return apiCache.withCache(
    cacheKey,
    async () => {
      const data = await fetchPTAX();
      if (!data?.length) return null;
      const last = data[data.length - 1];
      const compra =
        typeof last.cotacaoCompra === "number"
          ? last.cotacaoCompra
          : parseFloat(last.cotacaoCompra);
      const venda =
        typeof last.cotacaoVenda === "number" ? last.cotacaoVenda : parseFloat(last.cotacaoVenda);
      if (isNaN(compra) || isNaN(venda)) return null;
      return { compra, venda };
    },
    5 * 60 * 1000
  );
}
