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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Shield, TrendingUp, Download, AlertCircle } from "lucide-react";

const curveDataByRating = {
  AAA: [
    { vertex: "1Y", rate: 10.85, spread: 35, duration: 0.92 },
    { vertex: "2Y", rate: 11.12, spread: 47, duration: 1.81 },
    { vertex: "3Y", rate: 11.28, spread: 53, duration: 2.65 },
    { vertex: "5Y", rate: 11.45, spread: 65, duration: 4.18 },
    { vertex: "10Y", rate: 11.78, spread: 88, duration: 7.42 },
    { vertex: "15Y", rate: 12.05, spread: 115, duration: 9.85 },
  ],
  AA: [
    { vertex: "1Y", rate: 11.15, spread: 65, duration: 0.92 },
    { vertex: "2Y", rate: 11.45, spread: 80, duration: 1.81 },
    { vertex: "3Y", rate: 11.65, spread: 90, duration: 2.65 },
    { vertex: "5Y", rate: 11.95, spread: 115, duration: 4.18 },
    { vertex: "10Y", rate: 12.35, spread: 145, duration: 7.42 },
    { vertex: "15Y", rate: 12.68, spread: 178, duration: 9.85 },
  ],
  A: [
    { vertex: "1Y", rate: 11.45, spread: 95, duration: 0.92 },
    { vertex: "2Y", rate: 11.78, spread: 113, duration: 1.81 },
    { vertex: "3Y", rate: 12.05, spread: 130, duration: 2.65 },
    { vertex: "5Y", rate: 12.45, spread: 165, duration: 4.18 },
    { vertex: "10Y", rate: 12.95, spread: 205, duration: 7.42 },
    { vertex: "15Y", rate: 13.35, spread: 245, duration: 9.85 },
  ],
  BBB: [
    { vertex: "1Y", rate: 12.25, spread: 175, duration: 0.92 },
    { vertex: "2Y", rate: 12.65, spread: 200, duration: 1.81 },
    { vertex: "3Y", rate: 13.05, spread: 230, duration: 2.65 },
    { vertex: "5Y", rate: 13.55, spread: 275, duration: 4.18 },
    { vertex: "10Y", rate: 14.15, spread: 325, duration: 7.42 },
    { vertex: "15Y", rate: 14.65, spread: 375, duration: 9.85 },
  ],
};

const ntnbData = [
  { vertex: "2026", rate: 6.15, yield: 6.18, spread: 0, type: "NTN-B" },
  { vertex: "2029", rate: 6.28, yield: 6.31, spread: 0, type: "NTN-B" },
  { vertex: "2035", rate: 6.45, yield: 6.48, spread: 0, type: "NTN-B" },
  { vertex: "2045", rate: 6.55, yield: 6.58, spread: 0, type: "NTN-B" },
  { vertex: "2055", rate: 6.62, yield: 6.65, spread: 0, type: "NTN-B" },
];

const debentures = [
  {
    emissor: "Petrobras",
    rating: "BBB",
    prazo: "2029",
    yield: 13.85,
    spread: 275,
    cupom: "IPCA+7.2%",
  },
  { emissor: "Vale", rating: "A", prazo: "2030", yield: 12.95, spread: 205, cupom: "IPCA+6.8%" },
  { emissor: "Itaú", rating: "AA", prazo: "2028", yield: 12.15, spread: 145, cupom: "IPCA+5.9%" },
  {
    emissor: "Bradesco",
    rating: "AA",
    prazo: "2027",
    yield: 11.95,
    spread: 135,
    cupom: "IPCA+5.7%",
  },
  { emissor: "Ambev", rating: "AAA", prazo: "2026", yield: 11.25, spread: 75, cupom: "IPCA+4.8%" },
  { emissor: "CCR", rating: "A", prazo: "2031", yield: 13.25, spread: 235, cupom: "IPCA+7.0%" },
];

const spreadAnalysis = [
  { rating: "AAA", currentSpread: 88, historicalAvg: 75, percentile: 85, signal: "Caro" },
  { rating: "AA", currentSpread: 145, historicalAvg: 125, percentile: 78, signal: "Caro" },
  { rating: "A", currentSpread: 205, historicalAvg: 185, percentile: 72, signal: "Neutro" },
  { rating: "BBB", currentSpread: 325, historicalAvg: 295, percentile: 65, signal: "Neutro" },
];

