"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface RealtimePayload {
  ts: string;
  macro?: { dgs10?: number; dgs2?: number; vix?: number };
  fx?: { usdbrl?: { compra: number; venda: number } };
  news?: Array<{ id: string; title: string; source: string; ts: string }>;
}

interface RealtimeContextValue {
  lastUpdate?: RealtimePayload;
  connected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({ connected: false });

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [lastUpdate, setLastUpdate] = useState<RealtimePayload | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/realtime");
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as RealtimePayload;
        setLastUpdate(data);
      } catch {}
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ lastUpdate, connected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
