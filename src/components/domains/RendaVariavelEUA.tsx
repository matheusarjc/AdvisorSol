"use client";
import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Zap,
  BarChart3,
  Target,
  AlertCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  fetchGlobalQuote,
  fetchRSI,
  fetchSMA,
  fetchMACD,
  fetchTimeSeriesDaily,
  TimeSeriesData,
} from "@/services/alpha";
import { fetchSymbolNews, NewsItem } from "@/services/news";
import { PriceAlertManager } from "@/components/alerts/PriceAlertManager";
import { WatchlistManager } from "@/components/watchlist/WatchlistManager";
import {
  fetchPopularStocks,
  fetchStockData,
  fetchStockTimeSeries,
  fetchTechnicalIndicators,
  StockData,
  TechnicalIndicators,
} from "@/services/stocks";

// Popular stocks for the application
const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "BRK.B",
  "UNH",
  "JNJ",
  "V",
  "PG",
  "JPM",
  "HD",
  "MA",
  "DIS",
  "PYPL",
  "ADBE",
];

const stocksData = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.25,
    change: 2.45,
    changePercent: 1.31,
    volume: "52.8M",
    marketCap: "2.94T",
    pe: 28.5,
    eps: 6.64,
    dividend: 3.0,
    beta: 1.29,
    rsi: 64.2,
    ma50: 185.3,
    ma200: 175.8,
    sentiment: "Bullish",
    sector: "Technology",
    rating: "Buy",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.85,
    change: -3.2,
    changePercent: -0.84,
    volume: "28.5M",
    marketCap: "2.81T",
    pe: 32.1,
    eps: 11.8,
    dividend: 3.0,
    beta: 0.89,
    rsi: 42.8,
    ma50: 385.6,
    ma200: 370.2,
    sentiment: "Neutral",
    sector: "Technology",
    rating: "Hold",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.58,
    change: 1.85,
    changePercent: 1.32,
    volume: "31.2M",
    marketCap: "1.78T",
    pe: 24.8,
    eps: 5.75,
    dividend: 0.0,
    beta: 1.05,
    rsi: 58.9,
    ma50: 138.45,
    ma200: 132.7,
    sentiment: "Bullish",
    sector: "Technology",
    rating: "Buy",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.5,
    change: -8.75,
    changePercent: -3.4,
    volume: "89.4M",
    marketCap: "791B",
    pe: 58.2,
    eps: 4.27,
    dividend: 0.0,
    beta: 2.08,
    rsi: 32.1,
    ma50: 268.9,
    ma200: 245.3,
    sentiment: "Bearish",
    sector: "Consumer Cyclical",
    rating: "Hold",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 465.8,
    change: 12.35,
    changePercent: 2.72,
    volume: "95.6M",
    marketCap: "1.15T",
    pe: 65.4,
    eps: 7.12,
    dividend: 0.16,
    beta: 1.68,
    rsi: 71.5,
    ma50: 428.6,
    ma200: 398.2,
    sentiment: "Bullish",
    sector: "Technology",
    rating: "Strong Buy",
  },
];

const sectorPerformance = [
  { sector: "Technology", performance: 2.8, weight: 28.5, pe: 28.2, momentum: "Strong" },
  { sector: "Healthcare", performance: 1.2, weight: 12.8, pe: 18.5, momentum: "Moderate" },
  { sector: "Financial", performance: -0.8, weight: 13.2, pe: 12.4, momentum: "Weak" },
  { sector: "Consumer Cyclical", performance: 1.8, weight: 10.9, pe: 22.1, momentum: "Moderate" },
  { sector: "Energy", performance: -2.1, weight: 4.2, pe: 14.8, momentum: "Weak" },
  { sector: "Real Estate", performance: 0.5, weight: 2.8, pe: 28.9, momentum: "Neutral" },
];

