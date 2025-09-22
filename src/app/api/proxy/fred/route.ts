import { NextResponse } from "next/server";

// Mock FRED data since API key is required for production
// In production, set FRED_API_KEY environment variable
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const seriesId = searchParams.get("series_id");

  // Return mock data for development
  const mockData = getMockFredData(seriesId);

  return NextResponse.json({ data: mockData });
}

function getMockFredData(seriesId: string | null) {
  const baseDate = new Date().toISOString().split("T")[0];

  switch (seriesId) {
    case "DGS10":
      return {
        observations: [{ date: baseDate, value: "4.25" }],
      };
    case "DGS2":
      return {
        observations: [{ date: baseDate, value: "4.75" }],
      };
    case "DGS3MO":
      return {
        observations: [{ date: baseDate, value: "5.35" }],
      };
    case "DGS1MO":
      return {
        observations: [{ date: baseDate, value: "5.25" }],
      };
    case "DGS6MO":
      return {
        observations: [{ date: baseDate, value: "5.15" }],
      };
    case "DGS1":
      return {
        observations: [{ date: baseDate, value: "4.95" }],
      };
    case "DGS5":
      return {
        observations: [{ date: baseDate, value: "4.35" }],
      };
    case "DGS30":
      return {
        observations: [{ date: baseDate, value: "4.45" }],
      };
    case "VIXCLS":
      return {
        observations: [{ date: baseDate, value: "16.5" }],
      };
    default:
      return {
        observations: [{ date: baseDate, value: "0.0" }],
      };
  }
}
