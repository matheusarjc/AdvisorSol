export async function fetchSGSSeries(
  serie: number | string,
  dataInicial?: string,
  dataFinal?: string
) {
  const params = new URLSearchParams();
  params.set("serie", String(serie));
  if (dataInicial) params.set("dataInicial", dataInicial);
  if (dataFinal) params.set("dataFinal", dataFinal);
  const res = await fetch(`/api/proxy/sgs?${params.toString()}`);
  if (!res.ok) throw new Error("SGS fetch failed");
  const json = await res.json();
  return json.data as Array<{ data: string; valor: string }>;
}
