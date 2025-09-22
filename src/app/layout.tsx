import type { Metadata } from "next";
import "../index.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

export const metadata: Metadata = {
  title: "AdvisorSol",
  description: "Painel financeiro com análise de mercado",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <AuthProvider>
            <RealtimeProvider>{children}</RealtimeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
