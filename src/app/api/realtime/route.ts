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
      // Compose an update payload (mock + current server time)
      const now = new Date().toISOString();
      const update = {
        ts: now,
        macro: {
          dgs10: 4.25 + Math.random() * 0.02 - 0.01,
          dgs2: 4.75 + Math.random() * 0.02 - 0.01,
          vix: 16.5 + Math.random() * 0.5 - 0.25,
        },
        fx: {
          usdbrl: {
            compra: 5.18 + Math.random() * 0.02 - 0.01,
            venda: 5.19 + Math.random() * 0.02 - 0.01,
          },
        },
        news: [
          { id: `n-${Date.now()}`, title: "Atualização de mercado", source: "Realtime", ts: now },
        ],
      };
      await sse(writer, update);
    } catch {}
  }

  // Kickoff and periodic updates (~2s)
  pushTick();
  timer = setInterval(pushTick, 2000);

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
