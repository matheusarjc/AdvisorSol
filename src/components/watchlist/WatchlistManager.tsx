"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Eye, EyeOff, Trash2, Plus, TrendingUp, TrendingDown, Star } from "lucide-react";
import { fetchGlobalQuote } from "@/services/alpha";

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  addedAt: string;
  isVisible: boolean;
}

export function WatchlistManager() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Update prices periodically
  useEffect(() => {
    const updatePrices = async () => {
      if (watchlist.length === 0) return;

      setIsLoading(true);
      try {
        const updatedWatchlist = await Promise.all(
          watchlist.map(async (item) => {
            try {
              const quote = await fetchGlobalQuote(item.symbol);
              return {
                ...item,
                currentPrice: quote.price,
                change: quote.change,
                changePercent: (quote.change / (quote.price - quote.change)) * 100,
              };
            } catch (error) {
              console.error(`Error updating ${item.symbol}:`, error);
              return item;
            }
          })
        );
        setWatchlist(updatedWatchlist);
      } catch (error) {
        console.error("Error updating watchlist prices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Update immediately
    updatePrices();

    // Update every 30 seconds
    const interval = setInterval(updatePrices, 30000);
    return () => clearInterval(interval);
  }, [watchlist.length]); // Only depend on length to avoid infinite loops

  const addToWatchlist = async () => {
    if (!newSymbol.trim()) return;

    try {
      const quote = await fetchGlobalQuote(newSymbol.toUpperCase());
      const newItem: WatchlistItem = {
        id: Date.now().toString(),
        symbol: newSymbol.toUpperCase(),
        name: `${newSymbol.toUpperCase()} Inc.`, // In real app, fetch company name
        currentPrice: quote.price,
        change: quote.change,
        changePercent: (quote.change / (quote.price - quote.change)) * 100,
        volume: 0, // Would need additional API call
        marketCap: "N/A", // Would need additional API call
        addedAt: new Date().toISOString(),
        isVisible: true,
      };

      setWatchlist((prev) => [...prev, newItem]);
      setNewSymbol("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setWatchlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isVisible: !item.isVisible } : item))
    );
  };

  const visibleItems = watchlist.filter((item) => item.isVisible);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Lista de Observação</span>
            <Badge variant="secondary">{visibleItems.length}</Badge>
          </div>
          <AlertDialog open={isAdding} onOpenChange={setIsAdding}>
            <AlertDialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Adicionar à Lista de Observação</AlertDialogTitle>
                <AlertDialogDescription>
                  Adicione um ticker para monitorar seu preço e performance.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ticker</label>
                  <Input
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    placeholder="Ex: AAPL, MSFT, GOOGL"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={addToWatchlist}>Adicionar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
        <CardDescription>Monitore seus ativos favoritos em tempo real</CardDescription>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sua lista de observação está vazia</p>
            <p className="text-sm">Adicione tickers para começar a monitorar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-2">
                <Badge variant="outline">Atualizando preços...</Badge>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Market Cap</TableHead>
                  <TableHead>Adicionado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item) => (
                  <TableRow key={item.id} className={!item.isVisible ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.symbol}</span>
                        {!item.isVisible && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${item.currentPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {item.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={item.change >= 0 ? "text-green-600" : "text-red-600"}>
                          {item.change >= 0 ? "+" : ""}
                          {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.volume.toLocaleString()}</TableCell>
                    <TableCell>{item.marketCap}</TableCell>
                    <TableCell>{new Date(item.addedAt).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleVisibility(item.id)}>
                          {item.isVisible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromWatchlist(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
