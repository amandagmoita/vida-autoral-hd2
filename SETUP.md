# 🚀 Guia de Configuração — Vida Autoral Human Design
## Fluxo completo: Form → Vercel API → Resend (confirmação) + Make (PDF)

---

## Estrutura do projeto

```
vida-autoral-hd/
├── api/
│   └── submit.js        ← Serverless function (Vercel)
├── public/
│   └── index.html       ← Página de captura
├── vercel.json          ← Configuração de rotas
└── .env.example         ← Modelo das variáveis de ambiente
```

---

## PASSO 1 — Publicar na Vercel

1. Acesse https://vercel.com e faça login (ou crie conta gratuita)
2. Clique em **"Add New Project"**
3. Faça upload da pasta `vida-autoral-hd/` ou conecte via GitHub
4. Na tela de configuração, clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `RESEND_API_KEY` | `re_ff9ov3tP_Jb33SMrc4o2L1zzXCdM3RzTn` |
| `FROM_EMAIL` | `mapa@vidaautoral.com.br` |
| `FROM_NAME` | `Vida Autoral` |
| `REPLY_TO` | `contato@vidaautoral.com.br` |
| `MAKE_WEBHOOK_URL` | *(preencher após o Passo 2)* |

5. Clique em **"Deploy"**
6. Anote a URL gerada (ex: `https://vida-autoral-hd.vercel.app`)

---

## PASSO 2 — Configurar o Make (ex-Integromat)

### 2.1 Criar conta
- Acesse https://make.com e crie uma conta gratuita
- O plano gratuito oferece 1.000 operações/mês — suficiente para começar

### 2.2 Criar o cenário

1. Clique em **"Create a new scenario"**
2. Clique no ícone **"+"** e busque por **"Webhooks"**
3. Selecione **"Custom webhook"** → clique em **"Add"**
4. Dê o nome `vida-autoral-hd` e clique em **"Save"**
5. Copie a URL gerada (ex: `https://hook.eu1.make.com/xxxxxxxx`)
   → **Cole essa URL na variável `MAKE_WEBHOOK_URL` na Vercel**

### 2.3 Conectar os módulos

O cenário no Make deve ter esta sequência:

```
[Webhook] → [Gerar PDF Bodygraph] → [Resend — enviar e-mail com PDF]
```

**Módulo 1: Webhook (já criado)**
- Clique em **"Run once"** e faça um envio de teste pelo formulário
- O Make vai detectar automaticamente os campos: `nome`, `email`, `data`, `hora`, `local`

**Módulo 2: Gerar o PDF**
- Aqui você conecta sua ferramenta de geração de PDF do Bodygraph
- Use os dados recebidos no webhook: `{{1.data}}`, `{{1.hora}}`, `{{1.local}}`
- O resultado deve ser uma URL pública do PDF gerado

**Módulo 3: Resend — enviar e-mail com o link do PDF**
- Clique em **"+"** → busque **"HTTP"** → **"Make a request"**
- Configure assim:

| Campo | Valor |
|-------|-------|
| URL | `https://api.resend.com/emails` |
| Method | `POST` |
| Headers | `Authorization: Bearer re_ff9ov3tP_Jb33SMrc4o2L1zzXCdM3RzTn` |
| Body type | `Raw` |
| Content type | `application/json` |

Body (cole e ajuste `{{URL_DO_PDF}}` para o output do módulo anterior):

```json
{
  "from": "Vida Autoral <mapa@vidaautoral.com.br>",
  "to": ["{{1.email}}"],
  "reply_to": "contato@vidaautoral.com.br",
  "subject": "{{1.nome}}, seu mapa de Human Design está pronto ✦",
  "html": "<html><body style='margin:0;background:#E9D7C0;font-family:Georgia,serif'><div style='max-width:580px;margin:0 auto;background:#fff'><div style='background:#1a1410;padding:2.5rem 2rem;text-align:center'><svg width='36' height='36' viewBox='0 0 70 70' fill='none'><polygon points='35,62 4,8 66,8' stroke='#9B7D61' stroke-width='2' fill='none'/></svg><h1 style='color:#E9D7C0;font-size:1.3rem;font-weight:400;letter-spacing:.15em;margin:.8rem 0 0'>Vida Autoral</h1></div><div style='padding:2.5rem 2rem'><p style='color:#4a3a2e;font-size:.95rem;line-height:1.8'>Olá, <strong>{{1.nome}}</strong>,</p><p style='color:#4a3a2e;font-size:.95rem;line-height:1.8'>Seu mapa de Human Design está pronto! Clique no botão abaixo para acessar seu gráfico completo em PDF.</p><div style='text-align:center;margin:2rem 0'><a href='{{URL_DO_PDF}}' style='display:inline-block;background:#9B7D61;color:#fff;text-decoration:none;padding:.9rem 2.2rem;font-size:.82rem;letter-spacing:.18em;text-transform:uppercase'>Acessar meu mapa →</a></div><div style='background:#FED8A6;border-left:3px solid #9B7D61;padding:1rem 1.2rem;margin:1.5rem 0'><p style='margin:0;font-size:.88rem;color:#5a3f28;line-height:1.8'><strong>Seus dados:</strong><br/>📅 {{1.data}} · 🕐 {{1.hora}}<br/>📍 {{1.local}}</p></div><p style='font-size:.85rem;color:#9b836f;margin-top:2rem'>Se tiver dúvidas sobre como interpretar seu gráfico, responda este e-mail.<br/><strong>Equipe Vida Autoral</strong></p></div><div style='background:#1a1410;padding:1.5rem 2rem;text-align:center'><p style='color:rgba(233,215,192,.35);font-size:.7rem;letter-spacing:.08em;margin:0'>© 2025 Vida Autoral · Todos os direitos reservados</p></div></div></body></html>"
}
```

### 2.4 Ativar o cenário
- Clique no toggle **"Scheduling"** no canto inferior esquerdo
- Selecione **"Immediately as data arrives"**
- Clique em **"Save"**

---

## PASSO 3 — Verificar domínio no Resend

Para enviar e-mails pelo `mapa@vidaautoral.com.br`:

1. Acesse https://resend.com/domains
2. Clique em **"Add Domain"** → digite `vidaautoral.com.br`
3. Adicione os registros DNS indicados no painel do Resend (geralmente 2–3 registros TXT/MX)
4. Aguarde a verificação (pode levar até 24h, mas costuma ser minutos)

---

## PASSO 4 — Teste final

1. Acesse sua URL da Vercel
2. Preencha o formulário com um e-mail real
3. Verifique:
   - ✅ E-mail 1 chega em segundos (confirmação — enviado pelo Resend via Vercel)
   - ✅ E-mail 2 chega logo após (PDF — enviado pelo Make via Resend)
   - ✅ Logs na Vercel: `vercel.com/[seu-projeto]/functions` → sem erros
   - ✅ Histórico no Make: clique em **"History"** no cenário → execução com status "Success"

---

## Fluxo resumido

```
Lead preenche form
       ↓
Vercel /api/submit  (em paralelo)
   ├── Resend → E-mail 1: "Recebemos seus dados" (instantâneo)
   └── Make Webhook → Gera PDF → Resend → E-mail 2: link do PDF (segundos depois)
```

---

## Suporte

Qualquer dúvida na configuração, entre em contato com a equipe técnica. 🤍
