"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
import { Bell, BellOff, Trash2, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { fetchGlobalQuote } from "@/services/alpha";

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: "above" | "below";
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export function PriceAlertManager() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    condition: "above" as "above" | "below",
    targetPrice: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts");
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(alerts));
  }, [alerts]);

  // Check alerts periodically
  useEffect(() => {
    const checkAlerts = async () => {
      for (const alert of alerts.filter((a) => a.isActive && !a.triggeredAt)) {
        try {
          const quote = await fetchGlobalQuote(alert.symbol);
          const currentPrice = quote.price;

          const shouldTrigger =
            alert.condition === "above"
              ? currentPrice >= alert.targetPrice
              : currentPrice <= alert.targetPrice;

          if (shouldTrigger) {
            setAlerts((prev) =>
              prev.map((a) =>
                a.id === alert.id
                  ? { ...a, currentPrice, triggeredAt: new Date().toISOString() }
                  : a
              )
            );
          } else {
            setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, currentPrice } : a)));
          }
        } catch (error) {
          console.error(`Error checking alert for ${alert.symbol}:`, error);
        }
      }
    };

    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [alerts]);

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.targetPrice) return;

    try {
      const quote = await fetchGlobalQuote(newAlert.symbol);
      const alert: PriceAlert = {
        id: Date.now().toString(),
        symbol: newAlert.symbol.toUpperCase(),
        condition: newAlert.condition,
        targetPrice: parseFloat(newAlert.targetPrice),
        currentPrice: quote.price,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      setAlerts((prev) => [...prev, alert]);
      setNewAlert({ symbol: "", condition: "above", targetPrice: "" });
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating alert:", error);
    }
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isActive: !alert.isActive } : alert))
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (alert.triggeredAt) return "triggered";
    if (!alert.isActive) return "inactive";
    return "active";
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case "triggered":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alertas de Preço</span>
          </div>
          <AlertDialog open={isCreating} onOpenChange={setIsCreating}>
            <AlertDialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Alerta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Criar Alerta de Preço</AlertDialogTitle>
                <AlertDialogDescription>
                  Configure um alerta para ser notificado quando o preço atingir um valor
                  específico.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ticker</Label>
                  <Input
                    value={newAlert.symbol}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: AAPL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Condição</Label>
                  <Select
                    value={newAlert.condition}
                    onValueChange={(value: "above" | "below") =>
                      setNewAlert({ ...newAlert, condition: value })
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Acima de</SelectItem>
                      <SelectItem value="below">Abaixo de</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preço Alvo (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                    placeholder="Ex: 150.00"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={createAlert}>Criar Alerta</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
        <CardDescription>
          Monitore preços e receba notificações quando atingirem seus alvos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum alerta configurado</p>
            <p className="text-sm">Clique em "Novo Alerta" para começar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Preço Alvo</TableHead>
                <TableHead>Preço Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => {
                const status = getAlertStatus(alert);
                const priceChange = alert.currentPrice - alert.targetPrice;
                const isAboveTarget =
                  alert.condition === "above" ? priceChange >= 0 : priceChange <= 0;

                return (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.symbol}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {alert.condition === "above" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span>{alert.condition === "above" ? "Acima de" : "Abaixo de"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${alert.targetPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">${alert.currentPrice.toFixed(2)}</span>
                        {isAboveTarget && status === "active" && (
                          <Badge variant="secondary" className="text-green-600">
                            Alvo atingido!
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAlertStatusColor(status)}>
                        {status === "triggered"
                          ? "Disparado"
                          : status === "active"
                          ? "Ativo"
                          : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => toggleAlert(alert.id)}>
                          {alert.isActive ? (
                            <BellOff className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteAlert(alert.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
