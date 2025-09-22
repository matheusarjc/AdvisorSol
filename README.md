# AdvisorSol

This is a code bundle for AdvisorSol. The original project is available at https://www.figma.com/design/43qhwAaQ87W53ESPjyfmWV/AdvisorSol.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Dados Reais e Tempo Real

Para ativar dados reais (desabilitar mocks) e habilitar integrações externas:

1. .env.local

```
# Desliga mocks em cliente/serviços
NEXT_PUBLIC_USE_MOCKS=false

# FRED (Treasury yields, VIX)
FRED_API_KEY=SEU_TOKEN_FRED_AQUI

# News (opcional)
NEWS_API_KEY=SEU_TOKEN_NEWSAPI_AQUI
```

2. Reinicie o servidor de desenvolvimento após alterar as variáveis.

3. Endpoints utilizados

- FRED: `/api/proxy/fred?series_id=<SERIE>`
- SGS/BCB: `/api/proxy/sgs?serie=<COD>` (Selic=11, IPCA=433)
- PTAX: `/api/proxy/ptax`
- ANBIMA (mock): `/api/proxy/anbima`
- SIDRA (mock IPCA): `/api/proxy/sidra`
- Commodities (mock): `/api/proxy/commodities`
- Realtime SSE: `/api/realtime`

Observações

- Em desenvolvimento, mantenha `NEXT_PUBLIC_USE_MOCKS=true` para evitar limites de API e garantir navegação fluida.
- Em produção, defina `NEXT_PUBLIC_USE_MOCKS=false` e configure as chaves acima para dados reais.
