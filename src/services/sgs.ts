import { apiCache } from "@/lib/cache";

function useMocks() {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

export async function fetchSGSSeries(
  serie: number | string,
  dataInicial?: string,
  dataFinal?: string
) {
  const cacheKey = `sgs_${serie}_${dataInicial}_${dataFinal}`;

  return apiCache.withFallback(
    cacheKey,
    async () => {
      if (useMocks()) {
        const today = new Date();
        const dataStr = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${today.getFullYear()}`;
        const mock: Record<string, string> = {
          "11": "11.25",
          "433": "4.23",
          "4389": "11.15",
        };
        return [{ data: dataStr, valor: mock[String(serie)] ?? "0.0" }];
      }
      const params = new URLSearchParams();
      params.set("serie", String(serie));
      if (dataInicial) params.set("dataInicial", dataInicial);
      if (dataFinal) params.set("dataFinal", dataFinal);
      let res = await fetch(`/api/data/sgs-series?${params.toString()}`);
      if (!res.ok) res = await fetch(`/api/proxy/sgs?${params.toString()}`);
      if (!res.ok) throw new Error("SGS fetch failed");
      const json = await res.json();
      return (json.data ?? json) as Array<{ data: string; valor: string }>;
    },
    3 * 60 * 1000
  ); // Cache por 3 minutos
}

export async function fetchLatestSGSValue(serie: number | string): Promise<number | null> {
  const cacheKey = `sgs_latest_${serie}`;

  return apiCache.withFallback(
    cacheKey,
    async () => {
      const series = await fetchSGSSeries(serie);
      if (!series?.length) return null;
      const last = series[series.length - 1];
      const v = parseFloat(last.valor.replace(",", "."));
      return isNaN(v) ? null : v;
    },
    3 * 60 * 1000
  );
}
