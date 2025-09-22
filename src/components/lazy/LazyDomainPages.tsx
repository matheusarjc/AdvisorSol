"use client";
import dynamic from "next/dynamic";
import { PageLoading } from "@/components/ui/loading";

// Dynamic (client-only) load das páginas de domínio para reduzir bundle inicial
export const LazyDashboard = dynamic(
  () => import("@/components/domains/Dashboard").then((m) => m.Dashboard),
  { ssr: false, loading: () => <PageLoading title="Carregando página..." /> }
);

export const LazyRendaFixaBrasil = dynamic(
  () => import("@/components/domains/RendaFixaBrasil").then((m) => m.RendaFixaBrasil),
  { ssr: false, loading: () => <PageLoading title="Carregando página..." /> }
);

export const LazyRendaFixaEUA = dynamic(
  () => import("@/components/domains/RendaFixaEUA").then((m) => m.RendaFixaEUA),
  { ssr: false, loading: () => <PageLoading title="Carregando página..." /> }
);

export const LazyMercadoMacro = dynamic(
  () => import("@/components/domains/MercadoMacro").then((m) => m.MercadoMacro),
  { ssr: false, loading: () => <PageLoading title="Carregando página..." /> }
);

export const LazyRendaVariavelBrasil = dynamic(
  () => import("@/components/domains/RendaVariavelBrasil").then((m) => m.RendaVariavelBrasil),
  { ssr: false, loading: () => <PageLoading title="Carregando página..." /> }
);

export const LazyRendaVariavelEUA = dynamic(
  () => import("@/components/domains/RendaVariavelEUA").then((m) => m.RendaVariavelEUA),
  { ssr: false, loading: () => <PageLoading title="Carregando página..." /> }
);

export const LazyRiskAnalysis = dynamic(
  () => import("@/components/domains/RiskAnalysis").then((m) => m.RiskAnalysis),
  { ssr: false, loading: () => <PageLoading title="Carregando página..." /> }
);

export const DomainPageFallback = () => <PageLoading title="Carregando página..." />;
