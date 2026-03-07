/**
 * api/submit.js
 * Vercel Serverless Function
 *
 * Recebe os dados do formulário, dispara em paralelo:
 *   1. E-mail de confirmação imediata via Resend
 *   2. Webhook para o Make (que gera o PDF e envia o e-mail final com o link)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL     = process.env.FROM_EMAIL;       // mapa@vidaautoral.com.br
const FROM_NAME      = process.env.FROM_NAME;        // Vida Autoral
const REPLY_TO       = process.env.REPLY_TO;         // contato@vidaautoral.com.br
const MAKE_WEBHOOK   = process.env.MAKE_WEBHOOK_URL; // https://hook.make.com/xxxxx

// ── Template do e-mail de confirmação (enviado instantaneamente) ──────────────
function buildConfirmationEmail({ nome, data, hora, local }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;}
  body{margin:0;padding:0;background:#E9D7C0;font-family:Georgia,serif;}
  .wrap{max-width:580px;margin:0 auto;background:#fff;}
  .header{background:#1a1410;padding:2.5rem 2rem;text-align:center;}
  .header h1{color:#E9D7C0;font-size:1.3rem;font-weight:400;letter-spacing:0.15em;margin:0.8rem 0 0;}
  .body{padding:2.5rem 2rem;}
  .body p{color:#4a3a2e;font-size:0.95rem;line-height:1.8;margin-bottom:1rem;}
  .info{background:#FED8A6;border-left:3px solid #9B7D61;padding:1rem 1.2rem;margin:1.5rem 0;}
  .info p{margin:0;font-size:0.88rem;color:#5a3f28;line-height:1.8;}
  .info strong{color:#7a5535;}
  .badge{display:inline-block;background:#E9D7C0;border:1px solid rgba(155,125,97,0.3);
         padding:0.6rem 1.2rem;font-size:0.75rem;letter-spacing:0.2em;
         text-transform:uppercase;color:#9B7D61;margin:1.5rem 0;}
  .footer{background:#1a1410;padding:1.5rem 2rem;text-align:center;}
  .footer p{color:rgba(233,215,192,0.35);font-size:0.7rem;letter-spacing:0.08em;margin:0;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <svg width="36" height="36" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="35,62 4,8 66,8" stroke="#9B7D61" stroke-width="2" fill="none"/>
    </svg>
    <h1>Vida Autoral</h1>
  </div>
  <div class="body">
    <p>Olá, <strong>${nome}</strong>,</p>
    <p>Recebemos seus dados com sucesso. Seu mapa de Human Design está sendo gerado agora — em instantes você receberá um novo e-mail com o link para o seu gráfico em PDF.</p>
    <div class="info">
      <p><strong>Dados recebidos:</strong><br/>
      📅 Data: ${data}<br/>
      🕐 Horário: ${hora}<br/>
      📍 Local: ${local}</p>
    </div>
    <div class="badge">✦ &nbsp; Seu PDF está a caminho</div>
    <p>Se o e-mail com o PDF não chegar em até 5 minutos, verifique sua caixa de spam ou responda esta mensagem — vamos resolver!</p>
    <p style="font-size:0.85rem;color:#9b836f;margin-top:2rem;">
      Com carinho,<br/><strong>Equipe Vida Autoral</strong>
    </p>
  </div>
  <div class="footer">
    <p>© 2025 Vida Autoral · Todos os direitos reservados</p>
  </div>
</div>
</body>
</html>`;
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — ajuste o domínio conforme necessário
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { nome, email, data, hora, local } = req.body;

  // Validação básica
  if (!nome || !email || !data || !hora || !local) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Dispara Resend + Make em paralelo para máxima velocidade
    const [resendResult, makeResult] = await Promise.allSettled([

      // 1️⃣  E-mail de confirmação imediata (Resend)
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [email],
          reply_to: REPLY_TO,
          subject: `${nome}, recebemos seus dados ✦`,
          html: buildConfirmationEmail({ nome, data, hora, local })
        })
      }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e))),

      // 2️⃣  Webhook Make — envia todos os dados para geração do PDF
      fetch(MAKE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, data, hora, local })
      }).then(r => r.ok ? { ok: true } : Promise.reject({ status: r.status }))

    ]);

    // Log de erros sem quebrar o fluxo para o usuário
    if (resendResult.status === 'rejected') {
      console.error('[Resend error]', resendResult.reason);
    }
    if (makeResult.status === 'rejected') {
      console.error('[Make webhook error]', makeResult.reason);
    }

    // Responde sucesso se pelo menos o Resend funcionou
    if (resendResult.status === 'fulfilled') {
      return res.status(200).json({ ok: true });
    }

    // Se ambos falharam, retorna erro
    return res.status(500).json({ error: 'Falha ao processar. Tente novamente.' });

  } catch (err) {
    console.error('[Handler error]', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
