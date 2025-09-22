"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
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
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Zap,
} from "lucide-react";
import { fetchLatestSeriesValue } from "@/services/fred";
import { fetchLatestSGSValue } from "@/services/sgs";
import { fetchLatestPTAX } from "@/services/ptax";
import { fetchCommodities } from "@/services/commodities";
import { useRealtime } from "@/components/providers/realtime-provider";

const macroIndicators = [
  {
    indicator: "PIB Trimestral (USA)",
    current: 2.1,
    previous: 2.4,
    forecast: 1.8,
    impact: "High",
    nextRelease: "2024-01-26",
    trend: "down",
  },
  {
    indicator: "Inflação Core PCE",
    current: 3.2,
    previous: 3.5,
    forecast: 3.0,
    impact: "High",
    nextRelease: "2024-01-27",
    trend: "down",
  },
  {
    indicator: "Taxa de Desemprego",
    current: 3.7,
    previous: 3.5,
    forecast: 3.6,
    impact: "Medium",
    nextRelease: "2024-02-02",
    trend: "up",
  },
  {
    indicator: "NFP (Payrolls)",
    current: 216000,
    previous: 199000,
    forecast: 185000,
    impact: "High",
    nextRelease: "2024-02-02",
    trend: "up",
  },
  {
    indicator: "PMI Manufacturing",
    current: 48.2,
    previous: 47.9,
    forecast: 48.5,
    impact: "Medium",
    nextRelease: "2024-02-01",
    trend: "up",
  },
];

const economicData = [
  { month: "Jan 23", gdp: 2.6, inflation: 6.4, unemployment: 3.4, fedRate: 4.75 },
  { month: "Fev 23", gdp: 2.4, inflation: 6.0, unemployment: 3.6, fedRate: 5.0 },
  { month: "Mar 23", gdp: 2.0, inflation: 5.0, unemployment: 3.5, fedRate: 5.25 },
  { month: "Abr 23", gdp: 1.3, inflation: 4.9, unemployment: 3.4, fedRate: 5.25 },
  { month: "Mai 23", gdp: 2.1, inflation: 4.0, unemployment: 3.7, fedRate: 5.25 },
  { month: "Jun 23", gdp: 2.5, inflation: 3.0, unemployment: 3.6, fedRate: 5.5 },
];

const yieldCurveData = [
  { maturity: "1M", rate: 5.35, weekAgo: 5.4, monthAgo: 5.25 },
  { maturity: "3M", rate: 5.42, weekAgo: 5.45, monthAgo: 5.3 },
  { maturity: "6M", rate: 5.38, weekAgo: 5.41, monthAgo: 5.28 },
  { maturity: "1Y", rate: 5.15, weekAgo: 5.18, monthAgo: 5.05 },
  { maturity: "2Y", rate: 4.85, weekAgo: 4.88, monthAgo: 4.75 },
  { maturity: "5Y", rate: 4.52, weekAgo: 4.55, monthAgo: 4.42 },
  { maturity: "10Y", rate: 4.35, weekAgo: 4.38, monthAgo: 4.25 },
  { maturity: "30Y", rate: 4.48, weekAgo: 4.51, monthAgo: 4.38 },
];

const globalMarkets = [
  { country: "Estados Unidos", index: "S&P 500", value: 4891, change: 1.82, currency: "USD" },
  { country: "Brasil", index: "Ibovespa", value: 128450, change: 2.35, currency: "BRL" },
  { country: "Europa", index: "Euro Stoxx 50", value: 4245, change: -0.45, currency: "EUR" },
  { country: "Reino Unido", index: "FTSE 100", value: 7689, change: 0.78, currency: "GBP" },
  { country: "Japão", index: "Nikkei 225", value: 33845, change: -1.12, currency: "JPY" },
  { country: "China", index: "Shanghai Comp", value: 2974, change: 0.95, currency: "CNY" },
];

