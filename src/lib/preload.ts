// Preload critical components and data for faster navigation
export function preloadCriticalAssets() {
  if (typeof window === "undefined") return;

  // Preload common API calls
  const commonAPIs = [
    "/api/proxy/fred?series_id=DGS10",
    "/api/proxy/fred?series_id=DGS2",
    "/api/proxy/sgs?serie=11",
    "/api/proxy/ptax?",
  ];

  // Use requestIdleCallback to preload during idle time
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      commonAPIs.forEach((url) => {
        fetch(url).catch(() => {}); // Silent fail
      });
    });
  }
}

// Preload specific page components
export function preloadPageComponent(pageName: string) {
  if (typeof window === "undefined") return;

  const componentMap: Record<string, () => Promise<any>> = {
    dashboard: () => import("@/components/domains/Dashboard"),
    "renda-fixa-brasil": () => import("@/components/domains/RendaFixaBrasil"),
    "renda-fixa-eua": () => import("@/components/domains/RendaFixaEUA"),
    "mercado-macro": () => import("@/components/domains/MercadoMacro"),
    "renda-variavel-brasil": () => import("@/components/domains/RendaVariavelBrasil"),
    "renda-variavel-eua": () => import("@/components/domains/RendaVariavelEUA"),
    "risk-analysis": () => import("@/components/domains/RiskAnalysis"),
  };

  const loader = componentMap[pageName];
  if (loader && "requestIdleCallback" in window) {
    requestIdleCallback(() => {
      loader().catch(() => {}); // Silent fail
    });
  }
}
