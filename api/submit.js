// Configuração do timeout da função Vercel (30 segundos para gerar o PDF)
export const maxDuration = 30;

/**
 * api/submit.js — Vercel Serverless Function
 *
 * Fluxo completo por lead:
 *  1. Resolve timezone a partir da cidade (Bodygraph Locations API)
 *  2. Gera dados HD + SVG do gráfico (Bodygraph HD Data API)
 *  3. Converte SVG → PNG → PDF (sharp + pdf-lib)
 *  4. Envia e-mail de confirmação imediata (Resend)
 *  5. Envia e-mail com PDF anexado (Resend)
 */

import sharp from 'sharp';
import { PDFDocument, rgb } from 'pdf-lib';

const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

// ── 1. Resolve timezone pelo nome da cidade ──────────────────────────────────
async function resolveTimezone(city) {
  const url = `${BODYGRAPH_BASE}/v210502/locations?api_key=${BODYGRAPH_API_KEY}&query=${encodeURIComponent(city)}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Locations API error: ${res.status}`);
  const data = await res.json();
  if (!data || data.length === 0) throw new Error(`Cidade não encontrada: ${city}`);
  return data[0].timezone;
}

// ── 2. Gera dados HD + SVG ───────────────────────────────────────────────────
async function generateHDChart(date, hora, timezone) {
  const datetime = `${date} ${hora}`;
  const url = `${BODYGRAPH_BASE}/v221006/hd-data?api_key=${BODYGRAPH_API_KEY}&date=${encodeURIComponent(datetime)}&timezone=${encodeURIComponent(timezone)}&design=default`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HD Data API error: ${res.status}`);
  return await res.json();
}

// ── 3. SVG → PDF ─────────────────────────────────────────────────────────────
async function svgToPdf(svgString, nome, hdData) {
  const props = hdData.Properties || {};

  // SVG → PNG via sharp
  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize({ width: 800 })
    .png()
    .toBuffer();

  // Cria PDF A4 paisagem
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([841.89, 595.28]);

  // Fundo escuro
  page.drawRectangle({
    x: 0, y: 0, width: 841.89, height: 595.28,
    color: rgb(0.102, 0.078, 0.063)
  });

  // Triângulo decorativo da marca
  page.drawLine({ start: { x: 400, y: 578 }, end: { x: 420, y: 558 }, thickness: 1, color: rgb(0.608, 0.490, 0.380) });
  page.drawLine({ start: { x: 420, y: 558 }, end: { x: 380, y: 558 }, thickness: 1, color: rgb(0.608, 0.490, 0.380) });
  page.drawLine({ start: { x: 380, y: 558 }, end: { x: 400, y: 578 }, thickness: 1, color: rgb(0.608, 0.490, 0.380) });

  // Gráfico (lado esquerdo)
  const pngImage = await pdfDoc.embedPng(pngBuffer);
  const imgDims  = pngImage.scaleToFit(460, 480);
  page.drawImage(pngImage, {
    x: 20,
    y: (595.28 - imgDims.height) / 2,
    width: imgDims.width,
    height: imgDims.height
  });

  // Painel de dados (lado direito)
  const panelX = 500;
  const cream  = rgb(0.914, 0.847, 0.753);
  const peach  = rgb(0.855, 0.639, 0.561);
  const coffee = rgb(0.608, 0.490, 0.380);

  page.drawText('MAPA DO DESENHO HUMANO', { x: panelX, y: 548, size: 10, color: coffee });
  page.drawText(nome.toUpperCase(), { x: panelX, y: 530, size: 15, color: cream });
  page.drawLine({ start: { x: panelX, y: 522 }, end: { x: 825, y: 522 }, thickness: 0.5, color: coffee });

  const rows = [
    ['Tipo Energético',  props?.Type?.id             || '—'],
    ['Estratégia',       props?.Strategy?.id         || '—'],
    ['Autoridade',       props?.InnerAuthority?.id   || '—'],
    ['Perfil',           props?.Profile?.id          || '—'],
    ['Definição',        props?.Definition?.id       || '—'],
    ['Assinatura',       props?.Signature?.id        || '—'],
    ['Tema Emocional',   props?.NotSelfTheme?.id     || '—'],
    ['Cruz Encarnação',  props?.IncarnationCross?.id || '—'],
  ];

  rows.forEach(([label, value], i) => {
    const y = 506 - i * 42;
    page.drawRectangle({
      x: panelX - 4, y: y - 8, width: 329, height: 36,
      color: rgb(0.173, 0.133, 0.110),
      borderColor: coffee, borderWidth: 0.3, borderOpacity: 0.4
    });
    page.drawText(label,        { x: panelX + 4, y: y + 14, size: 7,  color: peach });
    page.drawText(String(value),{ x: panelX + 4, y: y + 2,  size: 9,  color: cream });
  });

  page.drawText('© 2025 Vida Autoral · Todos os direitos reservados', {
    x: panelX, y: 16, size: 7, color: rgb(0.4, 0.35, 0.3)
  });

  return await pdfDoc.save();
}

// ── Templates de e-mail ───────────────────────────────────────────────────────
function buildConfirmationEmail({ nome, data, hora, local }) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#E9D7C0;font-family:Georgia,serif;}
  .wrap{max-width:580px;margin:0 auto;background:#fff;}
  .header{background:#1a1410;padding:2.5rem 2rem;text-align:center;}
  .header h1{color:#E9D7C0;font-size:1.3rem;font-weight:400;letter-spacing:.15em;margin:.8rem 0 0;}
  .body{padding:2.5rem 2rem;}
  p{color:#4a3a2e;font-size:.95rem;line-height:1.8;margin-bottom:1rem;}
  .info{background:#FED8A6;border-left:3px solid #9B7D61;padding:1rem 1.2rem;margin:1.5rem 0;}
  .info p{margin:0;font-size:.88rem;color:#5a3f28;line-height:1.8;}
  .badge{display:inline-block;background:#E9D7C0;border:1px solid rgba(155,125,97,.3);padding:.6rem 1.2rem;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:#9B7D61;margin:1.5rem 0;}
  .footer{background:#1a1410;padding:1.5rem 2rem;text-align:center;}
  .footer p{color:rgba(233,215,192,.35);font-size:.7rem;letter-spacing:.08em;margin:0;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <svg width="36" height="36" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#9B7D61" stroke-width="2" fill="none"/></svg>
    <h1>Vida Autoral</h1>
  </div>
  <div class="body">
    <p>Olá, <strong>${nome}</strong>,</p>
    <p>Recebemos seus dados! Seu mapa de Human Design está sendo gerado — em instantes você receberá o PDF completo.</p>
    <div class="info"><p><strong>Dados recebidos:</strong><br/>📅 ${data} &nbsp;·&nbsp; 🕐 ${hora}<br/>📍 ${local}</p></div>
    <div class="badge">✦ &nbsp; Seu PDF está a caminho</div>
    <p>Se não chegar em até 5 minutos, verifique o spam ou responda esta mensagem.</p>
    <p style="font-size:.85rem;color:#9b836f;">Com carinho,<br/><strong>Equipe Vida Autoral</strong></p>
  </div>
  <div class="footer"><p>© 2025 Vida Autoral · Todos os direitos reservados</p></div>
</div></body></html>`;
}

