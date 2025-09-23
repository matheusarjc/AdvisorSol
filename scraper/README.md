# AdvisorSol Scraper (esqueleto)

Este diretório contém o esqueleto de um microserviço de coleta (scraping) para complementar as fontes oficiais (SGS, Tesouro, ANBIMA, FRED, Alpha Vantage) quando houver indisponibilidade temporária ou lacunas. Use apenas fontes que permitam automação conforme ToS/licenças.

Fontes priorizadas (compliance-first)

- Oficiais/estáveis: BCB/SGS, Tesouro Direto, FRED, IBGE/SIDRA, ANBIMA (quando aplicável).
- Alternativas abertas (verificar ToS): Portais com RSS/JSON públicos.
- Scraping last-resort: Somente quando não existir API, com rate limit, backoff e respeito a robots.txt/ToS.

Arquitetura proposta

- Coleta: Playwright (headless) com user-agent claro, rate limit e backoff exponencial.
- Normalização: padronizar schemas (ex.: diCurve, tesouroIndicativos, debentures, ipcaSubitens).
- Cache/bus: Redis (TTL por tipo); fallback de “último bom dado”.
- Publicação: expor REST estável para o app (API própria) e publicar eventos para SSE/WebSocket.

Como rodar (futuro)

- Instalar dependências: `npm i`
- Desenvolvimento: `npm run dev`
- Produção: `npm run build && npm start`

Observações

- Este é um esqueleto inicial; não faz scraping real ainda. Integrações reais devem ser adicionadas de forma incremental e auditável, com logs e testes.
