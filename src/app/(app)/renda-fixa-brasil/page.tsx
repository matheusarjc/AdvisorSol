import React, { Suspense } from "react";
import { LazyRendaFixaBrasil, DomainPageFallback } from "@/components/lazy/LazyDomainPages";

export default function Page() {
  return (
    <Suspense fallback={<DomainPageFallback />}>
      <LazyRendaFixaBrasil />
    </Suspense>
  );
}
