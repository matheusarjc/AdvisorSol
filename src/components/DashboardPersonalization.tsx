"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Settings, Eye, EyeOff, GripVertical, Plus, ArrowUp, ArrowDown } from "lucide-react";

interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  category: "market" | "macro" | "risk" | "custom";
  enabled: boolean;
  order: number;
  size: "small" | "medium" | "large";
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: "ibovespa",
    title: "Ibovespa",
    description: "Índice principal brasileiro",
    category: "market",
    enabled: true,
    order: 1,
    size: "medium",
  },
  {
    id: "sp500",
    title: "S&P 500",
    description: "Índice americano",
    category: "market",
    enabled: true,
    order: 2,
    size: "medium",
  },
  {
    id: "usdbrl",
    title: "USD/BRL",
    description: "Taxa de câmbio",
    category: "macro",
    enabled: true,
    order: 3,
    size: "small",
  },
  {
    id: "selic",
    title: "Selic",
    description: "Taxa básica de juros",
    category: "macro",
    enabled: true,
    order: 4,
    size: "small",
  },
  {
    id: "dxy",
    title: "DXY",
    description: "Índice do dólar",
    category: "macro",
    enabled: false,
    order: 5,
    size: "small",
  },
  {
    id: "vix",
    title: "VIX",
    description: "Volatilidade implícita",
    category: "risk",
    enabled: false,
    order: 6,
    size: "small",
  },
  {
    id: "commodities",
    title: "Commodities",
    description: "Ouro, Petróleo, etc.",
    category: "macro",
    enabled: false,
    order: 7,
    size: "large",
  },
  {
    id: "earnings",
    title: "Earnings Calendar",
    description: "Calendário de resultados",
    category: "market",
    enabled: false,
    order: 8,
    size: "large",
  },
  {
    id: "correlations",
    title: "Correlações",
    description: "Matriz de correlações",
    category: "risk",
    enabled: false,
    order: 9,
    size: "medium",
  },
  {
    id: "news",
    title: "Notícias",
    description: "Feed de notícias financeiras",
    category: "custom",
    enabled: true,
    order: 10,
    size: "large",
  },
];

const layouts = [
  { id: "default", name: "Padrão", description: "Layout equilibrado" },
  { id: "trading", name: "Trading", description: "Foco em mercados" },
  { id: "macro", name: "Macro", description: "Análise macroeconômica" },
  { id: "risk", name: "Risco", description: "Gestão de risco" },
];

export function DashboardPersonalization({
  onSave,
}: {
  onSave: (widgets: DashboardWidget[]) => void;
}) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [selectedLayout, setSelectedLayout] = useState("default");
  const [activeTab, setActiveTab] = useState("widgets");

  const moveWidget = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;

    const newWidgets = [...widgets];
    [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];

    // Atualizar ordem
    const updatedItems = newWidgets.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setWidgets(updatedItems);
  };

  const toggleWidget = (id: string) => {
    setWidgets(
      widgets.map((widget) => (widget.id === id ? { ...widget, enabled: !widget.enabled } : widget))
    );
  };

  const updateWidgetSize = (id: string, size: "small" | "medium" | "large") => {
    setWidgets(widgets.map((widget) => (widget.id === id ? { ...widget, size } : widget)));
  };

  const applyLayout = (layoutId: string) => {
    setSelectedLayout(layoutId);

    // Aplicar configurações específicas do layout
    let updatedWidgets = [...widgets];

    switch (layoutId) {
      case "trading":
        updatedWidgets = updatedWidgets.map((widget) => {
          if (["ibovespa", "sp500", "usdbrl", "earnings"].includes(widget.id)) {
            return { ...widget, enabled: true };
          }
          return widget;
        });
        break;
      case "macro":
        updatedWidgets = updatedWidgets.map((widget) => {
          if (["selic", "dxy", "commodities", "usdbrl"].includes(widget.id)) {
            return { ...widget, enabled: true };
          }
          return widget;
        });
        break;
      case "risk":
        updatedWidgets = updatedWidgets.map((widget) => {
          if (["vix", "correlations", "ibovespa", "sp500"].includes(widget.id)) {
            return { ...widget, enabled: true };
          }
          return widget;
        });
        break;
    }

    setWidgets(updatedWidgets);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "market":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "macro":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      case "risk":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "custom":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const enabledWidgets = widgets.filter((w) => w.enabled).sort((a, b) => a.order - b.order);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Personalizar Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalização do Dashboard</DialogTitle>
          <DialogDescription>
            Configure os widgets e layout do seu dashboard principal
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="widgets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Gerenciar Widgets</h3>
              <Badge variant="outline">{enabledWidgets.length} ativos</Badge>
            </div>

            <div className="space-y-2">
              {widgets.map((widget, index) => (
                <div
                  key={widget.id}
                  className={`
                    flex items-center justify-between p-3 border rounded-lg
                    ${widget.enabled ? "bg-background" : "bg-muted/50 opacity-60"}
                  `}>
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveWidget(index, "up")}
                        disabled={index === 0}
                        className="h-6 w-6 p-0">
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveWidget(index, "down")}
                        disabled={index === widgets.length - 1}
                        className="h-6 w-6 p-0">
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{widget.title}</span>
                        <Badge variant="outline" className={getCategoryColor(widget.category)}>
                          {widget.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{widget.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Select
                      value={widget.size}
                      onValueChange={(size) => updateWidgetSize(widget.id, size as any)}
                      disabled={!widget.enabled}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeno</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>

                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                    {widget.enabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Layouts Predefinidos</h3>
              <div className="grid grid-cols-2 gap-4">
                {layouts.map((layout) => (
                  <Card
                    key={layout.id}
                    className={`cursor-pointer transition-colors ${
                      selectedLayout === layout.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => applyLayout(layout.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{layout.name}</h4>
                        {selectedLayout === layout.id && <Badge variant="default">Ativo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{layout.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Configurações Avançadas</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-refresh de dados</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Animações suaves</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alertas em tempo real</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Preview do Dashboard</h3>
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {enabledWidgets.slice(0, 8).map((widget) => (
                    <div
                      key={widget.id}
                      className={`
                        p-3 border rounded-lg bg-background
                        ${widget.size === "large" ? "md:col-span-2" : ""}
                        ${widget.size === "medium" ? "md:col-span-1" : ""}
                      `}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{widget.title}</span>
                        <Badge variant="outline" className={getCategoryColor(widget.category)}>
                          {widget.size}
                        </Badge>
                      </div>
                      <div className="h-16 bg-muted/50 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Widget Content</span>
                      </div>
                    </div>
                  ))}
                </div>
                {enabledWidgets.length > 8 && (
                  <div className="mt-4 text-center">
                    <Badge variant="outline">+{enabledWidgets.length - 8} widgets adicionais</Badge>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline">Cancelar</Button>
          <Button onClick={() => onSave(widgets)}>Salvar Configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
