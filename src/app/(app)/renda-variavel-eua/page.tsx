import React, { Suspense } from "react";
import { LazyRendaVariavelEUA, DomainPageFallback } from "@/components/lazy/LazyDomainPages";

export default function Page() {
  return (
    <Suspense fallback={<DomainPageFallback />}>
      <LazyRendaVariavelEUA />
    </Suspense>
  );
}
