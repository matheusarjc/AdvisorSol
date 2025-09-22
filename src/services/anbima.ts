export async function anbima(path: string, params?: Record<string, string>) {
  const sp = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await fetch(`/api/proxy/anbima?path=${encodeURIComponent(path)}${sp}`);
  if (!res.ok) throw new Error("ANBIMA fetch failed");
  return (await res.json()).data;
}
