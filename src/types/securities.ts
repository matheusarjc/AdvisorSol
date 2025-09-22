export interface FixedIncomeSecurity {
  id?: string;
  issuer: string;
  indexador: "IPCA" | "CDI" | "SELIC" | "IGPM" | "PRE" | string;
  du?: number; // dias úteis até vencimento
  duration?: number;
  spread_soberano?: number; // bps vs NTN-B/UST
  rating?: string;
  setor?: string;
  taxa_bid?: number;
  taxa_ask?: number;
  pu?: number;
  updated_at?: string; // ISO
}
