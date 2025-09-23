import { NextRequest } from "next/server";

export const runtime = "edge";

function sse(res: WritableStreamDefaultWriter, data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  return res.write(encoder.encode(payload));
}

const encoder = new TextEncoder();

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Headers for SSE
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  let timer: any;

  async function pushTick() {
    try {
      const now = new Date().toISOString();
      // pull from internal endpoints (best-effort)
      const [di, tesouro, debentures, sgsSelic, sgsIpca, sgsCdi] = await Promise.allSettled([
        fetch(new URL("/api/data/di-curve", req.url).toString()).then((r) => r.json()),
        fetch(new URL("/api/data/tesouro", req.url).toString()).then((r) => r.json()),
        fetch(new URL("/api/data/debentures", req.url).toString()).then((r) => r.json()),
        fetch(new URL("/api/data/sgs-series?serie=11", req.url).toString()).then((r) => r.json()),
        fetch(new URL("/api/data/sgs-series?serie=433", req.url).toString()).then((r) => r.json()),
        fetch(new URL("/api/data/sgs-series?serie=4389", req.url).toString()).then((r) => r.json()),
      ]);

      const update = {
        ts: now,
        rfbr: {
          di_curve: di.status === "fulfilled" ? di.value.data : [],
          tesouro: tesouro.status === "fulfilled" ? tesouro.value.data : [],
          debentures: debentures.status === "fulfilled" ? debentures.value.data : [],
          sgs: {
            selic: sgsSelic.status === "fulfilled" ? sgsSelic.value.data : [],
            ipca: sgsIpca.status === "fulfilled" ? sgsIpca.value.data : [],
            cdi: sgsCdi.status === "fulfilled" ? sgsCdi.value.data : [],
          },
        },
      } as any;

      await sse(writer, update);
    } catch {}
  }

  // Kickoff and periodic updates (~10s)
  pushTick();
  timer = setInterval(pushTick, 10000);

  const close = async () => {
    clearInterval(timer);
    try {
      await writer.close();
    } catch {}
  };

  // Close on client abort
  req.signal.addEventListener("abort", close);

  return new Response(readable, { headers });
}
