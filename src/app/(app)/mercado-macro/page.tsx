import React, { Suspense } from "react";
import { LazyMercadoMacro, DomainPageFallback } from "@/components/lazy/LazyDomainPages";

export default function Page() {
  return (
    <Suspense fallback={<DomainPageFallback />}>
      <LazyMercadoMacro />
    </Suspense>
  );
}
