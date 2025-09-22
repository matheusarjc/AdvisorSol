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
} from "recharts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calculator, TrendingUp, AlertTriangle, Target, FileText, Download } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ANBIMACurves } from "../charts/ANBIMACurves";

const yieldCurveData = [
  { maturity: "1M", rate: 11.25, yesterday: 11.3 },
  { maturity: "3M", rate: 11.35, yesterday: 11.4 },
  { maturity: "6M", rate: 11.45, yesterday: 11.5 },
  { maturity: "1A", rate: 11.65, yesterday: 11.7 },
  { maturity: "2A", rate: 11.85, yesterday: 11.9 },
  { maturity: "5A", rate: 12.15, yesterday: 12.2 },
  { maturity: "10A", rate: 12.45, yesterday: 12.5 },
];

const historicalRates = [
  { date: "Jan", selic: 13.75, ipca: 5.79, cdi: 13.65 },
  { date: "Fev", selic: 13.25, ipca: 5.6, cdi: 13.15 },
  { date: "Mar", selic: 12.75, ipca: 4.65, cdi: 12.65 },
  { date: "Abr", selic: 12.25, ipca: 4.18, cdi: 12.15 },
  { date: "Mai", selic: 11.75, ipca: 4.5, cdi: 11.65 },
  { date: "Jun", selic: 11.25, ipca: 4.23, cdi: 11.15 },
];

const debenturesData = [
  {
    issuer: "Banco do Brasil",
    code: "BBAS11",
    maturity: "15/03/2028",
    rate: "CDI + 1.25%",
    rating: "AAA",
    price: 98.75,
    yield: 12.15,
    duration: 3.2,
    spread: 125,
    volume: "R$ 50M",
    riskLevel: "Baixo",
    alert: null,
  },
  {
    issuer: "Petrobras",
    code: "PETR21",
    maturity: "01/08/2030",
    rate: "CDI + 2.15%",
    rating: "AA",
    price: 95.2,
    yield: 13.45,
    duration: 4.8,
    spread: 215,
    volume: "R$ 80M",
    riskLevel: "Baixo",
    alert: "spread_alto",
  },
  {
    issuer: "Suzano",
    code: "SUZB31",
    maturity: "12/12/2027",
    rate: "CDI + 1.85%",
    rating: "AA-",
    price: 97.3,
    yield: 12.95,
    duration: 3.8,
    spread: 185,
    volume: "R$ 25M",
    riskLevel: "Médio",
    alert: null,
  },
];

const scenarioData = [
  { scenario: "Base", selic: 11.25, ipca: 4.2, yield: 12.1 },
  { scenario: "Alta", selic: 13.0, ipca: 5.5, yield: 13.8 },
  { scenario: "Baixa", selic: 9.5, ipca: 3.0, yield: 10.2 },
];

