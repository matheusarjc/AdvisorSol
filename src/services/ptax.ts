export async function fetchPTAX(dataInicial?: string, dataFinal?: string) {
  const params = new URLSearchParams();
  if (dataInicial) params.set("dataInicial", dataInicial);
  if (dataFinal) params.set("dataFinal", dataFinal);
  const res = await fetch(`/api/proxy/ptax?${params.toString()}`);
  if (!res.ok) throw new Error("PTAX fetch failed");
  const json = await res.json();
  return json.data as Array<any>;
}
