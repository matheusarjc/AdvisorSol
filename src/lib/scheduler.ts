// Simple in-memory job scheduler for pre-ingestion tasks
// In production, this would be replaced by a proper job queue like Bull/BullMQ or pg-boss

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string; // cron-like expression
  handler: () => Promise<void>;
  lastRun?: Date;
  nextRun?: Date;
  enabled: boolean;
}

class SimpleScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  addJob(job: ScheduledJob) {
    this.jobs.set(job.id, job);
    if (job.enabled) {
      this.scheduleJob(job);
    }
  }

  removeJob(id: string) {
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
    this.jobs.delete(id);
  }

  private scheduleJob(job: ScheduledJob) {
    // Simple interval-based scheduling (for demo purposes)
    // In production, use a proper cron parser
    const intervalMs = this.parseSchedule(job.schedule);

    const interval = setInterval(async () => {
      try {
        console.log(`Running scheduled job: ${job.name}`);
        job.lastRun = new Date();
        await job.handler();
        job.nextRun = new Date(Date.now() + intervalMs);
      } catch (error) {
        console.error(`Error in scheduled job ${job.name}:`, error);
      }
    }, intervalMs);

    this.intervals.set(job.id, interval);
    job.nextRun = new Date(Date.now() + intervalMs);
  }

  private parseSchedule(schedule: string): number {
    // Very basic schedule parser - in production use a proper cron library
    switch (schedule) {
      case "*/5 * * * *":
        return 5 * 60 * 1000; // every 5 minutes
      case "0 */1 * * *":
        return 60 * 60 * 1000; // hourly
      case "0 0 * * *":
        return 24 * 60 * 60 * 1000; // daily
      case "0 0 * * 1":
        return 7 * 24 * 60 * 60 * 1000; // weekly
      default:
        return 60 * 60 * 1000; // default hourly
    }
  }

  getJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  start() {
    console.log("Scheduler started");
    for (const job of this.jobs.values()) {
      if (job.enabled) {
        this.scheduleJob(job);
      }
    }
  }

  stop() {
    console.log("Scheduler stopped");
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }
}

export const scheduler = new SimpleScheduler();

// Pre-configured ingestion jobs
export function setupPreIngestionJobs() {
  // SGS data refresh (hourly)
  scheduler.addJob({
    id: "sgs-refresh",
    name: "SGS Data Refresh",
    schedule: "0 */1 * * *", // hourly
    enabled: true,
    handler: async () => {
      // Pre-fetch and cache common SGS series
      const { fetchLatestSGSValue } = await import("../services/sgs");
      await Promise.all([
        fetchLatestSGSValue(11), // Selic
        fetchLatestSGSValue(433), // IPCA
        fetchLatestSGSValue(4389), // CDI
      ]);
    },
  });

  // FRED data refresh (hourly)
  scheduler.addJob({
    id: "fred-refresh",
    name: "FRED Data Refresh",
    schedule: "0 */1 * * *", // hourly
    enabled: true,
    handler: async () => {
      const { fetchLatestSeriesValue } = await import("../services/fred");
      await Promise.all([
        fetchLatestSeriesValue("DGS10"),
        fetchLatestSeriesValue("DGS2"),
        fetchLatestSeriesValue("DGS3MO"),
        fetchLatestSeriesValue("VIXCLS"),
      ]);
    },
  });

  // PTAX refresh (daily)
  scheduler.addJob({
    id: "ptax-refresh",
    name: "PTAX Data Refresh",
    schedule: "0 0 * * *", // daily
    enabled: true,
    handler: async () => {
      const { fetchLatestPTAXValue } = await import("../services/ptax");
      await fetchLatestPTAXValue();
    },
  });

  // ANBIMA data refresh (daily)
  scheduler.addJob({
    id: "anbima-refresh",
    name: "ANBIMA Data Refresh",
    schedule: "0 0 * * *", // daily
    enabled: true,
    handler: async () => {
      const { fetchDebentures, fetchCreditCurves } = await import("../services/anbima");
      await Promise.all([fetchDebentures(), fetchCreditCurves()]);
    },
  });

  // Stocks data warm-up (hourly)
  scheduler.addJob({
    id: "stocks-refresh",
    name: "Stocks Data Warm-Up",
    schedule: "0 */1 * * *", // hourly
    enabled: true,
    handler: async () => {
      try {
        const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META"];
        const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        await Promise.all(
          symbols.flatMap((sym) => [
            fetch(`${base}/api/data/stocks?type=quote&symbol=${sym}`),
            fetch(`${base}/api/data/stocks?type=indicators&symbol=${sym}`),
            fetch(`${base}/api/data/stocks?type=timeseries&symbol=${sym}`),
          ])
        );
      } catch (e) {
        console.error("Stocks warm-up failed", e);
      }
    },
  });
}
