export async function treasury(endpoint: string, params: Record<string, string>) {
  const sp = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`/api/proxy/treasury?${sp.toString()}`);
  if (!res.ok) throw new Error("Treasury fetch failed");
  return (await res.json()).data;
}
