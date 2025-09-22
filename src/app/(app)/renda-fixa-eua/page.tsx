import React, { Suspense } from "react";
import { LazyRendaFixaEUA, DomainPageFallback } from "@/components/lazy/LazyDomainPages";

export default function Page() {
  return (
    <Suspense fallback={<DomainPageFallback />}>
      <LazyRendaFixaEUA />
    </Suspense>
  );
}
