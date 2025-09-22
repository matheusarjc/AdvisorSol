import type { Metadata } from "next";
import "../index.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "AdvisorSol",
  description: "Painel financeiro com análise de mercado",
  keywords: "investimentos, análise financeira, mercado, ações, renda fixa",
  authors: [{ name: "AdvisorSol Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "AdvisorSol - Plataforma de Análises de Investimentos",
    description: "Painel financeiro com análise de mercado em tempo real",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const devCsp =
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; connect-src 'self' http: https: ws: wss: data: blob: https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://*.googleapis.com";

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {isDevelopment ? <meta httpEquiv="Content-Security-Policy" content={devCsp} /> : null}
      </head>
      <body className="min-h-screen bg-background">
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <RealtimeProvider>
                <ToastProvider>{children}</ToastProvider>
              </RealtimeProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
