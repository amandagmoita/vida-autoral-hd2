# Vida Autoral · Human Design — Setup Completo

## Visão geral do fluxo

```
Lead preenche form
       ↓
Vercel /api/submit
  ├── 1. E-mail de confirmação imediata (Resend)
  ├── 2. Resolve timezone da cidade (Bodygraph API)
  ├── 3. Gera dados HD + SVG do gráfico (Bodygraph API)
  ├── 4. Converte SVG → PDF (sharp + pdf-lib, dentro da Vercel)
  └── 5. E-mail com PDF anexado (Resend)
```

**Nenhum Make, Zapier ou ferramenta extra necessária.**

---

## Pré-requisitos

- Conta [Vercel](https://vercel.com) (plano gratuito funciona)
- Conta [Resend](https://resend.com) (plano gratuito = 3.000 e-mails/mês)
- API Key do Bodygraph obtida no painel da conta, guardada somente como segredo de ambiente
- Domínio verificado no Resend (`vidaautoral.com.br`)

---

## Passo a passo

### 1. Gere uma nova chave no Resend

Use uma chave exclusiva desta aplicação, apenas com permissão de envio e domínio restrito. Configure o valor somente nas variáveis de ambiente da Vercel, como **Secret**. Nunca copie o valor para este repositório, exemplos, logs ou mensagens. Uma chave comprometida deve ser revogada no provedor.

### 2. Suba o projeto na Vercel

```bash
# Instale a CLI da Vercel (se não tiver)
npm i -g vercel

# Na pasta do projeto:
vercel deploy
```

### 3. Configure as variáveis de ambiente na Vercel

No painel da Vercel → Settings → Environment Variables:

| Nome | Valor |
|------|-------|
| `RESEND_API_KEY` | sua nova chave do Resend |
| `FROM_EMAIL` | `mapa@vidaautoral.com.br` |
| `FROM_NAME` | `Vida Autoral` |
| `REPLY_TO` | `contato@vidaautoral.com.br` |
| `BODYGRAPH_API_KEY` | `CONFIGURE_NO_SERVIDOR` |

Após salvar, faça um novo deploy:
```bash
vercel --prod
```

### 4. Verifique o domínio no Resend

No Resend → Domains → confirme que `vidaautoral.com.br` está com status **Verified**.  
Se não estiver, siga as instruções de DNS que o Resend mostra.

---

## Estrutura de arquivos

```
vida-autoral-hd-final/
├── public/
│   └── index.html          ← página de captura
├── api/
│   └── submit.js           ← serverless function (toda a lógica)
├── vercel.json             ← rotas + timeout 30s
├── package.json
├── .env.example
└── SETUP.md
```

---

## Testando localmente

```bash
npm install
vercel dev
```

Acesse `http://localhost:3000` e preencha o form.

---

## Notas importantes

- O timeout da função está configurado para **30 segundos** (o suficiente para gerar o PDF)
- O e-mail de confirmação é enviado antes de gerar o PDF — o lead recebe feedback imediato
- O PDF é gerado e enviado em background sem bloquear a resposta do formulário
- A API do Bodygraph usa o parâmetro `design=default` para retornar o SVG do gráfico

## Segurança e rotação de credenciais

- Exemplos contêm apenas marcadores. Nenhuma credencial real deve entrar no Git.
- Use valores distintos em produção e ambientes de teste quando o provedor permitir.
- Antes de rotacionar o Bodygraph, inventarie todos os projetos que usam a chave.
- A pessoa responsável pela conta deve substituir/revogar a chave exposta no painel do Bodygraph. Se o painel não oferecer essa opção, solicitar a rotação ao suporte oficial.
- Salve a substituta diretamente na Vercel, como Secret, e faça novos deploys dos projetos dependentes. Não cole a chave em PRs, documentação ou relatórios.
- A remoção deste arquivo não revoga a chave nem apaga versões antigas do Git ou deploys. A rotação é obrigatória para invalidar cópias anteriores.
- `npm run check:security` confere os arquivos antes da publicação; `npm run build` publica somente os arquivos estáticos permitidos. A checagem também roda em push e pull request, sem agenda e sem chamadas ao Bodygraph ou Resend.
