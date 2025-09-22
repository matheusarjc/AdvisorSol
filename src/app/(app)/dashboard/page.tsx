import React, { Suspense } from "react";
import { LazyDashboard, DomainPageFallback } from "@/components/lazy/LazyDomainPages";

export default function Page() {
  return (
    <Suspense fallback={<DomainPageFallback />}>
      <LazyDashboard />
    </Suspense>
  );
}