export function ANBIMACurves() {
  const [selectedRating, setSelectedRating] = useState<"AAA" | "AA" | "A" | "BBB">("AAA");
  const [selectedComparison, setSelectedComparison] = useState("spreads");
  const [activeTab, setActiveTab] = useState("curves");

  const currentCurveData = curveDataByRating[selectedRating];

  const exportTreasuryComparison = () => {
    console.log("Exportando comparação com Tesouro IPCA+...");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1>Curvas ANBIMA por Rating</h1>
        <p className="text-muted-foreground">
          Análise de crédito privado e comparação com Tesouro IPCA+
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="curves">Curvas por Rating</TabsTrigger>
          <TabsTrigger value="ntnb">vs. NTN-B</TabsTrigger>
          <TabsTrigger value="spreads">Análise de Spreads</TabsTrigger>
          <TabsTrigger value="debentures">Debêntures</TabsTrigger>
        </TabsList>

        <TabsContent value="curves" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Curvas ANBIMA - Rating {selectedRating}</span>
                  </CardTitle>
                  <CardDescription>Estrutura a termo por classificação de risco</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {Object.keys(curveDataByRating).map((rating) => (
                    <Button
                      key={rating}
                      variant={selectedRating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRating(rating as any)}>
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={currentCurveData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="vertex" />
                  <YAxis domain={["dataMin - 0.2", "dataMax + 0.2"]} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "rate" ? `${value}%` : `${value} bps`,
                      name === "rate" ? "Taxa" : "Spread vs DI",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    name="rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Detalhados - Rating {selectedRating}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vértice</TableHead>
                    <TableHead>Taxa (%)</TableHead>
                    <TableHead>Spread (bps)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCurveData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.vertex}</TableCell>
                      <TableCell className="font-semibold">{item.rate.toFixed(2)}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.spread < 100
                              ? "default"
                              : item.spread < 200
                              ? "secondary"
                              : "destructive"
                          }>
                          {item.spread} bps
                        </Badge>
                      </TableCell>
                      <TableCell>{item.duration.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Normal</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ntnb" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tesouro IPCA+ vs. Debêntures</CardTitle>
                  <CardDescription>
                    Comparação direta entre títulos públicos e privados
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportTreasuryComparison}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Comparação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="vertex" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    data={ntnbData}
                    type="monotone"
                    dataKey="yield"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.3}
                    name="NTN-B Real"
                  />
                  <Line
                    data={curveDataByRating.AAA}
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Debênture AAA"
                  />
                  <Line
                    data={curveDataByRating.A}
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Debênture A"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tesouro IPCA+ - Taxas Indicativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Taxa de Compra</TableHead>
                    <TableHead>Yield Real</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Prêmio vs IPCA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ntnbData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.vertex}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {item.rate.toFixed(2)}%
                      </TableCell>
                      <TableCell>{item.yield.toFixed(2)}%</TableCell>
                      <TableCell>{(Math.random() * 8 + 2).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="default">+{item.rate.toFixed(2)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spreads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Spreads de Crédito</CardTitle>
              <CardDescription>Comparação histórica e sinais de valor</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rating</TableHead>
                    <TableHead>Spread Atual</TableHead>
                    <TableHead>Média Histórica</TableHead>
                    <TableHead>Percentil</TableHead>
                    <TableHead>Sinal</TableHead>
                    <TableHead>Recomendação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spreadAnalysis.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.rating}</TableCell>
                      <TableCell className="font-semibold">{item.currentSpread} bps</TableCell>
                      <TableCell>{item.historicalAvg} bps</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.percentile > 75
                              ? "destructive"
                              : item.percentile > 50
                              ? "secondary"
                              : "default"
                          }>
                          P{item.percentile}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.signal === "Caro"
                              ? "destructive"
                              : item.signal === "Barato"
                              ? "default"
                              : "secondary"
                          }>
                          {item.signal}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.signal === "Caro" ? (
                          <span className="text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Aguardar
                          </span>
                        ) : item.signal === "Barato" ? (
                          <span className="text-green-600 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Comprar
                          </span>
                        ) : (
                          <span className="text-yellow-600">Neutro</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução Histórica dos Spreads</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { month: "Jan", AAA: 65, AA: 120, A: 180, BBB: 280 },
                    { month: "Fev", AAA: 70, AA: 125, A: 185, BBB: 290 },
                    { month: "Mar", AAA: 75, AA: 135, A: 195, BBB: 310 },
                    { month: "Abr", AAA: 80, AA: 140, A: 200, BBB: 315 },
                    { month: "Mai", AAA: 85, AA: 142, A: 202, BBB: 320 },
                    { month: "Jun", AAA: 88, AA: 145, A: 205, BBB: 325 },
                  ]}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} bps`, ""]} />
                  <Line
                    type="monotone"
                    dataKey="AAA"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="AAA"
                  />
                  <Line
                    type="monotone"
                    dataKey="AA"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="AA"
                  />
                  <Line
                    type="monotone"
                    dataKey="A"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="A"
                  />
                  <Line
                    type="monotone"
                    dataKey="BBB"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    name="BBB"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debentures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Debêntures em Circulação</CardTitle>
              <CardDescription>Principais emissões e suas características</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emissor</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Yield</TableHead>
                    <TableHead>Spread</TableHead>
                    <TableHead>Cupom</TableHead>
                    <TableHead>Recomendação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debentures.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.emissor}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.rating === "AAA"
                              ? "default"
                              : item.rating === "AA"
                              ? "secondary"
                              : "outline"
                          }>
                          {item.rating}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.prazo}</TableCell>
                      <TableCell className="font-semibold">{item.yield.toFixed(2)}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.spread < 150
                              ? "default"
                              : item.spread < 250
                              ? "secondary"
                              : "destructive"
                          }>
                          +{item.spread} bps
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.cupom}</TableCell>
                      <TableCell>
                        {item.spread < 150 ? (
                          <Badge variant="outline">Neutro</Badge>
                        ) : item.spread < 250 ? (
                          <Badge variant="default">Comprar</Badge>
                        ) : (
                          <Badge variant="destructive">Caro</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
