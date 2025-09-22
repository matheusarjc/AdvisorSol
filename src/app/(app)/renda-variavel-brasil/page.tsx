import React, { Suspense } from "react";
import { LazyRendaVariavelBrasil, DomainPageFallback } from "@/components/lazy/LazyDomainPages";

export default function Page() {
  return (
    <Suspense fallback={<DomainPageFallback />}>
      <LazyRendaVariavelBrasil />
    </Suspense>
  );
}