const commodities = [
  { name: "Petróleo WTI", price: 78.45, change: -1.25, unit: "barrel" },
  { name: "Ouro", price: 2025.3, change: 0.85, unit: "oz" },
  { name: "Prata", price: 23.85, change: 1.45, unit: "oz" },
  { name: "Cobre", price: 3.89, change: -0.78, unit: "lb" },
  { name: "Milho", price: 481.25, change: 2.15, unit: "bushel" },
  { name: "Soja", price: 1247.5, change: 1.35, unit: "bushel" },
];

const correlationData = [
  { asset1: "S&P 500", asset2: "Ibovespa", correlation: 0.75, timeframe: "60D" },
  { asset1: "DXY", asset2: "Ouro", correlation: -0.68, timeframe: "60D" },
  { asset1: "Treasuries 10Y", asset2: "S&P 500", correlation: -0.45, timeframe: "60D" },
  { asset1: "USD/BRL", asset2: "Ibovespa", correlation: -0.62, timeframe: "60D" },
  { asset1: "VIX", asset2: "S&P 500", correlation: -0.85, timeframe: "60D" },
];

const centralBankWatch = [
  {
    bank: "Federal Reserve",
    nextMeeting: "2024-01-31",
    currentRate: "5.25-5.50%",
    expectedAction: "Hold",
    probability: 85,
    hawkish: "Neutral",
  },
  {
    bank: "Banco Central do Brasil",
    nextMeeting: "2024-01-31",
    currentRate: "11.25%",
    expectedAction: "Cut -0.50%",
    probability: 78,
    hawkish: "Dovish",
  },
  {
    bank: "European Central Bank",
    nextMeeting: "2024-01-25",
    currentRate: "4.50%",
    expectedAction: "Hold",
    probability: 92,
    hawkish: "Neutral",
  },
];

