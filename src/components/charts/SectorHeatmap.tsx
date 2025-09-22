import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";

const sectorData = [
  {
    sector: "Tecnologia",
    performance: 2.8,
    weight: 28.5,
    color: "bg-green-500",
    companies: ["AAPL", "MSFT", "GOOGL"],
  },
  {
    sector: "Saúde",
    performance: 1.2,
    weight: 12.8,
    color: "bg-green-300",
    companies: ["JNJ", "PFE", "UNH"],
  },
  {
    sector: "Financeiro",
    performance: -0.8,
    weight: 13.2,
    color: "bg-red-300",
    companies: ["JPM", "BAC", "WFC"],
  },
  {
    sector: "Consumo Cíclico",
    performance: 1.8,
    weight: 10.9,
    color: "bg-green-400",
    companies: ["TSLA", "AMZN", "HD"],
  },
  {
    sector: "Energia",
    performance: -2.1,
    weight: 4.2,
    color: "bg-red-500",
    companies: ["XOM", "CVX", "COP"],
  },
  {
    sector: "Imobiliário",
    performance: 0.5,
    weight: 2.8,
    color: "bg-yellow-300",
    companies: ["SPG", "PLD", "AMT"],
  },
  {
    sector: "Utilidades",
    performance: -1.2,
    weight: 3.1,
    color: "bg-red-400",
    companies: ["NEE", "SO", "DUK"],
  },
  {
    sector: "Materiais",
    performance: 0.8,
    weight: 2.5,
    color: "bg-green-200",
    companies: ["LIN", "APD", "SHW"],
  },
  {
    sector: "Industrial",
    performance: 1.5,
    weight: 8.4,
    color: "bg-green-300",
    companies: ["CAT", "BA", "HON"],
  },
  {
    sector: "Telecom",
    performance: -0.3,
    weight: 1.2,
    color: "bg-yellow-400",
    companies: ["VZ", "T", "TMUS"],
  },
  {
    sector: "Consumo Básico",
    performance: 0.2,
    weight: 6.1,
    color: "bg-yellow-200",
    companies: ["WMT", "PG", "KO"],
  },
  {
    sector: "Discricionário",
    performance: 2.1,
    weight: 6.3,
    color: "bg-green-400",
    companies: ["NKE", "SBUX", "MCD"],
  },
];

const brazilianSectors = [
  {
    sector: "Bancos",
    performance: -1.5,
    weight: 22.3,
    color: "bg-red-400",
    companies: ["BBDC4", "ITUB4", "BBAS3"],
  },
  {
    sector: "Mineração",
    performance: 3.2,
    weight: 18.7,
    color: "bg-green-500",
    companies: ["VALE3", "BEEF3", "SUZB3"],
  },
  {
    sector: "Petróleo",
    performance: 1.8,
    weight: 15.4,
    color: "bg-green-400",
    companies: ["PETR4", "PRIO3", "RECV3"],
  },
  {
    sector: "Varejo",
    performance: -2.8,
    weight: 8.9,
    color: "bg-red-500",
    companies: ["MGLU3", "LREN3", "AMER3"],
  },
  {
    sector: "Telecomunicações",
    performance: 0.5,
    weight: 4.2,
    color: "bg-yellow-300",
    companies: ["VIVT3", "TIMS3", "OIBR3"],
  },
  {
    sector: "Siderurgia",
    performance: 2.5,
    weight: 3.8,
    color: "bg-green-500",
    companies: ["CSNA3", "USIM5", "GGBR4"],
  },
  {
    sector: "Papel e Celulose",
    performance: 1.2,
    weight: 3.1,
    color: "bg-green-300",
    companies: ["SUZB3", "KLBN11", "FIBR3"],
  },
  {
    sector: "Alimentos",
    performance: -0.8,
    weight: 2.9,
    color: "bg-red-300",
    companies: ["JBSS3", "BRFS3", "MRFG3"],
  },
  {
    sector: "Elétrico",
    performance: 0.8,
    weight: 7.2,
    color: "bg-green-200",
    companies: ["ELET3", "CMIG4", "CPFE3"],
  },
  {
    sector: "Imobiliário",
    performance: -1.8,
    weight: 2.1,
    color: "bg-red-400",
    companies: ["MULT3", "CYRE3", "MRVE3"],
  },
];

interface SectorHeatmapProps {
  market?: "US" | "BR";
}

export function SectorHeatmap({ market = "US" }: SectorHeatmapProps) {
  const [selectedMarket, setSelectedMarket] = useState<"US" | "BR">(market);
  const [timeframe, setTimeframe] = useState("1D");

  const currentData = selectedMarket === "US" ? sectorData : brazilianSectors;

  const getGridSize = (weight: number, maxWeight: number) => {
    const ratio = weight / maxWeight;
    if (ratio > 0.15) return "col-span-3 row-span-2";
    if (ratio > 0.1) return "col-span-2 row-span-2";
    if (ratio > 0.05) return "col-span-2 row-span-1";
    return "col-span-1 row-span-1";
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 2) return "bg-green-600 text-white";
    if (performance > 1) return "bg-green-500 text-white";
    if (performance > 0) return "bg-green-300 text-gray-800";
    if (performance > -1) return "bg-yellow-300 text-gray-800";
    if (performance > -2) return "bg-red-300 text-gray-800";
    return "bg-red-600 text-white";
  };

  const maxWeight = Math.max(...currentData.map((d) => d.weight));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Heatmap Setorial</CardTitle>
            <CardDescription>Performance por setor - tamanho = peso no índice</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select
              value={selectedMarket}
              onValueChange={(value) => setSelectedMarket(value as "US" | "BR")}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">🇺🇸 EUA</SelectItem>
                <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1S</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="YTD">YTD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2 h-96">
          {currentData.map((sector, index) => (
            <div
              key={index}
              className={`
                ${getGridSize(sector.weight, maxWeight)}
                ${getPerformanceColor(sector.performance)}
                rounded-lg p-3 flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700
              `}
              title={`${sector.sector}: ${
                sector.performance > 0 ? "+" : ""
              }${sector.performance.toFixed(2)}% | Peso: ${sector.weight}%`}>
              <div>
                <div className="font-semibold text-sm leading-tight mb-1">{sector.sector}</div>
                <div className="text-xs opacity-90 mb-2">{sector.weight.toFixed(1)}%</div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {sector.performance > 0 ? "+" : ""}
                    {sector.performance.toFixed(1)}%
                  </span>
                  {sector.performance > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </div>
                <div className="text-xs opacity-80 mt-1">
                  {sector.companies.slice(0, 2).join(", ")}
                  {sector.companies.length > 2 && "..."}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center space-x-4 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>&gt; +2%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <span>0% a +2%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-300 rounded"></div>
            <span>0% a -1%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-300 rounded"></div>
            <span>-1% a -2%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>&lt; -2%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
