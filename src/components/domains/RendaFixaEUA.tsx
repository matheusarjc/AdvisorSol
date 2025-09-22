"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "../ui/badge";
import { fetchLatestSeriesValue, approximateCorpSpreadBaaMinusAaa } from "@/services/fred";
import { useRealtime } from "@/components/providers/realtime-provider";

const initialTreasuryYieldData = [
  { maturity: "1M", rate: 0 },
  { maturity: "3M", rate: 0 },
  { maturity: "6M", rate: 0 },
  { maturity: "1Y", rate: 0 },
  { maturity: "2Y", rate: 0 },
  { maturity: "5Y", rate: 0 },
  { maturity: "10Y", rate: 0 },
  { maturity: "30Y", rate: 0 },
];

const spreadsData = [
  { name: "Jan", creditSpread: 150, termSpread: 180, yieldCurve: 4.2 },
  { name: "Fev", creditSpread: 145, termSpread: 175, yieldCurve: 4.1 },
  { name: "Mar", creditSpread: 155, termSpread: 185, yieldCurve: 4.3 },
  { name: "Abr", creditSpread: 160, termSpread: 190, yieldCurve: 4.2 },
  { name: "Mai", creditSpread: 140, termSpread: 170, yieldCurve: 4.0 },
  { name: "Jun", creditSpread: 135, termSpread: 165, yieldCurve: 4.25 },
];

const indicators = [
  { title: "Fed Funds Rate", value: "5.25%", description: "Taxa básica do FED" },
  { title: "10Y Treasury", value: "4.25%", description: "Título 10 anos" },
  { title: "2Y-10Y Spread", value: "-50 bps", description: "Curva invertida" },
  { title: "DXY Index", value: "103.25", description: "Índice do dólar" },
];

