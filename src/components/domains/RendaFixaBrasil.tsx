"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import { fetchDebentures, fetchCreditCurves, fetchDiCurve } from "@/services/anbima";
import { fetchLatestSGSValue, fetchSGSSeries } from "@/services/sgs";
import { fetchSidraIpcaSubitems } from "@/services/sidra";
import { fetchTesouroTitulos } from "@/services/tesouro";
import { useRealtime } from "@/components/providers/realtime-provider";

// será preenchido por dados dinâmicos (ANBIMA)
const initialYieldCurveData: Array<{ maturity: string; rate: number; yesterday?: number }> = [];

// será preenchido por dados dinâmicos (SGS)
const initialHistoricalRates: Array<{ date: string; selic: number; ipca: number; cdi: number }> =
  [];

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

// Cenários dinâmicos baseados nos últimos valores de Selic/IPCA
function buildScenarios(currentSelic?: number | null, currentIpca?: number | null) {
  const s = currentSelic ?? 11.25;
  const i = currentIpca ?? 4.2;
  return [
    { scenario: "Base", selic: s, ipca: i, yield: Math.max(s - 0.5, 0) + 0.85 },
    { scenario: "Alta", selic: s + 1.75, ipca: i + 1.2, yield: Math.max(s + 1.75 - 0.5, 0) + 1.1 },
    {
      scenario: "Baixa",
      selic: Math.max(s - 1.75, 0),
      ipca: Math.max(i - 1.2, 0),
      yield: Math.max(s - 1.75 - 0.5, 0) + 0.6,
    },
  ];
}

