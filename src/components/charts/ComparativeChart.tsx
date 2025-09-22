import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Download, TrendingUp, BarChart3 } from "lucide-react";

const comparativeData = [
  { date: "Jan 23", ibovespa: 100, sp500: 100, selic: 13.75, usdBrl: 5.2, dxy: 100 },
  { date: "Fev 23", ibovespa: 105.2, sp500: 98.5, selic: 13.75, usdBrl: 5.25, dxy: 101.2 },
  { date: "Mar 23", ibovespa: 108.1, sp500: 96.8, selic: 13.75, usdBrl: 5.18, dxy: 102.5 },
  { date: "Abr 23", ibovespa: 112.5, sp500: 101.2, selic: 13.75, usdBrl: 5.05, dxy: 100.8 },
  { date: "Mai 23", ibovespa: 115.8, sp500: 103.5, selic: 13.25, usdBrl: 4.95, dxy: 99.5 },
  { date: "Jun 23", ibovespa: 118.2, sp500: 107.8, selic: 13.25, usdBrl: 4.88, dxy: 98.2 },
  { date: "Jul 23", ibovespa: 122.1, sp500: 110.5, selic: 12.75, usdBrl: 4.92, dxy: 99.1 },
  { date: "Ago 23", ibovespa: 119.8, sp500: 108.2, selic: 12.75, usdBrl: 5.05, dxy: 101.5 },
  { date: "Set 23", ibovespa: 116.5, sp500: 105.8, selic: 12.25, usdBrl: 5.15, dxy: 103.2 },
  { date: "Out 23", ibovespa: 113.2, sp500: 103.1, selic: 11.75, usdBrl: 5.25, dxy: 105.8 },
  { date: "Nov 23", ibovespa: 118.5, sp500: 109.2, selic: 11.75, usdBrl: 4.95, dxy: 102.1 },
  { date: "Dez 23", ibovespa: 124.8, sp500: 115.8, selic: 11.25, usdBrl: 4.88, dxy: 100.5 },
];

const presets = [
  {
    id: "indices",
    name: "Índices",
    description: "Ibovespa vs S&P 500",
    metrics: ["ibovespa", "sp500"],
    colors: ["hsl(var(--chart-1))", "hsl(var(--chart-2))"],
  },
  {
    id: "macro",
    name: "Macro",
    description: "Selic vs DXY vs USD/BRL",
    metrics: ["selic", "dxy", "usdBrl"],
    colors: ["hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"],
  },
  {
    id: "complete",
    name: "Completo",
    description: "Todos os indicadores",
    metrics: ["ibovespa", "sp500", "selic", "usdBrl"],
    colors: [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-5))",
    ],
  },
];

const metricLabels = {
  ibovespa: "Ibovespa",
  sp500: "S&P 500",
  selic: "Selic (%)",
  usdBrl: "USD/BRL",
  dxy: "DXY",
};

export function ComparativeChart() {
  const [selectedPreset, setSelectedPreset] = useState("indices");
  const [timeframe, setTimeframe] = useState("12M");
  const [normalized, setNormalized] = useState(true);

  const currentPreset = presets.find((p) => p.id === selectedPreset);

  const processedData = normalized
    ? comparativeData
    : comparativeData.map((item) => ({
        ...item,
        selic: item.selic,
        usdBrl: item.usdBrl * 20,
      }));

  const getLatestValue = (metric: string) => {
    const latest = comparativeData[comparativeData.length - 1];
    return latest[metric as keyof typeof latest];
  };

  const getVariation = (metric: string) => {
    const first = comparativeData[0];
    const latest = comparativeData[comparativeData.length - 1];
    const variation =
      (((latest[metric as keyof typeof latest] as number) -
        (first[metric as keyof typeof first] as number)) /
        (first[metric as keyof typeof first] as number)) *
      100;
    return variation;
  };

  const exportData = () => {
    console.log("Exportando dados comparativos...");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Análise Comparativa</span>
            </CardTitle>
            <CardDescription>
              {currentPreset?.description} - {normalized ? "Base 100" : "Valores absolutos"}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Preset</label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="12M">12M</SelectItem>
                <SelectItem value="2Y">2A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Normalização</label>
            <div className="flex space-x-2">
              <Button
                variant={normalized ? "default" : "outline"}
                size="sm"
                onClick={() => setNormalized(true)}>
                Base 100
              </Button>
              <Button
                variant={!normalized ? "default" : "outline"}
                size="sm"
                onClick={() => setNormalized(false)}>
                Absoluto
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {currentPreset?.metrics.map((metric, index) => (
            <div key={metric} className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">
                  {metricLabels[metric as keyof typeof metricLabels]}
                </span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentPreset.colors[index] }}></div>
              </div>
              <div className="font-semibold">
                {(() => {
                  const value = getLatestValue(metric);
                  return typeof value === "number"
                    ? value.toFixed(metric === "selic" ? 2 : metric.includes("Brl") ? 2 : 1)
                    : value;
                })()}
                {metric === "selic" && "%"}
              </div>
              <div
                className={`text-xs flex items-center ${
                  getVariation(metric) > 0 ? "text-green-600" : "text-red-600"
                }`}>
                <TrendingUp
                  className={`h-3 w-3 mr-1 ${getVariation(metric) < 0 ? "rotate-180" : ""}`}
                />
                {getVariation(metric) > 0 ? "+" : ""}
                {getVariation(metric).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                typeof value === "number" ? value.toFixed(2) : value,
                metricLabels[name as keyof typeof metricLabels],
              ]}
            />
            {normalized && <ReferenceLine y={100} stroke="#888" strokeDasharray="2 2" />}

            {currentPreset?.metrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={currentPreset.colors[index]}
                strokeWidth={2}
                dot={false}
                name={metric}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
