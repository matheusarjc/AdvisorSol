import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface PageLoadingProps {
  title?: string;
}

export function PageLoading({ title = "Carregando..." }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] flex-col space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{title}</p>
    </div>
  );
}
