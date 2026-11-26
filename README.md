# Vida Autoral — Página de Captura Human Design

Página de captura de leads para envio de mapa de Human Design personalizado.

## Fluxo

```
Lead preenche form
       ↓
Vercel /api/submit  (em paralelo)
   ├── Resend → E-mail 1: confirmação imediata
   └── Make Webhook → gera PDF → Resend → E-mail 2: link do PDF
```

## Estrutura

```
├── api/
│   └── submit.js        # Serverless function (Vercel)
├── public/
│   └── index.html       # Página de captura
├── vercel.json          # Configuração de rotas Vercel
├── .env.example         # Modelo das variáveis de ambiente
└── SETUP.md             # Guia completo de configuração
```

## Deploy

Consulte o arquivo `SETUP.md` para o passo a passo completo de configuração da Vercel, Make e Resend.

### Variáveis de ambiente necessárias

| Variável | Descrição |
|----------|-----------|
| `RESEND_API_KEY` | Chave da API do Resend |
| `FROM_EMAIL` | E-mail remetente verificado no Resend |
| `FROM_NAME` | Nome do remetente |
| `REPLY_TO` | E-mail de resposta |
| `MAKE_WEBHOOK_URL` | URL do webhook gerado no Make |

## Stack

- **Frontend:** HTML/CSS/JS puro
- **Backend:** Vercel Serverless Functions
- **E-mail:** Resend
- **Automação:** Make (ex-Integromat)
- **Gráfico:** Bodygraph embed

## Proteção de credenciais

Depois de clonar o projeto, execute `npm run security:install-hook`. O hook verifica o conteúdo preparado para commit e bloqueia valores com formato de credenciais Bodygraph/Resend e arquivos de ambiente privados. `npm run check:security` e o build repetem a checagem sem consultar provedores. Pushes e pull requests executam a mesma verificação no GitHub. Marcadores dos exemplos nunca devem ser substituídos por credenciais reais.

Somente os arquivos estáticos explicitamente listados em `scripts/build-static.cjs` entram em `site-output`; código servidor, documentação e exemplos não são publicados como assets. Funções em `api/` e a fonte usada pelo PDF continuam disponíveis para o backend. A exclusão de um segredo do código não invalida cópias anteriores: credenciais expostas precisam ser rotacionadas no provedor.
