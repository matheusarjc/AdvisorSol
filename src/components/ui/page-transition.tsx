"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PageLoading } from "./loading";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 100); // Delay mínimo para suavizar a transição

    return () => clearTimeout(timer);
  }, [pathname, children]);

  if (isLoading) {
    return <PageLoading title="Carregando..." />;
  }

  return <div className="animate-in fade-in-50 duration-200">{displayChildren}</div>;
}