export function RendaFixaBrasil() {
  const { lastUpdate: realtimeData, connected: realtimeLoading } = useRealtime();
  const [yieldCurveData, setYieldCurveData] = useState(initialYieldCurveData);
  const [historicalRates, setHistoricalRates] = useState(initialHistoricalRates);
  const [selectedScenario, setSelectedScenario] = useState("Base");
  const [activeTab, setActiveTab] = useState("overview");
  const [simulatorValues, setSimulatorValues] = useState({
    amount: "100000",
    months: "12",
    assetType: "cdb",
  });
  const [tdSimulator, setTdSimulator] = useState({
    amount: "10000",
    selectedTitulo: "",
    investmentType: "compra",
  });
  const [liveDebentures, setLiveDebentures] = useState<any[]>([]);
  const [selic, setSelic] = useState<number | null>(null);
  const [ipca, setIpca] = useState<number | null>(null);
  const [ipcaSubitems, setIpcaSubitems] = useState<any[] | null>(null);
  const [tdTitulos, setTdTitulos] = useState<any[] | null>(null);
  const realRate = useMemo(
    () => (selic != null && ipca != null ? selic - ipca : null),
    [selic, ipca]
  );
  const scenarios = useMemo(() => buildScenarios(selic, ipca), [selic, ipca]);

  // Inclinação 10Y-2Y baseada em títulos IPCA do Tesouro
  const slope10y2y = useMemo(() => {
    if (!tdTitulos?.length) return null;
    const ipcaBonds = tdTitulos.filter((t) => t.indexador === "IPCA");
    if (!ipcaBonds.length) return null;
    const yearsToMaturity = (venc: string) => {
      const d = new Date(venc);
      const now = new Date();
      return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    };
    const withYears = ipcaBonds.map((t) => ({ ...t, years: yearsToMaturity(t.vencimento) }));
    // Encontrar próximos de ~2 anos e ~10 anos
    let two = null as any;
    let ten = null as any;
    for (const t of withYears) {
      if (!two || Math.abs(t.years - 2) < Math.abs(two.years - 2)) two = t;
      if (!ten || Math.abs(t.years - 10) < Math.abs(ten.years - 10)) ten = t;
    }
    if (!two || !ten) return null;
    const diffBps = Math.round((ten.taxaCompra - two.taxaCompra) * 100);
    return diffBps;
  }, [tdTitulos]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch live debentures from ANBIMA
        const debentures = await fetchDebentures();
        setLiveDebentures(debentures);

        // Fetch latest Selic and IPCA from SGS
        const latestSelic = await fetchLatestSGSValue(11); // Selic meta
        const latestIpca = await fetchLatestSGSValue(433); // IPCA mensal

        if (latestSelic) setSelic(latestSelic);
        if (latestIpca) setIpca(latestIpca);

        // Fetch SIDRA IPCA subitems
        const sidra = await fetchSidraIpcaSubitems();
        setIpcaSubitems(sidra.subitens.slice(0, 4));

        const titulos = await fetchTesouroTitulos();
        setTdTitulos(titulos.slice(0, 5));

        // Curva DI (ANBIMA)
        try {
          const di = await fetchDiCurve();
          // Esperado: [{ maturity: '1M'|'3M'|'6M'|'1A'|'2A'|'5A'|'10A', rate: number, yesterday?: number }]
          if (Array.isArray(di) && di.length) {
            setYieldCurveData(
              di.map((p: any) => ({
                maturity: String(p.maturity ?? p.tenor ?? p.vencimento ?? ""),
                rate: Number(p.rate ?? p.taxa ?? p.valor ?? 0),
                yesterday: p.yesterday != null ? Number(p.yesterday) : undefined,
              }))
            );
          }
        } catch {}

        // Histórico (últimos 6 meses) de Selic/IPCA/CDI via SGS
        try {
          const now = new Date();
          const past = new Date(now);
          past.setMonth(now.getMonth() - 6);
          const fmt = (d: Date) =>
            `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}/${d.getFullYear()}`;
          const sSelic = await fetchSGSSeries(11, fmt(past), fmt(now));
          const sIpca = await fetchSGSSeries(433, fmt(past), fmt(now));
          const sCdi = await fetchSGSSeries(4389, fmt(past), fmt(now));

          // Agrupar por mês para compor pontos mensais
          const byMonth = new Map<string, { selic?: number; ipca?: number; cdi?: number }>();
          const parse = (valor: string) => parseFloat(valor.replace(",", "."));
          const push = (arr: any[], key: keyof any) => {
            arr.forEach((it) => {
              const [dd, mm, yyyy] = it.data.split("/");
              const label = `${yyyy}-${mm}`;
              const prev = byMonth.get(label) || {};
              (prev as any)[key] = parse(it.valor);
              byMonth.set(label, prev);
            });
          };
          push(sSelic, "selic");
          push(sIpca, "ipca");
          push(sCdi, "cdi");

          const rows = Array.from(byMonth.entries())
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .slice(-6)
            .map(([ym, v]) => ({
              date: `${ym.slice(5, 7)}/${ym.slice(0, 4)}`,
              selic: v.selic ?? 0,
              ipca: v.ipca ?? 0,
              cdi: v.cdi ?? 0,
            }));
          if (rows.length) setHistoricalRates(rows);
        } catch {}
      } catch (error) {
        console.error("Error loading RF Brasil data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Update from realtime data
    if (realtimeData?.macro?.dgs10) {
      // Update with macro data if available
    }
    if (realtimeData?.fx?.usdbrl) {
      // Update with FX data if available
    }
    if (realtimeData?.news) {
      // Update with news data if available
    }
  }, [realtimeData]);

  const calculateReturnProjection = () => {
    const amount = parseFloat(simulatorValues.amount);
    const months = parseInt(simulatorValues.months);
    let rate = 0.1125; // CDI base

    if (simulatorValues.assetType === "ipca") rate = 0.0423 + 0.0625; // IPCA + 6.25%
    if (simulatorValues.assetType === "prefixado") rate = 0.118;

    const finalAmount = amount * Math.pow(1 + rate, months / 12);
    return finalAmount - amount;
  };

  const calculateTesouroInvestment = () => {
    if (!tdTitulos || !tdSimulator.selectedTitulo) return null;

    const titulo = tdTitulos.find((t) => t.nome === tdSimulator.selectedTitulo);
    if (!titulo) return null;

    const amount = parseFloat(tdSimulator.amount);
    const taxa = tdSimulator.investmentType === "compra" ? titulo.taxaCompra : titulo.taxaVenda;
    const pu = titulo.pu;

    // Calculate quantity of bonds
    const quantity = Math.floor(amount / pu);
    const totalInvested = quantity * pu;

    // Calculate projected return based on bond type
    let projectedReturn = 0;
    if (titulo.indexador === "IPCA") {
      const ipcaRate = ipca ? ipca / 100 : 0.0423;
      projectedReturn = totalInvested * Math.pow(1 + ipcaRate + taxa / 100, 1) - totalInvested;
    } else if (titulo.indexador === "SELIC") {
      const selicRate = selic ? selic / 100 : 0.1125;
      projectedReturn = totalInvested * Math.pow(1 + selicRate, 1) - totalInvested;
    } else {
      // Prefixado
      projectedReturn = totalInvested * Math.pow(1 + taxa / 100, 1) - totalInvested;
    }

    return {
      quantity,
      totalInvested,
      projectedReturn,
      pu,
      taxa,
      indexador: titulo.indexador,
    };
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
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={!realtimeLoading ? "animate-pulse" : ""}>
            ● {!realtimeLoading ? "Conectando..." : "Ao vivo"}
          </Badge>
          <Button variant="outline" size="sm" onClick={exportScenarioReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Cenários
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="anbima">Curvas ANBIMA</TabsTrigger>
          <TabsTrigger value="treasury">Tesouro IPCA+</TabsTrigger>
          <TabsTrigger value="simulator">Simulador TD</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Selic Atual</p>
                  <p className="text-xl font-semibold">
                    {selic != null ? `${selic.toFixed(2)}%` : "11.25%"}
                  </p>
                  <p className="text-xs text-red-600">-0.50pp</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">IPCA 12M</p>
                  <p className="text-xl font-semibold">
                    {ipca != null ? `${ipca.toFixed(2)}%` : "4.23%"}
                  </p>
                  <p className="text-xs text-green-600">-0.27pp</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Taxa Real</p>
                  <p className="text-xl font-semibold">
                    {realRate != null ? `${realRate.toFixed(2)}%` : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">a.a.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Inclinação</p>
                  <p className="text-xl font-semibold">
                    {slope10y2y != null ? `${slope10y2y} bps` : "--"}
                  </p>
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
                      {scenarios.map((scenario) => (
                        <SelectItem key={scenario.scenario} value={scenario.scenario}>
                          Cenário {scenario.scenario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-3 gap-4">
                    {scenarios
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
                  {(liveDebentures.length > 0 ? liveDebentures : debenturesData).map(
                    (debenture, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{debenture.issuer}</p>
                            <p className="text-xs text-muted-foreground">
                              {debenture.code || debenture.indexer}
                            </p>
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
                        <TableCell>{debenture.duration || "N/A"}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {(typeof debenture.yield === "number"
                            ? debenture.yield
                            : parseFloat(debenture.yield) || 0
                          ).toFixed(2)}
                          %
                        </TableCell>
                        <TableCell>{debenture.volume || `R$ ${debenture.pu || 1000}M`}</TableCell>
                        <TableCell>
                          {debenture.alert === "spread_alto" || debenture.spread > 200 ? (
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
                    )
                  )}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>IPCA - Principais Subitens</span>
              </CardTitle>
              <CardDescription>Peso no índice e variações</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subitem</TableHead>
                    <TableHead>Peso (%)</TableHead>
                    <TableHead>Mensal (%)</TableHead>
                    <TableHead>12M (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ipcaSubitems || []).map((s) => (
                    <TableRow key={s.codigo}>
                      <TableCell className="font-medium">{s.descricao}</TableCell>
                      <TableCell>{s.peso.toFixed(1)}</TableCell>
                      <TableCell className={s.mensal >= 0 ? "text-red-600" : "text-green-600"}>
                        {s.mensal.toFixed(2)}
                      </TableCell>
                      <TableCell>{s.anual.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tesouro Direto - Indicativos</CardTitle>
              <CardDescription>Taxas e preços (compra/venda)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Tx Compra</TableHead>
                    <TableHead>Tx Venda</TableHead>
                    <TableHead>PU</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(tdTitulos || []).map((t) => (
                    <TableRow key={`${t.nome}-${t.vencimento}`}>
                      <TableCell className="font-medium">{t.nome}</TableCell>
                      <TableCell>{t.vencimento}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {t.taxaCompra.toFixed(2)}%
                      </TableCell>
                      <TableCell>{t.taxaVenda.toFixed(2)}%</TableCell>
                      <TableCell>
                        {t.pu.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Simulador Tesouro Direto</span>
              </CardTitle>
              <CardDescription>
                Simule investimentos em títulos do Tesouro Nacional com dados em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Valor do Investimento (R$)</Label>
                    <Input
                      value={tdSimulator.amount}
                      onChange={(e) => setTdSimulator({ ...tdSimulator, amount: e.target.value })}
                      placeholder="10000"
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Select
                      value={tdSimulator.selectedTitulo}
                      onValueChange={(value) =>
                        setTdSimulator({ ...tdSimulator, selectedTitulo: value })
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um título" />
                      </SelectTrigger>
                      <SelectContent>
                        {tdTitulos?.map((titulo) => (
                          <SelectItem key={titulo.nome} value={titulo.nome}>
                            {titulo.nome} - {titulo.vencimento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Operação</Label>
                    <Select
                      value={tdSimulator.investmentType}
                      onValueChange={(value) =>
                        setTdSimulator({ ...tdSimulator, investmentType: value })
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compra">Compra (Taxa Compra)</SelectItem>
                        <SelectItem value="venda">Venda (Taxa Venda)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {tdSimulator.selectedTitulo &&
                    (() => {
                      const titulo = tdTitulos?.find((t) => t.nome === tdSimulator.selectedTitulo);
                      if (!titulo) return null;

                      return (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Detalhes do Título</h4>
                          <div className="p-3 bg-muted rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Vencimento:</span>
                              <span className="font-medium">{titulo.vencimento}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Indexador:</span>
                              <Badge variant="secondary">{titulo.indexador}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Taxa Compra:</span>
                              <span className="font-semibold text-green-600">
                                {titulo.taxaCompra.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Taxa Venda:</span>
                              <span className="font-semibold text-red-600">
                                {titulo.taxaVenda.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">PU Atual:</span>
                              <span className="font-medium">R$ {titulo.pu.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>

                <div className="space-y-4">
                  {calculateTesouroInvestment() &&
                    (() => {
                      const calc = calculateTesouroInvestment();
                      if (!calc) return null;

                      return (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Resultado da Simulação</h4>
                          <div className="p-3 bg-muted rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Quantidade de Títulos:</span>
                              <span className="font-medium">{calc.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Valor Total Investido:</span>
                              <span className="font-medium">
                                R${" "}
                                {calc.totalInvested.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Taxa Aplicada:</span>
                              <span className="font-semibold">{calc.taxa.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Retorno Projetado (1 ano):</span>
                              <span className="font-semibold text-green-600">
                                R${" "}
                                {calc.projectedReturn.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Rentabilidade Anual:</span>
                              <span className="font-semibold text-green-600">
                                {((calc.projectedReturn / calc.totalInvested) * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparação de Títulos Disponíveis</CardTitle>
              <CardDescription>
                Todos os títulos do Tesouro Direto com dados atualizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Indexador</TableHead>
                    <TableHead>Taxa Compra</TableHead>
                    <TableHead>Taxa Venda</TableHead>
                    <TableHead>PU</TableHead>
                    <TableHead>Rentabilidade Anual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tdTitulos?.map((titulo, index) => {
                    let rentabilidadeAnual = 0;
                    if (titulo.indexador === "IPCA") {
                      const ipcaRate = ipca ? ipca / 100 : 0.0423;
                      rentabilidadeAnual = (ipcaRate + titulo.taxaCompra / 100) * 100;
                    } else if (titulo.indexador === "SELIC") {
                      const selicRate = selic ? selic / 100 : 0.1125;
                      rentabilidadeAnual = selicRate * 100;
                    } else {
                      rentabilidadeAnual = titulo.taxaCompra;
                    }

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{titulo.nome}</TableCell>
                        <TableCell>{titulo.vencimento}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{titulo.indexador}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {titulo.taxaCompra.toFixed(2)}%
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {titulo.taxaVenda.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          R$ {titulo.pu.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {rentabilidadeAnual.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
