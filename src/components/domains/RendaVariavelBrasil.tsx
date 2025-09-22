"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";

const stocksData = [
  {
    ticker: "PETR4",
    company: "Petrobras",
    sector: "Petróleo",
    price: 32.85,
    change: 2.34,
    volume: "125M",
    marketCap: "428B",
    pe: 3.2,
    dividend: 8.5,
    chart: [
      { value: 30.2 },
      { value: 31.1 },
      { value: 30.8 },
      { value: 32.1 },
      { value: 31.9 },
      { value: 32.5 },
      { value: 32.85 },
    ],
  },
  {
    ticker: "VALE3",
    company: "Vale",
    sector: "Mineração",
    price: 71.2,
    change: -1.45,
    volume: "89M",
    marketCap: "345B",
    pe: 4.1,
    dividend: 12.2,
    chart: [
      { value: 73.5 },
      { value: 72.8 },
      { value: 74.1 },
      { value: 72.3 },
      { value: 71.8 },
      { value: 70.9 },
      { value: 71.2 },
    ],
  },
  {
    ticker: "ITUB4",
    company: "Itaú Unibanco",
    sector: "Bancos",
    price: 28.15,
    change: 1.89,
    volume: "67M",
    marketCap: "275B",
    pe: 9.8,
    dividend: 6.8,
    chart: [
      { value: 27.1 },
      { value: 27.6 },
      { value: 27.3 },
      { value: 28.0 },
      { value: 27.8 },
      { value: 28.2 },
      { value: 28.15 },
    ],
  },
  {
    ticker: "BBDC4",
    company: "Bradesco",
    sector: "Bancos",
    price: 15.87,
    change: 0.95,
    volume: "45M",
    marketCap: "145B",
    pe: 8.5,
    dividend: 7.2,
    chart: [
      { value: 15.2 },
      { value: 15.6 },
      { value: 15.4 },
      { value: 15.9 },
      { value: 15.7 },
      { value: 15.8 },
      { value: 15.87 },
    ],
  },
  {
    ticker: "MGLU3",
    company: "Magazine Luiza",
    sector: "Varejo",
    price: 8.95,
    change: -2.18,
    volume: "78M",
    marketCap: "58B",
    pe: 25.4,
    dividend: 0.0,
    chart: [
      { value: 9.8 },
      { value: 9.3 },
      { value: 9.6 },
      { value: 9.1 },
      { value: 9.2 },
      { value: 9.0 },
      { value: 8.95 },
    ],
  },
  {
    ticker: "WEGE3",
    company: "WEG",
    sector: "Bens Industriais",
    price: 42.3,
    change: 1.67,
    volume: "35M",
    marketCap: "285B",
    pe: 18.9,
    dividend: 2.1,
    chart: [
      { value: 40.8 },
      { value: 41.5 },
      { value: 41.2 },
      { value: 42.1 },
      { value: 41.9 },
      { value: 42.4 },
      { value: 42.3 },
    ],
  },
];

const sectors = ["Todos", "Bancos", "Petróleo", "Mineração", "Varejo", "Bens Industriais"];

export function RendaVariavelBrasil() {
  const [selectedSector, setSelectedSector] = useState("Todos");

  const filteredStocks =
    selectedSector === "Todos"
      ? stocksData
      : stocksData.filter((stock) => stock.sector === selectedSector);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Renda Variável Brasil</h1>
          <p className="text-gray-600">Análise de ações do mercado brasileiro</p>
        </div>
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por setor" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
              <SelectItem key={sector} value={sector}>
                {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Ibovespa</p>
              <p className="text-2xl font-semibold text-blue-900">128.450</p>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+2.35%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Volume</p>
              <p className="text-2xl font-semibold text-blue-900">R$ 12,8B</p>
              <p className="text-sm text-gray-500">Negociado hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Altas</p>
              <p className="text-2xl font-semibold text-green-600">287</p>
              <p className="text-sm text-gray-500">Papéis em alta</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Baixas</p>
              <p className="text-2xl font-semibold text-red-600">145</p>
              <p className="text-sm text-gray-500">Papéis em baixa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Principais Ações</CardTitle>
          <CardDescription>
            {selectedSector === "Todos" ? "Todas as ações" : `Setor: ${selectedSector}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Papel</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Variação</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>P/L</TableHead>
                <TableHead>DY</TableHead>
                <TableHead>Gráfico</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold">{stock.ticker}</TableCell>
                  <TableCell>{stock.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stock.sector}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">R$ {stock.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {stock.change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span
                        className={`font-medium ${
                          stock.change > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                        {stock.change > 0 ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{stock.volume}</TableCell>
                  <TableCell>{stock.pe.toFixed(1)}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {stock.dividend.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stock.chart}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={stock.change > 0 ? "#16a34a" : "#dc2626"}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Setorial</CardTitle>
          <CardDescription>Variação dos setores no dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { sector: "Bancos", change: 3.2, volume: "R$ 2.8B" },
              { sector: "Petróleo", change: 2.8, volume: "R$ 3.1B" },
              { sector: "Mineração", change: -1.5, volume: "R$ 1.9B" },
              { sector: "Varejo", change: 1.9, volume: "R$ 1.2B" },
              { sector: "Telecomunicações", change: -0.7, volume: "R$ 0.8B" },
              { sector: "Bens Industriais", change: 2.1, volume: "R$ 1.1B" },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{item.sector}</h4>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    {item.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`font-semibold ${
                        item.change > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                      {item.change > 0 ? "+" : ""}
                      {item.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Volume: {item.volume}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
