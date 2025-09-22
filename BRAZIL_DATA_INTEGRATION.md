# Integração de Dados Dinâmicos - Brasil

## Status Atual das APIs

### ✅ APIs Corrigidas e Melhoradas

#### 1. SGS (Banco Central do Brasil)

- **Status**: ✅ Funcionando
- **Fonte**: https://api.bcb.gov.br/dados/serie/bcdata.sgs
- **Dados**: Selic, IPCA, CDI, IGP-M
- **Correção**: Fixado erro "data.map is not a function"
- **Cache**: 5 minutos

#### 2. PTAX (Banco Central do Brasil)

- **Status**: ✅ Funcionando
- **Fonte**: https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata
- **Dados**: Cotações USD/BRL
- **Cache**: 5 minutos

#### 3. Tesouro Direto

- **Status**: ✅ Melhorado
- **Fontes**: Múltiplas tentativas
  - https://www.tesourodireto.com.br/json/tdi_prices.json
  - https://api.tesourodireto.com.br/tdi/v1/titulos
- **Dados**: Títulos públicos com taxas e preços
- **Fallback**: Dados mockados realistas

### 🔄 APIs que Precisam de Melhorias

#### 4. SIDRA (IBGE)

- **Status**: 🔄 Mockado
- **Necessário**: Integração com API oficial do IBGE
- **Dados**: IPCA subitens, PIB, desemprego

#### 5. ANBIMA

- **Status**: 🔄 Mockado
- **Necessário**: Integração com API oficial da ANBIMA
- **Dados**: Debêntures, curvas de crédito

## Como Ativar Dados Reais

### 1. Configuração de Ambiente

Criar arquivo `.env.local` baseado em `env.example`:

```bash
# Para usar dados reais
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_USE_REAL_DATA=true

# Chaves de API (opcional para algumas fontes)
FRED_API_KEY=sua_chave_fred
ALPHA_VANTAGE_API_KEY=sua_chave_alpha_vantage
NEWS_API_KEY=sua_chave_news
```

### 2. Fontes de Dados Disponíveis

#### Banco Central do Brasil (Gratuito)

- **SGS**: Séries temporais (Selic, IPCA, CDI)
- **PTAX**: Cotações de moedas
- **Sistema de Informações de Crédito**: Dados de crédito

#### IBGE (Gratuito)

- **SIDRA**: IPCA, PIB, desemprego, inflação
- **API**: https://servicodados.ibge.gov.br/api/

#### ANBIMA (Gratuito com registro)

- **Debêntures**: Títulos corporativos
- **Curvas de Crédito**: Spreads por rating
- **API**: https://www.anbima.com.br/pt_br/informar/estatisticas/

#### Tesouro Direto (Gratuito)

- **Títulos Públicos**: Preços e taxas
- **API**: Endpoints não oficiais (usando scraping)

## Próximos Passos

### 1. Implementar SIDRA (IBGE)

```typescript
// src/app/api/proxy/sidra/route.ts
const SIDRA_BASE_URL = "https://servicodados.ibge.gov.br/api/v3/agregados";
```

### 2. Implementar ANBIMA

```typescript
// src/app/api/proxy/anbima/route.ts
const ANBIMA_BASE_URL = "https://www.anbima.com.br/data/files";
```

### 3. Adicionar Mais Séries SGS

- IGP-M (série 189)
- IPCA-15 (série 12)
- Taxa de câmbio (série 1)

### 4. Implementar Cache Inteligente

- Cache por tipo de dado
- Invalidação automática
- Fallback para dados mockados

## Benefícios dos Dados Reais

1. **Precisão**: Dados oficiais em tempo real
2. **Confiabilidade**: Fontes oficiais (BCB, IBGE, ANBIMA)
3. **Atualização**: Dados atualizados automaticamente
4. **Completude**: Mais séries e indicadores disponíveis

## Limitações Atuais

1. **Rate Limits**: Algumas APIs têm limites de requisições
2. **Disponibilidade**: APIs podem estar temporariamente indisponíveis
3. **Formato**: Diferentes estruturas de dados entre fontes
4. **Autenticação**: Algumas APIs requerem registro

## Monitoramento

- Logs de erro para APIs indisponíveis
- Fallback automático para dados mockados
- Métricas de performance das APIs
- Alertas para falhas consecutivas