const technicalIndicators = [
  { date: "Jan", rsi: 58, macd: 0.8, bollinger: "Neutral", support: 4200, resistance: 4800 },
  { date: "Fev", rsi: 65, macd: 1.2, bollinger: "Upper", support: 4300, resistance: 4900 },
  { date: "Mar", rsi: 42, macd: -0.5, bollinger: "Lower", support: 4100, resistance: 4700 },
  { date: "Abr", rsi: 55, macd: 0.3, bollinger: "Neutral", support: 4250, resistance: 4850 },
  { date: "Mai", rsi: 68, macd: 1.5, bollinger: "Upper", support: 4400, resistance: 5000 },
  { date: "Jun", rsi: 61, macd: 0.9, bollinger: "Neutral", support: 4350, resistance: 4950 },
];

const marketSentiment = {
  fearGreed: 72,
  vix: 16.8,
  putCall: 0.85,
  insider: "Bullish",
  momentum: "Strong",
  breadth: "Positive",
};

const earnings = [
  {
    symbol: "AAPL",
    date: "2024-01-25",
    estimate: 2.1,
    reported: 2.18,
    surprise: 3.8,
    reaction: 5.2,
  },
  {
    symbol: "MSFT",
    date: "2024-01-24",
    estimate: 2.78,
    reported: 2.93,
    surprise: 5.4,
    reaction: 2.1,
  },
  {
    symbol: "GOOGL",
    date: "2024-01-30",
    estimate: 1.42,
    reported: 1.64,
    surprise: 15.5,
    reaction: 8.9,
  },
  {
    symbol: "META",
    date: "2024-02-01",
    estimate: 4.85,
    reported: 5.33,
    surprise: 9.9,
    reaction: 12.1,
  },
];