export function MercadoMacro() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6M");
  const [realTimeData, setRealTimeData] = useState(economicData);
  const [slope102y, setSlope102y] = useState<number | null>(null);
  const [slope103m, setSlope103m] = useState<number | null>(null);
  const [vix, setVix] = useState<number | null>(null);
  const [selic, setSelic] = useState<number | null>(null);
  const [ptax, setPtax] = useState<{ compra: number; venda: number } | null>(null);
  const { lastUpdate, connected } = useRealtime();

  // Removido o interval de atualização em tempo real para melhorar performance
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRealTimeData((prev) =>
  //       prev.map((item) => ({
  //         ...item,
  //         fedRate: item.fedRate + (Math.random() - 0.5) * 0.05,
  //         inflation: Math.max(0, item.inflation + (Math.random() - 0.5) * 0.1),
  //       }))
  //     );
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    if (!lastUpdate) return;
    if (lastUpdate.macro?.dgs10 != null && lastUpdate.macro?.dgs2 != null) {
      setSlope102y(parseFloat((lastUpdate.macro.dgs10 - lastUpdate.macro.dgs2).toFixed(2)));
    }
    if (lastUpdate.macro?.vix != null) setVix(parseFloat(lastUpdate.macro.vix.toFixed(2)));
    if (lastUpdate.fx?.usdbrl) setPtax(lastUpdate.fx.usdbrl);
  }, [lastUpdate]);

  useEffect(() => {
    (async () => {
      try {
        // SGS Selic diária: série 11 (meta) ou 4189 (Selic diária acumulada), aqui usamos 11 como proxy
        const selicAtual = await fetchLatestSGSValue(11);
        setSelic(selicAtual);
        const ptaxAtual = await fetchLatestPTAX();
        setPtax(ptaxAtual);

        // commodities
        const quotes = await fetchCommodities();
        // map to local shape
        // @ts-ignore
        (commodities as any).splice(
          0,
          (commodities as any).length,
          ...quotes.map((q) => ({ name: q.name, price: q.price, change: q.change, unit: q.unit }))
        );
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1>Mercado Macro</h1>
          <p className="text-muted-foreground">Análise macroeconômica global em tempo real</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            <Badge variant="outline">Selic: {selic != null ? `${selic.toFixed(2)}%` : "--"}</Badge>
            <Badge variant="outline">
              USD/BRL: {ptax ? `${ptax.compra.toFixed(2)} / ${ptax.venda.toFixed(2)}` : "--"}
            </Badge>
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? "Live" : "Offline"}
            </Badge>
          </div>
        </div>
        <Badge variant="outline" className="animate-pulse">
          ● Ao vivo
        </Badge>
      </div>

      <Tabs defaultValue="indicators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="indicators">Indicadores</TabsTrigger>
          <TabsTrigger value="curves">Curvas</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="centralbanks">Bancos Centrais</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Calendário Econômico - Esta Semana</span>
              </CardTitle>
              <CardDescription>Eventos de alto impacto nos mercados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead>Atual</TableHead>
                    <TableHead>Anterior</TableHead>
                    <TableHead>Previsão</TableHead>
                    <TableHead>Impacto</TableHead>
                    <TableHead>Próxima Release</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {macroIndicators.map((indicator, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{indicator.indicator}</TableCell>
                      <TableCell className="font-semibold">
                        {typeof indicator.current === "number" && indicator.current > 1000
                          ? indicator.current.toLocaleString()
                          : indicator.current + (indicator.indicator.includes("Taxa") ? "%" : "")}
                        {indicator.trend === "up" ? (
                          <TrendingUp className="inline h-4 w-4 ml-1 text-green-600" />
                        ) : (
                          <TrendingDown className="inline h-4 w-4 ml-1 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        {typeof indicator.previous === "number" && indicator.previous > 1000
                          ? indicator.previous.toLocaleString()
                          : indicator.previous + (indicator.indicator.includes("Taxa") ? "%" : "")}
                      </TableCell>
                      <TableCell>
                        {typeof indicator.forecast === "number" && indicator.forecast > 1000
                          ? indicator.forecast.toLocaleString()
                          : indicator.forecast + (indicator.indicator.includes("Taxa") ? "%" : "")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            indicator.impact === "High"
                              ? "destructive"
                              : indicator.impact === "Medium"
                              ? "secondary"
                              : "outline"
                          }>
                          {indicator.impact}
                        </Badge>
                      </TableCell>
                      <TableCell>{indicator.nextRelease}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do PIB vs Fed Rate</CardTitle>
                <CardDescription>Relação entre crescimento e política monetária</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="gdp"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="PIB %"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="fedRate"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="Fed Rate %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inflação vs Desemprego</CardTitle>
                <CardDescription>Curva de Phillips - relação inversa clássica</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="unemployment" name="Desemprego" />
                    <YAxis dataKey="inflation" name="Inflação" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter dataKey="inflation" fill="hsl(var(--chart-3))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Correlações Cross-Asset</CardTitle>
              <CardDescription>
                Relações entre diferentes classes de ativos (60 dias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {correlationData.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{item.asset1}</span>
                      <Badge variant="outline">{item.timeframe}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">vs {item.asset2}</div>
                    <div
                      className={`text-2xl font-semibold ${
                        Math.abs(item.correlation) > 0.7 ? "text-red-600" : "text-green-600"
                      }`}>
                      {item.correlation > 0 ? "+" : ""}
                      {item.correlation.toFixed(2)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          Math.abs(item.correlation) > 0.7 ? "bg-red-600" : "bg-green-600"
                        }`}
                        style={{ width: `${Math.abs(item.correlation) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curves" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Curva de Treasuries (Tempo Real)</CardTitle>
              <CardDescription>Estrutura a termo das taxas de juros americanas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={yieldCurveData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="maturity" />
                  <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} />
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    name="Atual"
                  />
                  <Line
                    type="monotone"
                    dataKey="weekAgo"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="1 Semana"
                  />
                  <Line
                    type="monotone"
                    dataKey="monthAgo"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                    name="1 Mês"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">10Y-2Y Spread</p>
                  <p
                    className={`text-xl font-semibold ${
                      slope102y != null && slope102y < 0 ? "text-red-600" : "text-green-600"
                    }`}>
                    {slope102y != null ? `${slope102y * 100} bps` : "--"}
                  </p>
                  <p
                    className={`text-xs ${
                      slope102y != null && slope102y < 0 ? "text-red-600" : "text-green-600"
                    }`}>
                    {slope102y != null && slope102y < 0 ? "Curva Invertida" : "Curva Normal"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">10Y-3M Spread</p>
                  <p
                    className={`text-xl font-semibold ${
                      slope103m != null && slope103m < 0 ? "text-red-600" : "text-green-600"
                    }`}>
                    {slope103m != null ? `${slope103m * 100} bps` : "--"}
                  </p>
                  <p
                    className={`text-xs ${
                      slope103m != null && slope103m < 0 ? "text-red-600" : "text-green-600"
                    }`}>
                    {slope103m != null && slope103m < 0 ? "Fortemente Invertida" : "Normal"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">VIX</p>
                  <p className="text-xl font-semibold text-yellow-600">
                    {vix != null ? vix.toFixed(2) : "--"}
                  </p>
                  <p className="text-xs text-yellow-600">Volatilidade implícita</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Índices Globais (Tempo Real)</CardTitle>
              <CardDescription>Performance dos principais mercados mundiais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalMarkets.map((market, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">{market.country}</p>
                        <p className="font-medium">{market.index}</p>
                      </div>
                      <Badge variant="outline">{market.currency}</Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xl font-semibold">{market.value.toLocaleString()}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {market.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm ${
                              market.change > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                            {market.change > 0 ? "+" : ""}
                            {market.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Commodities - Preços Spot</span>
              </CardTitle>
              <CardDescription>Matérias-primas e metais preciosos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commodities.map((commodity, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{commodity.name}</p>
                      <Badge variant="outline">/{commodity.unit}</Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xl font-semibold">${commodity.price.toFixed(2)}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {commodity.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm ${
                              commodity.change > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                            {commodity.change > 0 ? "+" : ""}
                            {commodity.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance YTD - Commodities</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commodities}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, "Variação"]} />
                  <Bar dataKey="change">
                    {commodities.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.change > 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centralbanks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Monitoramento de Bancos Centrais</span>
              </CardTitle>
              <CardDescription>
                Próximas reuniões e expectativas de política monetária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banco Central</TableHead>
                    <TableHead>Taxa Atual</TableHead>
                    <TableHead>Próxima Reunião</TableHead>
                    <TableHead>Ação Esperada</TableHead>
                    <TableHead>Probabilidade</TableHead>
                    <TableHead>Viés</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {centralBankWatch.map((bank, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{bank.bank}</TableCell>
                      <TableCell className="font-semibold">{bank.currentRate}</TableCell>
                      <TableCell>{bank.nextMeeting}</TableCell>
                      <TableCell>{bank.expectedAction}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{bank.probability}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${bank.probability}%` }}></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bank.hawkish === "Hawkish"
                              ? "destructive"
                              : bank.hawkish === "Dovish"
                              ? "default"
                              : "secondary"
                          }>
                          {bank.hawkish}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline - Próximas 30 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 rounded">
                  <div className="flex-shrink-0">
                    <Badge>25 Jan</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">ECB Rate Decision</p>
                    <p className="text-sm text-muted-foreground">Expectativa: Manter 4.50%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Alto Impacto</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 rounded">
                  <div className="flex-shrink-0">
                    <Badge>31 Jan</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Fed Rate Decision + FOMC</p>
                    <p className="text-sm text-muted-foreground">Expectativa: Manter 5.25-5.50%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Alto Impacto</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                  <div className="flex-shrink-0">
                    <Badge>31 Jan</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Copom - Banco Central Brasil</p>
                    <p className="text-sm text-muted-foreground">
                      Expectativa: Corte 0.50% → 10.75%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Médio Impacto</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
