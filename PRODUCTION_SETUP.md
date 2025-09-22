# 🚀 Configuração para Produção - AdvisorSol

Este guia detalha como configurar a aplicação AdvisorSol para produção com dados reais e todas as funcionalidades ativas.

## 📋 **Pré-requisitos**

- Node.js 18+
- npm ou yarn
- Contas nas APIs externas (opcional, mas recomendado)

## 🔧 **Configuração de Ambiente**

### 1. **Variáveis de Ambiente**

Copie o arquivo `env.example` para `.env.local` e configure as variáveis:

```bash
cp env.example .env.local
```

### 2. **Configurações Obrigatórias**

```env
# Desabilitar mocks para usar APIs reais
NEXT_PUBLIC_USE_MOCKS=false

# Ambiente de produção
NODE_ENV=production
```

### 3. **APIs Externas (Recomendado)**

#### **FRED API (Federal Reserve)**

- **O que faz**: Dados de Treasuries, VIX, indicadores macro
- **Como obter**: https://fred.stlouisfed.org/docs/api/api_key.html
- **Configuração**:

```env
FRED_API_KEY=seu_token_fred_aqui
```

#### **Alpha Vantage**

- **O que faz**: Dados de ações, indicadores técnicos
- **Como obter**: https://www.alphavantage.co/support/#api-key
- **Configuração**:

```env
ALPHA_VANTAGE_API_KEY=seu_token_alpha_aqui
```

#### **News API**

- **O que faz**: Notícias financeiras
- **Como obter**: https://newsapi.org/register
- **Configuração**:

```env
NEWS_API_KEY=seu_token_news_aqui
```

## 🏗️ **Build e Deploy**

### 1. **Instalação de Dependências**

```bash
npm install
```

### 2. **Build de Produção**

```bash
npm run build
```

### 3. **Iniciar Servidor**

```bash
npm start
```

## 🔒 **Configurações de Segurança**

### 1. **Rate Limiting**

A aplicação inclui rate limiting automático:

- **API Geral**: 100 requests/minuto
- **Autenticação**: 5 tentativas/15 minutos
- **Proxy APIs**: 30 requests/minuto

### 2. **Validação de Dados**

Todos os inputs são validados e sanitizados automaticamente.

### 3. **CORS**

Configure origens permitidas:

```env
CORS_ORIGINS=https://seudominio.com,https://www.seudominio.com
```

## 📊 **APIs Disponíveis**

### **Dados Brasileiros**

- **SGS/BCB**: Selic, IPCA, CDI (automático)
- **PTAX**: Câmbio USD/BRL (automático)
- **ANBIMA**: Debêntures (mock - sem API pública)
- **SIDRA**: IPCA subitens (mock - sem API pública)

### **Dados Americanos**

- **FRED**: Treasuries, VIX, indicadores macro
- **Alpha Vantage**: Ações, indicadores técnicos
- **News API**: Notícias financeiras

## 🎯 **Funcionalidades por Configuração**

### **Com Mocks (Desenvolvimento)**

- ✅ Todas as funcionalidades
- ✅ Dados simulados realistas
- ✅ Navegação fluida
- ❌ Dados não são reais

### **Com APIs Reais (Produção)**

- ✅ Dados reais em tempo real
- ✅ Notícias atualizadas
- ✅ Indicadores técnicos precisos
- ⚠️ Limites de API podem aplicar
- ⚠️ Dependência de conectividade

## 🔍 **Monitoramento**

### 1. **Logs de Erro**

Configure Sentry para monitoramento:

```env
SENTRY_DSN=seu_sentry_dsn_aqui
```

### 2. **Analytics**

Configure Google Analytics:

```env
NEXT_PUBLIC_GA_ID=seu_ga_id_aqui
```

## 🚨 **Troubleshooting**

### **Problema**: APIs não funcionam

**Solução**: Verifique se `NEXT_PUBLIC_USE_MOCKS=false` e as chaves de API estão corretas.

### **Problema**: Rate limit exceeded

**Solução**: Aguarde o reset do rate limit ou configure limites maiores.

### **Problema**: Dados não atualizam

**Solução**: Verifique conectividade e status das APIs externas.

## 📈 **Performance**

### **Cache**

- **APIs**: Cache de 5 minutos
- **Dados estáticos**: Cache longo
- **SSR**: Otimizado para produção

### **Otimizações**

- Lazy loading de componentes
- Prefetch de rotas críticas
- Compressão de assets
- CDN para assets estáticos

## 🔄 **Atualizações**

### **Dados em Tempo Real**

- **SSE**: Server-Sent Events para updates
- **Intervalo**: 30 segundos para preços
- **Fallback**: Dados em cache se offline

### **Manutenção**

- **Logs**: Rotação automática
- **Cache**: Limpeza automática
- **APIs**: Retry automático em falhas

## 📞 **Suporte**

Para problemas específicos:

1. Verifique os logs da aplicação
2. Confirme configurações de ambiente
3. Teste APIs externas individualmente
4. Consulte documentação das APIs

---

**Nota**: Em produção, sempre use HTTPS e configure adequadamente as variáveis de ambiente para segurança.
