import React, { Suspense } from "react";
import { LazyRiskAnalysis, DomainPageFallback } from "@/components/lazy/LazyDomainPages";

export default function Page() {
  return (
    <Suspense fallback={<DomainPageFallback />}>
      <LazyRiskAnalysis />
    </Suspense>
  );
}
