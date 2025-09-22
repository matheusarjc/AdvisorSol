export async function treasury(endpoint: string, params: Record<string, string>) {
  const sp = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`/api/proxy/treasury?${sp.toString()}`);
  if (!res.ok) throw new Error("Treasury fetch failed");
  return (await res.json()).data;
}

// Helper for Daily Treasury Par Yield Curve Rates dataset
// See: /services/api/fiscal_service/v2/accounting/od/avg_interest_rates
export async function fetchParYieldRates(params: Record<string, string> = {}) {
  const data = await treasury("/v2/accounting/od/avg_interest_rates", params);
  return data?.data ?? [];
}
