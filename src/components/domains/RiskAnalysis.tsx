"use client";
import React, { useState } from "react";
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
} from "recharts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { AlertTriangle, TrendingDown, Shield, Zap, Target } from "lucide-react";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const portfolioData = [
  {
    asset: "Ações Brasil",
    allocation: 35,
    var95: -2.8,
    var99: -4.2,
    beta: 1.15,
    correlation: 0.85,
  },
  { asset: "Ações EUA", allocation: 25, var95: -2.1, var99: -3.5, beta: 0.95, correlation: 0.78 },
  { asset: "RF Brasil", allocation: 20, var95: -0.8, var99: -1.2, beta: 0.25, correlation: -0.15 },
  { asset: "RF EUA", allocation: 15, var95: -1.1, var99: -1.8, beta: 0.35, correlation: -0.25 },
  { asset: "Commodities", allocation: 5, var95: -3.5, var99: -5.2, beta: 1.25, correlation: 0.45 },
];

const stressScenarios = [
  {
    name: "Crise 2008",
    description: "Queda global dos mercados",
    ibovespa: -41.2,
    sp500: -36.8,
    usdBrl: +32.1,
    selic: +4.5,
    portfolioImpact: -28.5,
    probability: 5,
  },
  {
    name: "COVID-19",
    description: "Pandemia e lockdowns",
    ibovespa: -29.9,
    sp500: -19.6,
    usdBrl: +29.5,
    selic: -6.5,
    portfolioImpact: -22.1,
    probability: 8,
  },
  {
    name: "Crise Hiperinflação",
    description: "Cenário inflacionário extremo",
    ibovespa: -15.2,
    sp500: -8.5,
    usdBrl: +45.0,
    selic: +8.0,
    portfolioImpact: -18.9,
    probability: 12,
  },
  {
    name: "Recessão Global",
    description: "Desaceleração econômica mundial",
    ibovespa: -25.0,
    sp500: -22.0,
    usdBrl: +20.0,
    selic: -2.0,
    portfolioImpact: -19.5,
    probability: 15,
  },
];

const varHistory = [
  { date: "Jan", var95: -2.1, var99: -3.2, realized: -1.8 },
  { date: "Fev", var95: -2.3, var99: -3.5, realized: -2.1 },
  { date: "Mar", var95: -2.8, var99: -4.1, realized: -3.2 },
  { date: "Abr", var95: -2.5, var99: -3.8, realized: -2.0 },
  { date: "Mai", var95: -2.2, var99: -3.4, realized: -1.9 },
  { date: "Jun", var95: -2.1, var99: -3.1, realized: -1.5 },
];

const correlationMatrix = [
  { asset: "IBOV", ibov: 1.0, sp500: 0.75, bonds: -0.15, usd: -0.65, gold: 0.25 },
  { asset: "S&P500", ibov: 0.75, sp500: 1.0, bonds: -0.25, usd: -0.45, gold: 0.15 },
  { asset: "Bonds BR", ibov: -0.15, sp500: -0.25, bonds: 1.0, usd: 0.35, gold: -0.05 },
  { asset: "USD/BRL", ibov: -0.65, sp500: -0.45, bonds: 0.35, usd: 1.0, gold: 0.65 },
  { asset: "Gold", ibov: 0.25, sp500: 0.15, bonds: -0.05, usd: 0.65, gold: 1.0 },
];

