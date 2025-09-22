"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe,
  Building2,
  BarChart3,
  AlertTriangle,
  Target,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { SectorHeatmap } from "../charts/SectorHeatmap";
import { ComparativeChart } from "../charts/ComparativeChart";
import { DashboardPersonalization } from "../DashboardPersonalization";

const marketData = [
  { name: "Jan", ibovespa: 115000, sp500: 4500, selic: 13.75, vix: 18.5 },
  { name: "Fev", ibovespa: 118000, sp500: 4600, selic: 13.25, vix: 16.2 },
  { name: "Mar", ibovespa: 122000, sp500: 4700, selic: 12.75, vix: 19.1 },
  { name: "Abr", ibovespa: 120000, sp500: 4650, selic: 12.25, vix: 17.8 },
  { name: "Mai", ibovespa: 125000, sp500: 4800, selic: 11.75, vix: 15.9 },
  { name: "Jun", ibovespa: 128000, sp500: 4900, selic: 11.25, vix: 16.5 },
];

const indicators = [
  {
    title: "Ibovespa",
    value: "128.450",
    change: "+2.35%",
    icon: BarChart3,
    positive: true,
    description: "Fechamento anterior",
  },
  {
    title: "S&P 500",
    value: "4.891",
    change: "+1.82%",
    icon: TrendingUp,
    positive: true,
    description: "Mercado americano",
  },
  {
    title: "Selic",
    value: "11.25%",
    change: "-0.50pp",
    icon: Building2,
    positive: false,
    description: "Taxa básica",
  },
  {
    title: "USD/BRL",
    value: "5.18",
    change: "-1.24%",
    icon: DollarSign,
    positive: true,
    description: "Taxa de câmbio",
  },
];

const alerts = [
  {
    type: "warning",
    message: "Curva americana com sinais de inversão (2Y-10Y: -15bps)",
    priority: "high",
  },
  { type: "info", message: "Debênture PETR21 com spread elevado (+250bps)", priority: "medium" },
  { type: "success", message: "VIX abaixo de 17 - baixa volatilidade", priority: "low" },
];

const riskMetrics = [
  { metric: "VaR 1 dia (95%)", value: "-2.1%", status: "normal" },
  { metric: "Beta Portfolio", value: "0.85", status: "good" },
  { metric: "Sharpe Ratio", value: "1.42", status: "good" },
  { metric: "Max Drawdown", value: "-8.3%", status: "warning" },
];

export function Dashboard() {
  const [dashboardWidgets, setDashboardWidgets] = useState<any[]>([]);

  const handleSaveWidgets = (widgets: any[]) => {
    setDashboardWidgets(widgets);
    console.log("Widgets salvos:", widgets);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">Visão geral dos mercados e portfolio</p>
        </div>
        <div className="flex items-center space-x-2">
          <DashboardPersonalization onSave={handleSaveWidgets} />
          <Badge variant="outline" className="text-xs">
            Atualizado: 16:30
          </Badge>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Alertas Inteligentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.priority === "high"
                    ? "border-l-red-500 bg-red-50 dark:bg-red-950/20"
                    : alert.priority === "medium"
                    ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                    : "border-l-green-500 bg-green-50 dark:bg-green-950/20"
                }`}>
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    <p className="text-2xl font-medium">{item.value}</p>
                    <div className="flex items-center space-x-1">
                      {item.positive ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${item.positive ? "text-green-600" : "text-red-600"}`}>
                        {item.change}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Índices</CardTitle>
            <CardDescription>Evolução YTD dos principais índices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ibovespa"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Ibovespa"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sp500"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="S&P 500"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volatilidade de Mercado</CardTitle>
            <CardDescription>VIX - Índice de volatilidade implícita</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="vix"
                  stroke="hsl(var(--chart-3))"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.3}
                  name="VIX"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Risco e Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Métricas de Risco</span>
            </CardTitle>
            <CardDescription>Análise quantitativa do portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{item.value}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === "good"
                          ? "bg-green-500"
                          : item.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa Selic vs. Inflação</CardTitle>
            <CardDescription>Taxa real de juros no Brasil</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="selic" fill="hsl(var(--chart-4))" name="Selic %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Setorial Avançado */}
      <SectorHeatmap market="BR" />

      {/* Análise Comparativa */}
      <ComparativeChart />
    </div>
  );
}
