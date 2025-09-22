"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchLatestSeriesValue } from "@/services/fred";
import { fetchLatestSGSValue } from "@/services/sgs";
import { fetchLatestPTAX } from "@/services/ptax";
import { fetchDebentures } from "@/services/anbima";

export default function TestAPIsPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testAPI = async (name: string, fn: () => Promise<any>) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    try {
      const result = await fn();
      setResults((prev) => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error: any) {
      setResults((prev) => ({ ...prev, [name]: { success: false, error: error.message } }));
    }
    setLoading((prev) => ({ ...prev, [name]: false }));
  };

  const tests = [
    {
      name: "FRED DGS10",
      fn: () => fetchLatestSeriesValue("DGS10"),
    },
    {
      name: "FRED DGS2",
      fn: () => fetchLatestSeriesValue("DGS2"),
    },
    {
      name: "SGS Selic",
      fn: () => fetchLatestSGSValue(11),
    },
    {
      name: "SGS IPCA",
      fn: () => fetchLatestSGSValue(433),
    },
    {
      name: "PTAX USD/BRL",
      fn: () => fetchLatestPTAX(),
    },
    {
      name: "ANBIMA Debentures",
      fn: () => fetchDebentures(),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">API Integration Tests</h1>
        <p className="text-muted-foreground">Test all external API integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardHeader>
              <CardTitle className="text-sm">{test.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => testAPI(test.name, test.fn)}
                disabled={loading[test.name]}
                size="sm"
                className="mb-3">
                {loading[test.name] ? "Testing..." : "Test"}
              </Button>

              {results[test.name] && (
                <div
                  className={`p-3 rounded text-xs ${
                    results[test.name].success
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}>
                  {results[test.name].success ? (
                    <pre>{JSON.stringify(results[test.name].data, null, 2)}</pre>
                  ) : (
                    <p>Error: {results[test.name].error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test All APIs</CardTitle>
          <CardDescription>Run all tests at once</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              tests.forEach((test) => testAPI(test.name, test.fn));
            }}
            disabled={Object.values(loading).some(Boolean)}>
            Run All Tests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