function buildPdfEmail({ nome, data, hora, local }) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#E9D7C0;font-family:Georgia,serif;}
  .wrap{max-width:580px;margin:0 auto;background:#fff;}
  .header{background:#1a1410;padding:2.5rem 2rem;text-align:center;}
  .header h1{color:#E9D7C0;font-size:1.3rem;font-weight:400;letter-spacing:.15em;margin:.8rem 0 0;}
  .body{padding:2.5rem 2rem;}
  p{color:#4a3a2e;font-size:.95rem;line-height:1.8;margin-bottom:1rem;}
  .info{background:#FED8A6;border-left:3px solid #9B7D61;padding:1rem 1.2rem;margin:1.5rem 0;}
  .info p{margin:0;font-size:.88rem;color:#5a3f28;line-height:1.8;}
  .footer{background:#1a1410;padding:1.5rem 2rem;text-align:center;}
  .footer p{color:rgba(233,215,192,.35);font-size:.7rem;letter-spacing:.08em;margin:0;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <svg width="36" height="36" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#9B7D61" stroke-width="2" fill="none"/></svg>
    <h1>Vida Autoral</h1>
  </div>
  <div class="body">
    <p>Olá, <strong>${nome}</strong>,</p>
    <p>Seu mapa de Human Design está pronto! O PDF completo está em anexo neste e-mail.</p>
    <div class="info"><p><strong>Seus dados:</strong><br/>📅 ${data} &nbsp;·&nbsp; 🕐 ${hora}<br/>📍 ${local}</p></div>
    <p>O gráfico revela seu Tipo Energético, Autoridade, Perfil, Centros e muito mais. Qualquer dúvida sobre interpretação, responda este e-mail.</p>
    <p style="font-size:.85rem;color:#9b836f;">Com carinho,<br/><strong>Equipe Vida Autoral</strong></p>
  </div>
  <div class="footer"><p>© 2025 Vida Autoral · Todos os direitos reservados</p></div>
</div></body></html>`;
}

// ── Envia via Resend ──────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html, attachments = [] }) {
  const body = { from: `${FROM_NAME} <${FROM_EMAIL}>`, to: [to], reply_to: REPLY_TO, subject, html };
  if (attachments.length) body.attachments = attachments;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(await res.json())}`);
  return res.json();
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { nome, email, data, hora, local } = req.body;
  if (!nome || !email || !data || !hora || !local) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Confirmação imediata (fire-and-forget)
    sendEmail({
      to: email,
      subject: `${nome}, recebemos seus dados ✦`,
      html: buildConfirmationEmail({ nome, data, hora, local })
    }).catch(e => console.error('[Confirmação error]', e));

    // Responde ao frontend imediatamente
    res.status(200).json({ ok: true });

    // Gera e envia o PDF em background
    try {
      const timezone  = await resolveTimezone(local);
      const hdData    = await generateHDChart(data, hora, timezone);
      const svgString = hdData.SVG;
      if (!svgString) throw new Error('SVG não retornado pela API');

      const pdfBytes  = await svgToPdf(svgString, nome, hdData);
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

      await sendEmail({
        to: email,
        subject: `${nome}, seu mapa de Human Design está pronto ✦`,
        html: buildPdfEmail({ nome, data, hora, local }),
        attachments: [{
          filename: `mapa-human-design-${nome.split(' ')[0].toLowerCase()}.pdf`,
          content: pdfBase64
        }]
      });

      console.log(`[PDF enviado com sucesso] ${email}`);
    } catch (bgErr) {
      console.error('[Erro geração PDF]', bgErr.message);
    }

  } catch (err) {
    console.error('[Handler error]', err);
    if (!res.headersSent) res.status(500).json({ error: 'Erro interno.' });
  }
}