export function RendaFixaEUA() {
  const [dgs10, setDgs10] = useState<number | null>(null);
  const [dgs2, setDgs2] = useState<number | null>(null);
  const [dgs1y, setDgs1y] = useState<number | null>(null);
  const [dgs6m, setDgs6m] = useState<number | null>(null);
  const [dgs3m, setDgs3m] = useState<number | null>(null);
  const [dgs1m, setDgs1m] = useState<number | null>(null);
  const [dgs5, setDgs5] = useState<number | null>(null);
  const [dgs30, setDgs30] = useState<number | null>(null);
  const [curve, setCurve] = useState(initialTreasuryYieldData);
  const [corpSpreadApprox, setCorpSpreadApprox] = useState<number | null>(null);
  const { lastUpdate } = useRealtime();

  useEffect(() => {
    (async () => {
      try {
        const [v1m, v3m, v6m, v1y, v2y, v5y, v10y, v30y] = await Promise.all([
          fetchLatestSeriesValue("DGS1MO"),
          fetchLatestSeriesValue("DGS3MO"),
          fetchLatestSeriesValue("DGS6MO"),
          fetchLatestSeriesValue("DGS1"),
          fetchLatestSeriesValue("DGS2"),
          fetchLatestSeriesValue("DGS5"),
          fetchLatestSeriesValue("DGS10"),
          fetchLatestSeriesValue("DGS30"),
        ]);
        setDgs1m(v1m);
        setDgs3m(v3m);
        setDgs6m(v6m);
        setDgs1y(v1y);
        setDgs2(v2y);
        setDgs5(v5y);
        setDgs10(v10y);
        setDgs30(v30y);
        setCurve([
          { maturity: "1M", rate: v1m ?? 0 },
          { maturity: "3M", rate: v3m ?? 0 },
          { maturity: "6M", rate: v6m ?? 0 },
          { maturity: "1Y", rate: v1y ?? 0 },
          { maturity: "2Y", rate: v2y ?? 0 },
          { maturity: "5Y", rate: v5y ?? 0 },
          { maturity: "10Y", rate: v10y ?? 0 },
          { maturity: "30Y", rate: v30y ?? 0 },
        ]);
        const approx = await approximateCorpSpreadBaaMinusAaa();
        setCorpSpreadApprox(approx);
      } catch (e) {}
    })();
  }, []);

  // Realtime updates for 2Y, 10Y and term spread
  useEffect(() => {
    if (!lastUpdate?.macro) return;
    const { dgs10: ten, dgs2: two } = lastUpdate.macro;
    if (typeof ten === "number") setDgs10(ten);
    if (typeof two === "number") setDgs2(two);
    if (typeof ten === "number" && typeof two === "number") {
      const updated = curve.map((p) =>
        p.maturity === "10Y" ? { ...p, rate: ten } : p.maturity === "2Y" ? { ...p, rate: two } : p
      );
      setCurve(updated);
    }
  }, [lastUpdate]);

  const termSpread = dgs10 != null && dgs2 != null ? (dgs10 - dgs2) * 100 : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Renda Fixa EUA</h1>
        <p className="text-gray-600">Análise de Treasuries e mercado de renda fixa americano</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "10Y Treasury",
            value: dgs10 != null ? `${dgs10.toFixed(2)}%` : "--",
            description: "Título 10 anos",
          },
          {
            title: "2Y Treasury",
            value: dgs2 != null ? `${dgs2.toFixed(2)}%` : "--",
            description: "Título 2 anos",
          },
          {
            title: "2Y-10Y Spread",
            value: termSpread != null ? `${termSpread.toFixed(0)} bps` : "--",
            description: termSpread != null && termSpread < 0 ? "Curva invertida" : "Curva normal",
          },
          {
            title: "3M Treasury",
            value: dgs3m != null ? `${dgs3m.toFixed(2)}%` : "--",
            description: "Título 3 meses",
          },
        ].map((indicator, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">{indicator.title}</p>
                <p className="text-2xl font-semibold text-blue-900">{indicator.value}</p>
                <p className="text-xs text-gray-500 mt-1">{indicator.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Curva de Treasuries</CardTitle>
          <CardDescription>Rendimentos dos títulos do Tesouro americano</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={curve}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="maturity" />
              <YAxis domain={["dataMin - 0.3", "dataMax + 0.3"]} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Yield"]}
                labelFormatter={(label) => `Maturity: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ fill: "#dc2626", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Spreads</CardTitle>
            <CardDescription>Evolução dos spreads de crédito (bps)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={spreadsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="creditSpread"
                  stroke="#1e3a8a"
                  fill="#1e3a8a"
                  fillOpacity={0.3}
                  name="Credit Spread"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Term Structure</CardTitle>
            <CardDescription>Spread de prazo (10Y - 2Y)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={spreadsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="termSpread"
                  stroke="#16a34a"
                  strokeWidth={3}
                  name="Term Spread (bps)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spreads IG Aproximados</CardTitle>
          <CardDescription>Proxy Baa - Aaa (FRED) em bps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">IG Corp Spread (aprox.)</p>
            <p
              className={`text-2xl font-semibold ${
                corpSpreadApprox != null && corpSpreadApprox > 150
                  ? "text-red-600"
                  : "text-green-600"
              }`}>
              {corpSpreadApprox != null ? `${corpSpreadApprox} bps` : "--"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spreads Setoriais</CardTitle>
          <CardDescription>Análise de risco por setor no mercado corporativo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { sector: "Technology", spread: "95 bps", rating: "A+", trend: "stable" },
              { sector: "Healthcare", spread: "110 bps", rating: "AA-", trend: "tightening" },
              { sector: "Financials", spread: "125 bps", rating: "A", trend: "widening" },
              { sector: "Energy", spread: "175 bps", rating: "BBB+", trend: "stable" },
              { sector: "Utilities", spread: "105 bps", rating: "A+", trend: "tightening" },
              { sector: "Industrials", spread: "135 bps", rating: "A-", trend: "stable" },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{item.sector}</h4>
                  <Badge variant="outline">{item.rating}</Badge>
                </div>
                <p className="text-lg font-semibold text-blue-900 mb-1">{item.spread}</p>
                <p
                  className={`text-sm ${
                    item.trend === "tightening"
                      ? "text-green-600"
                      : item.trend === "widening"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}>
                  {item.trend === "tightening"
                    ? "↓ Comprimindo"
                    : item.trend === "widening"
                    ? "↑ Expandindo"
                    : "→ Estável"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