export function RendaFixaBrasil() {
  const [selectedScenario, setSelectedScenario] = useState("Base");
  const [activeTab, setActiveTab] = useState("overview");
  const [simulatorValues, setSimulatorValues] = useState({
    amount: "100000",
    months: "12",
    assetType: "cdb",
  });

  const calculateReturnProjection = () => {
    const amount = parseFloat(simulatorValues.amount);
    const months = parseInt(simulatorValues.months);
    let rate = 0.1125; // CDI base

    if (simulatorValues.assetType === "ipca") rate = 0.0423 + 0.0625; // IPCA + 6.25%
    if (simulatorValues.assetType === "prefixado") rate = 0.118;

    const finalAmount = amount * Math.pow(1 + rate, months / 12);
    return finalAmount - amount;
  };

  const exportScenarioReport = () => {
    console.log("Exportando relatório de cenários para Excel/PDF...");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1>Renda Fixa Brasil</h1>
          <p className="text-muted-foreground">
            Análise de títulos de renda fixa e simulações de cenários
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportScenarioReport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Cenários
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="anbima">Curvas ANBIMA</TabsTrigger>
          <TabsTrigger value="treasury">Tesouro IPCA+</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Selic Atual</p>
                  <p className="text-xl font-semibold">11.25%</p>
                  <p className="text-xs text-red-600">-0.50pp</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">IPCA 12M</p>
                  <p className="text-xl font-semibold">4.23%</p>
                  <p className="text-xs text-green-600">-0.27pp</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Taxa Real</p>
                  <p className="text-xl font-semibold">6.75%</p>
                  <p className="text-xs text-muted-foreground">a.a.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Inclinação</p>
                  <p className="text-xl font-semibold">120 bps</p>
                  <p className="text-xs text-muted-foreground">10Y-2Y</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Curva de Juros DI</CardTitle>
                <CardDescription>Taxa de juros por vencimento com variação diária</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={yieldCurveData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="maturity" />
                    <YAxis domain={["dataMin - 0.2", "dataMax + 0.2"]} />
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name === "rate" ? "Hoje" : "Ontem"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={3}
                      name="rate"
                    />
                    <Line
                      type="monotone"
                      dataKey="yesterday"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="yesterday"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Simulação de Cenários</span>
                </CardTitle>
                <CardDescription>Impacto de diferentes cenários macro nos yields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarioData.map((scenario) => (
                        <SelectItem key={scenario.scenario} value={scenario.scenario}>
                          Cenário {scenario.scenario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-3 gap-4">
                    {scenarioData
                      .filter((s) => s.scenario === selectedScenario)
                      .map((scenario) => (
                        <React.Fragment key={scenario.scenario}>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Selic</p>
                            <p className="font-semibold">{scenario.selic}%</p>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">IPCA</p>
                            <p className="font-semibold">{scenario.ipca}%</p>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Yield Proj.</p>
                            <p className="font-semibold">{scenario.yield}%</p>
                          </div>
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Simulador de Rentabilidade</span>
              </CardTitle>
              <CardDescription>
                Compare diferentes tipos de investimento em renda fixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Valor Inicial</Label>
                  <Input
                    value={simulatorValues.amount}
                    onChange={(e) =>
                      setSimulatorValues({ ...simulatorValues, amount: e.target.value })
                    }
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo (meses)</Label>
                  <Input
                    value={simulatorValues.months}
                    onChange={(e) =>
                      setSimulatorValues({ ...simulatorValues, months: e.target.value })
                    }
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Ativo</Label>
                  <Select
                    value={simulatorValues.assetType}
                    onValueChange={(value) =>
                      setSimulatorValues({ ...simulatorValues, assetType: value })
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdb">CDB (CDI)</SelectItem>
                      <SelectItem value="ipca">Tesouro IPCA+</SelectItem>
                      <SelectItem value="prefixado">Prefixado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retorno Projetado</Label>
                  <div className="p-2 bg-muted rounded text-center">
                    <span className="font-semibold text-green-600">
                      +R${" "}
                      {calculateReturnProjection().toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução das Taxas</CardTitle>
              <CardDescription>Selic, CDI e IPCA - últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={historicalRates}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="selic"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                    name="Selic"
                  />
                  <Area
                    type="monotone"
                    dataKey="ipca"
                    stackId="2"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.6}
                    name="IPCA"
                  />
                  <Line
                    type="monotone"
                    dataKey="cdi"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="CDI"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debêntures - Análise de Crédito</CardTitle>
              <CardDescription>
                Títulos corporativos com métricas de risco e alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emissor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Spread</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Yield</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debenturesData.map((debenture, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{debenture.issuer}</p>
                          <p className="text-xs text-muted-foreground">{debenture.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>{debenture.maturity}</TableCell>
                      <TableCell>
                        <Badge
                          variant={debenture.rating.startsWith("AA") ? "default" : "secondary"}>
                          {debenture.rating}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">+{debenture.spread} bps</TableCell>
                      <TableCell>{debenture.duration}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {debenture.yield.toFixed(2)}%
                      </TableCell>
                      <TableCell>{debenture.volume}</TableCell>
                      <TableCell>
                        {debenture.alert === "spread_alto" ? (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs text-yellow-600">Spread Alto</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anbima" className="space-y-6">
          <ANBIMACurves />
        </TabsContent>

        <TabsContent value="treasury" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Tesouro IPCA+ - Comparação com Debêntures</span>
              </CardTitle>
              <CardDescription>
                Análise comparativa entre títulos públicos e privados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Títulos Públicos</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Taxa</TableHead>
                        <TableHead>Yield Real</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Tesouro IPCA+ 2026</TableCell>
                        <TableCell className="font-semibold text-green-600">6.15%</TableCell>
                        <TableCell>6.18%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tesouro IPCA+ 2029</TableCell>
                        <TableCell className="font-semibold text-green-600">6.28%</TableCell>
                        <TableCell>6.31%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tesouro IPCA+ 2035</TableCell>
                        <TableCell className="font-semibold text-green-600">6.45%</TableCell>
                        <TableCell>6.48%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Vantagem vs Debêntures</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Spread médio AAA</span>
                        <Badge variant="default">+88 bps</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prêmio de crédito para rating AAA
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Liquidez</span>
                        <Badge variant="default">Superior</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tesouro Direto vs mercado secundário
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Risco de Crédito</span>
                        <Badge variant="default">Zero</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Garantia do Tesouro Nacional
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { maturity: "2026", tesouro: 6.15, debenture_AAA: 7.03, debenture_A: 7.6 },
                      { maturity: "2029", tesouro: 6.28, debenture_AAA: 7.16, debenture_A: 7.73 },
                      { maturity: "2035", tesouro: 6.45, debenture_AAA: 7.33, debenture_A: 7.9 },
                    ]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="maturity" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    <Line
                      type="monotone"
                      dataKey="tesouro"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={3}
                      name="Tesouro IPCA+"
                    />
                    <Line
                      type="monotone"
                      dataKey="debenture_AAA"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="Debênture AAA"
                    />
                    <Line
                      type="monotone"
                      dataKey="debenture_A"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="Debênture A"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