export function RiskAnalysis() {
  const [confidenceLevel, setConfidenceLevel] = useState([95]);
  const [selectedScenario, setSelectedScenario] = useState("Crise 2008");
  const [timeHorizon, setTimeHorizon] = useState(1);

  const calculatePortfolioVaR = () => {
    const level = confidenceLevel[0];
    const baseVar = level === 95 ? -2.1 : -3.2;
    const timeAdjustment = Math.sqrt(timeHorizon);
    return (baseVar * timeAdjustment).toFixed(2);
  };

  const calculateCVaR = () => {
    const var95 = parseFloat(calculatePortfolioVaR());
    return (var95 * 1.4).toFixed(2);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1>Análise de Risco Avançada</h1>
        <p className="text-muted-foreground">VaR, CVaR, Stress Tests e Correlações</p>
      </div>

      <Tabs defaultValue="var" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="var">VaR & CVaR</TabsTrigger>
          <TabsTrigger value="stress">Stress Tests</TabsTrigger>
          <TabsTrigger value="correlations">Correlações</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
        </TabsList>

        <TabsContent value="var" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Configurações VaR</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Nível de Confiança: {confidenceLevel[0]}%
                  </label>
                  <Slider
                    value={confidenceLevel}
                    onValueChange={setConfidenceLevel}
                    max={99}
                    min={90}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Horizonte: {timeHorizon} dia(s)</label>
                  <Slider
                    value={[timeHorizon]}
                    onValueChange={(value: number[]) => setTimeHorizon(value[0])}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">VaR {confidenceLevel[0]}%</p>
                    <p className="text-2xl font-semibold text-red-600">
                      {calculatePortfolioVaR()}%
                    </p>
                    <p className="text-xs text-muted-foreground">CVaR: {calculateCVaR()}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VaR por Classe de Ativo</CardTitle>
              <CardDescription>Contribuição de risco de cada posição</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Alocação</TableHead>
                    <TableHead>VaR 95%</TableHead>
                    <TableHead>VaR 99%</TableHead>
                    <TableHead>Beta</TableHead>
                    <TableHead>Contribuição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.asset}</TableCell>
                      <TableCell>{item.allocation}%</TableCell>
                      <TableCell className="text-red-600 font-semibold">{item.var95}%</TableCell>
                      <TableCell className="text-red-700 font-semibold">{item.var99}%</TableCell>
                      <TableCell>{item.beta}</TableCell>
                      <TableCell>
                        <Progress
                          value={(Math.abs(item.var95) * item.allocation) / 10}
                          className="w-20"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backtesting VaR</CardTitle>
              <CardDescription>Comparação entre VaR estimado e perdas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={varHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  <Line
                    type="monotone"
                    dataKey="var95"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="VaR 95%"
                  />
                  <Line
                    type="monotone"
                    dataKey="var99"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="VaR 99%"
                  />
                  <Line
                    type="monotone"
                    dataKey="realized"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Realizado"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Stress Tests Históricos</span>
              </CardTitle>
              <CardDescription>Impacto de cenários de crise no portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {stressScenarios.map((scenario, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedScenario === scenario.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedScenario(scenario.name)}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <Badge variant={scenario.probability > 10 ? "destructive" : "secondary"}>
                          {scenario.probability}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                      <div className="flex justify-between">
                        <span className="text-sm">Impacto Portfolio:</span>
                        <span className="font-semibold text-red-600">
                          {scenario.portfolioImpact}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {stressScenarios
                    .filter((s) => s.name === selectedScenario)
                    .map((scenario) => (
                      <div key={scenario.name} className="space-y-4">
                        <h4 className="font-semibold">Detalhes: {scenario.name}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Ibovespa</p>
                            <p className="font-semibold text-red-600">{scenario.ibovespa}%</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">S&P 500</p>
                            <p className="font-semibold text-red-600">{scenario.sp500}%</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">USD/BRL</p>
                            <p className="font-semibold text-green-600">+{scenario.usdBrl}%</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Selic</p>
                            <p
                              className={`font-semibold ${
                                scenario.selic > 0 ? "text-green-600" : "text-red-600"
                              }`}>
                              {scenario.selic > 0 ? "+" : ""}
                              {scenario.selic}pp
                            </p>
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-semibold text-red-600">
                              Impacto Total no Portfolio
                            </span>
                          </div>
                          <p className="text-2xl font-semibold text-red-600">
                            {scenario.portfolioImpact}%
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            Estimativa em R${" "}
                            {(Math.abs(scenario.portfolioImpact) * 10000).toLocaleString("pt-BR")}
                            (base R$ 1M)
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Correlação</CardTitle>
              <CardDescription>Correlações dinâmicas entre ativos (60 dias)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2"></th>
                      {correlationMatrix.map((item) => (
                        <th key={item.asset} className="text-center p-2 text-sm font-medium">
                          {item.asset}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationMatrix.map((row) => (
                      <tr key={row.asset}>
                        <td className="p-2 font-medium">{row.asset}</td>
                        <td
                          className={`p-2 text-center ${
                            Math.abs(row.ibov) > 0.7
                              ? "bg-red-100 dark:bg-red-950/20"
                              : "bg-green-100 dark:bg-green-950/20"
                          }`}>
                          {row.ibov.toFixed(2)}
                        </td>
                        <td
                          className={`p-2 text-center ${
                            Math.abs(row.sp500) > 0.7
                              ? "bg-red-100 dark:bg-red-950/20"
                              : "bg-green-100 dark:bg-green-950/20"
                          }`}>
                          {row.sp500.toFixed(2)}
                        </td>
                        <td
                          className={`p-2 text-center ${
                            Math.abs(row.bonds) > 0.7
                              ? "bg-red-100 dark:bg-red-950/20"
                              : "bg-green-100 dark:bg-green-950/20"
                          }`}>
                          {row.bonds.toFixed(2)}
                        </td>
                        <td
                          className={`p-2 text-center ${
                            Math.abs(row.usd) > 0.7
                              ? "bg-red-100 dark:bg-red-950/20"
                              : "bg-green-100 dark:bg-green-950/20"
                          }`}>
                          {row.usd.toFixed(2)}
                        </td>
                        <td
                          className={`p-2 text-center ${
                            Math.abs(row.gold) > 0.7
                              ? "bg-red-100 dark:bg-red-950/20"
                              : "bg-green-100 dark:bg-green-950/20"
                          }`}>
                          {row.gold.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="inline-block w-4 h-4 bg-red-100 dark:bg-red-950/20 rounded mr-2"></span>
                Alta correlação ({">"} 0.7)
                <span className="inline-block w-4 h-4 bg-green-100 dark:bg-green-950/20 rounded ml-4 mr-2"></span>
                Baixa correlação ({"<"} 0.7)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Análise de Cenários Personalizados</span>
              </CardTitle>
              <CardDescription>Monte Carlo e simulações prospectivas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Distribuição de Retornos (1000 simulações)</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={[
                        { range: "<-10%", freq: 50 },
                        { range: "-10% a -5%", freq: 120 },
                        { range: "-5% a 0%", freq: 280 },
                        { range: "0% a 5%", freq: 320 },
                        { range: "5% a 10%", freq: 180 },
                        { range: ">10%", freq: 50 },
                      ]}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="freq" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Métricas de Risco</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Prob. Perda {">"} 5%</span>
                      <span className="font-semibold text-red-600">17%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Prob. Perda {">"} 10%</span>
                      <span className="font-semibold text-red-700">5%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Retorno Esperado</span>
                      <span className="font-semibold text-green-600">+8.5%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Volatilidade</span>
                      <span className="font-semibold">12.8%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Sharpe Ratio</span>
                      <span className="font-semibold text-green-600">1.42</span>
                    </div>
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
