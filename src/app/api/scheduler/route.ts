import { NextRequest, NextResponse } from "next/server";
import { scheduler, setupPreIngestionJobs } from "@/lib/scheduler";

// Initialize scheduler on first API call
let schedulerInitialized = false;

export async function GET(request: NextRequest) {
  if (!schedulerInitialized) {
    setupPreIngestionJobs();
    scheduler.start();
    schedulerInitialized = true;
  }

  const jobs = scheduler.getJobs();
  return NextResponse.json({
    status: "running",
    jobs: jobs.map((job) => ({
      id: job.id,
      name: job.name,
      schedule: job.schedule,
      enabled: job.enabled,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
    })),
  });
}

export async function POST(request: NextRequest) {
  const { action } = await request.json();

  if (!schedulerInitialized) {
    setupPreIngestionJobs();
    schedulerInitialized = true;
  }

  switch (action) {
    case "start":
      scheduler.start();
      return NextResponse.json({ status: "started" });
    case "stop":
      scheduler.stop();
      return NextResponse.json({ status: "stopped" });
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
