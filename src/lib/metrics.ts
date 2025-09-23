type MetricSample = {
  count: number;
  ok: number;
  fail: number;
  lastDurationMs?: number;
  avgDurationMs?: number;
  lastTs?: number;
};

class MetricsRegistry {
  private store = new Map<string, MetricSample>();

  record(name: string, durationMs: number, ok: boolean) {
    const m = this.store.get(name) || { count: 0, ok: 0, fail: 0 };
    m.count += 1;
    if (ok) m.ok += 1;
    else m.fail += 1;
    m.lastDurationMs = durationMs;
    m.lastTs = Date.now();
    // simple running average
    const prevAvg = m.avgDurationMs || 0;
    m.avgDurationMs = prevAvg + (durationMs - prevAvg) / m.count;
    this.store.set(name, m);
  }

  snapshot() {
    return Array.from(this.store.entries()).reduce<Record<string, MetricSample>>((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});
  }
}

// singleton across HMR
// @ts-ignore
const globalAny = globalThis as any;
export const metrics: MetricsRegistry = globalAny.__metrics || new MetricsRegistry();
if (!globalAny.__metrics) {
  globalAny.__metrics = metrics;
}

export function recordMetric(name: string, durationMs: number, ok: boolean) {
  metrics.record(name, durationMs, ok);
}

export function getMetricsSnapshot() {
  return metrics.snapshot();
}