export function RendaVariavelEUA() {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [filterSector, setFilterSector] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<{ price: number; change: number } | null>(null);
  const [rsi, setRsi] = useState<number | null>(null);
  const [sma50, setSma50] = useState<number | null>(null);
  const [sma200, setSma200] = useState<number | null>(null);
  const [macd, setMacd] = useState<{ macd: number; signal: number; hist: number } | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [symbolNews, setSymbolNews] = useState<NewsItem[]>([]);
  const [tracked, setTracked] = useState("AAPL");

  // Load popular stocks on component mount
  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      try {
        const stocksData = await fetchPopularStocks();
        setStocks(stocksData);
      } catch (error) {
        console.error("Error loading stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStocks();
  }, []);

  // Load technical data when selected stock changes
  useEffect(() => {
    if (selectedStock) {
      loadTechnicals(selectedStock);
    }
  }, [selectedStock]);

  async function loadTechnicals(sym: string) {
    try {
      const [q, r, s50, s200, m, ts, news] = await Promise.all([
        fetchGlobalQuote(sym),
        fetchRSI(sym),
        fetchSMA(sym, 50),
        fetchSMA(sym, 200),
        fetchMACD(sym),
        fetchTimeSeriesDaily(sym),
        fetchSymbolNews(sym, 4),
      ]);
      setQuote({ price: q.price, change: q.change });
      setRsi(r);
      setSma50(s50.sma);
      setSma200(s200.sma);
      setMacd(m);
      setTimeSeriesData(ts);
      setSymbolNews(news);
    } catch (error) {
      console.error("Error loading technical data:", error);
    }
  }

  useEffect(() => {
    loadTechnicals(tracked).catch(() => {});
  }, [tracked]);

  // Remove the old priceData generation since we're using real data now

  const filteredStocks = stocks.filter((stock) => {
    const matchesSector = filterSector === "All" || stock.sector === filterSector;
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1>Renda Variável EUA</h1>
        <p className="text-muted-foreground">
          Análise avançada de ações americanas com dados em tempo real
        </p>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm text-muted-foreground">Ticker</span>
        <Select value={tracked} onValueChange={(v) => setTracked(v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stocks.slice(0, 10).map((stock) => (
              <SelectItem key={stock.symbol} value={stock.symbol}>
                {stock.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">{tracked} Quote</p>
              <p className="text-2xl font-semibold">
                {quote && typeof quote.price === "number" ? `$${quote.price.toFixed(2)}` : "--"}
              </p>
              <p
                className={`text-xs mt-1 ${
                  quote && quote.change >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {quote && typeof quote.change === "number" ? `${quote.change.toFixed(2)}%` : ""}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">{tracked} RSI (14)</p>
              <p className="text-2xl font-semibold">{rsi != null ? rsi.toFixed(1) : "--"}</p>
              <p className="text-xs mt-1 text-muted-foreground">Alpha Vantage</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">SMA 50 / 200</p>
              <p className="text-2xl font-semibold">
                {sma50 != null ? sma50.toFixed(2) : "--"} /{" "}
                {sma200 != null ? sma200.toFixed(2) : "--"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">MACD</p>
              <p className="text-2xl font-semibold">
                {macd && typeof macd.macd === "number" ? macd.macd.toFixed(2) : "--"}
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Signal {macd && typeof macd.signal === "number" ? macd.signal.toFixed(2) : "--"} •
                Hist {macd && typeof macd.hist === "number" ? macd.hist.toFixed(2) : "--"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price and Volume Charts */}
      {timeSeriesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Preços - {tracked}</CardTitle>
              <CardDescription>Preço de fechamento com médias móveis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("pt-BR", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip
                    formatter={(value, name) => [
                      `$${value}`,
                      name === "close" ? "Preço" : name === "sma50" ? "SMA 50" : "SMA 200",
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString("pt-BR")}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="close"
                  />
                  {sma50 && (
                    <Line
                      type="monotone"
                      dataKey={() => sma50}
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="sma50"
                      dot={false}
                    />
                  )}
                  {sma200 && (
                    <Line
                      type="monotone"
                      dataKey={() => sma200}
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="sma200"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume de Negociação - {tracked}</CardTitle>
              <CardDescription>Volume diário de negociação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("pt-BR", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${(value as number).toLocaleString()}`, "Volume"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString("pt-BR")}
                  />
                  <Bar dataKey="volume" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Symbol-specific News */}
      {symbolNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Notícias - {tracked}</span>
            </CardTitle>
            <CardDescription>Últimas notícias relacionadas ao ticker selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {symbolNews.map((article, index) => (
                <a
                  href={article.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={article.id}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.ts).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="screener" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="screener">Screener</TabsTrigger>
          <TabsTrigger value="analysis">Análise Técnica</TabsTrigger>
          <TabsTrigger value="sectors">Setores</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="sentiment">Sentimento</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="screener" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome ou símbolo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Setor</label>
                  <Select value={filterSector} onValueChange={setFilterSector}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Todos os Setores</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Consumer Cyclical">Consumer Cyclical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant="outline" className="w-full justify-center">
                    {filteredStocks.length} ações encontradas
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações em Tempo Real</CardTitle>
              <CardDescription>Dados atualizados a cada 15 segundos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Símbolo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>P/E</TableHead>
                    <TableHead>RSI</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{stock.symbol}</p>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${typeof stock.price === "number" ? stock.price.toFixed(2) : "--"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {stock.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={stock.change > 0 ? "text-green-600" : "text-red-600"}>
                            {stock.change > 0 ? "+" : ""}
                            {typeof stock.changePercent === "number"
                              ? stock.changePercent.toFixed(2)
                              : "--"}
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{stock.volume}</TableCell>
                      <TableCell>
                        {typeof stock.pe === "number" ? stock.pe.toFixed(1) : "--"}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-center px-2 py-1 rounded text-xs ${
                            stock.rsi && stock.rsi > 70
                              ? "bg-red-100 text-red-700 dark:bg-red-950/20"
                              : stock.rsi && stock.rsi < 30
                              ? "bg-green-100 text-green-700 dark:bg-green-950/20"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800"
                          }`}>
                          {typeof stock.rsi === "number" ? stock.rsi.toFixed(1) : "--"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            stock.rating === "Strong Buy"
                              ? "default"
                              : stock.rating === "Buy"
                              ? "secondary"
                              : "outline"
                          }>
                          {stock.rating || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStock(stock.symbol)}>
                          Analisar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedStock} - Análise Intraday</CardTitle>
              <CardDescription>Gráfico de preços com indicadores técnicos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip
                    formatter={(value, name) => [`$${value}`, "Preço"]}
                    labelFormatter={(label) => `Horário: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Técnicos - S&P 500</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={technicalIndicators}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rsi"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="RSI"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suporte e Resistência</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={technicalIndicators}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="resistance"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.3}
                      name="Resistência"
                    />
                    <Area
                      type="monotone"
                      dataKey="support"
                      stroke="hsl(var(--chart-4))"
                      fill="hsl(var(--chart-4))"
                      fillOpacity={0.3}
                      name="Suporte"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Setorial</CardTitle>
              <CardDescription>Análise de rotação setorial e momentum</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setor</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Peso S&P</TableHead>
                    <TableHead>P/E Médio</TableHead>
                    <TableHead>Momentum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectorPerformance.map((sector, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{sector.sector}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {sector.performance > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={sector.performance > 0 ? "text-green-600" : "text-red-600"}>
                            {sector.performance > 0 ? "+" : ""}
                            {typeof sector.performance === "number"
                              ? sector.performance.toFixed(1)
                              : "--"}
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{sector.weight}%</TableCell>
                      <TableCell>
                        {typeof sector.pe === "number" ? sector.pe.toFixed(1) : "--"}x
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sector.momentum === "Strong"
                              ? "default"
                              : sector.momentum === "Moderate"
                              ? "secondary"
                              : sector.momentum === "Weak"
                              ? "destructive"
                              : "outline"
                          }>
                          {sector.momentum}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Calendário de Earnings</span>
              </CardTitle>
              <CardDescription>Resultados recentes e surpresas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Estimativa</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Surpresa</TableHead>
                    <TableHead>Reação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((earning, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{earning.symbol}</TableCell>
                      <TableCell>{earning.date}</TableCell>
                      <TableCell>
                        ${typeof earning.estimate === "number" ? earning.estimate.toFixed(2) : "--"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${typeof earning.reported === "number" ? earning.reported.toFixed(2) : "--"}
                      </TableCell>
                      <TableCell>
                        <span className={earning.surprise > 0 ? "text-green-600" : "text-red-600"}>
                          {earning.surprise > 0 ? "+" : ""}
                          {typeof earning.surprise === "number"
                            ? earning.surprise.toFixed(1)
                            : "--"}
                          %
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={earning.reaction > 0 ? "text-green-600" : "text-red-600"}>
                          {earning.reaction > 0 ? "+" : ""}
                          {typeof earning.reaction === "number"
                            ? earning.reaction.toFixed(1)
                            : "--"}
                          %
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fear & Greed Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-semibold text-green-600">
                    {marketSentiment.fearGreed}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${marketSentiment.fearGreed}%` }}></div>
                  </div>
                  <p className="text-sm text-green-600 font-medium">Extreme Greed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores Técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">VIX</span>
                    <span className="font-semibold text-green-600">{marketSentiment.vix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Put/Call Ratio</span>
                    <span className="font-semibold">{marketSentiment.putCall}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Insider Trading</span>
                    <Badge variant="default">{marketSentiment.insider}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Breadth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Momentum</span>
                    <Badge variant="default">{marketSentiment.momentum}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Breadth</span>
                    <Badge variant="default">{marketSentiment.breadth}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Advance/Decline</span>
                    <span className="font-semibold text-green-600">1.85</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <PriceAlertManager />
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-6">
          <WatchlistManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
