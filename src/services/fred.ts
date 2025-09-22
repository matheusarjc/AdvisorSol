export async function fred(path: string, params: Record<string, string>) {
  const sp = new URLSearchParams({ path, ...params });
  const res = await fetch(`/api/proxy/fred?${sp.toString()}`);
  if (!res.ok) throw new Error("FRED fetch failed");
  return (await res.json()).data;
}
