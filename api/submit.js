/**
 * api/submit.js — Vercel Serverless Function
 * SVG→PNG via @resvg/resvg-js (WebAssembly, funciona na Vercel)
 * PNG embutido no PDF via pdf-lib
 */

import { Resvg } from '@resvg/resvg-js';
import { PDFDocument, rgb } from 'pdf-lib';

export const maxDuration = 30;

const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

// ── 1. Timezone ───────────────────────────────────────────────────────────────
async function resolveTimezone(city) {
  const url = `${BODYGRAPH_BASE}/v210502/locations?api_key=${BODYGRAPH_API_KEY}&query=${encodeURIComponent(city)}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Locations API error: ${res.status}`);
  const data = await res.json();
  if (!data || data.length === 0) throw new Error(`Cidade não encontrada: ${city}`);
  return data[0].timezone;
}

// ── 2. Dados HD + SVG ─────────────────────────────────────────────────────────
async function generateHDChart(date, hora, timezone) {
  const datetime = `${date} ${hora}`;
  const url = `${BODYGRAPH_BASE}/v221006/hd-data?api_key=${BODYGRAPH_API_KEY}&date=${encodeURIComponent(datetime)}&timezone=${encodeURIComponent(timezone)}&design=default`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HD Data API error: ${res.status}`);
  return await res.json();
}

// ── 3. SVG → PNG via resvg-js (WebAssembly, sem binários nativos) ─────────────
function svgToPng(svgString) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: 700 },
    background: 'rgba(0,0,0,0)'
  });
  return resvg.render().asPng(); // Buffer
}

// ── 4. Monta PDF: gráfico à esquerda + painel de dados à direita ─────────────
async function buildPdf(nome, hdData) {
  const props = hdData.Properties || {};
  const svgString = hdData.SVG;

  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([841.89, 595.28]); // A4 paisagem
  const { width, height } = page.getSize();

  const cream  = rgb(0.914, 0.847, 0.753);
  const peach  = rgb(0.855, 0.639, 0.561);
  const coffee = rgb(0.608, 0.490, 0.380);
  const dark   = rgb(0.102, 0.078, 0.063);
  const mid    = rgb(0.155, 0.118, 0.094);

  // Fundo
  page.drawRectangle({ x: 0, y: 0, width, height, color: dark });

  // ── Gráfico (lado esquerdo) ──
  if (svgString) {
    try {
      const pngBuf  = svgToPng(svgString);
      const pngImg  = await pdfDoc.embedPng(pngBuf);
      const dims    = pngImg.scaleToFit(460, height - 40);
      page.drawImage(pngImg, {
        x: 20,
        y: (height - dims.height) / 2,
        width:  dims.width,
        height: dims.height,
      });
    } catch (e) {
      console.error('[PDF] Erro ao embedar gráfico:', e.message);
    }
  }

  // Divisória vertical
  page.drawLine({
    start: { x: 490, y: 30 }, end: { x: 490, y: height - 30 },
    thickness: 0.4, color: coffee
  });

  // ── Painel direito ──
  const px = 505;

  // Logo / triângulo
  page.drawLine({ start: { x: 668, y: height - 18 }, end: { x: 682, y: height - 36 }, thickness: 1, color: coffee });
  page.drawLine({ start: { x: 682, y: height - 36 }, end: { x: 654, y: height - 36 }, thickness: 1, color: coffee });
  page.drawLine({ start: { x: 654, y: height - 36 }, end: { x: 668, y: height - 18 }, thickness: 1, color: coffee });

  page.drawText('VIDA AUTORAL',              { x: 530, y: height - 24, size: 9,  color: coffee });
  page.drawText('MAPA DO DESENHO HUMANO',   { x: 510, y: height - 38, size: 7,  color: rgb(0.6, 0.55, 0.5) });
  page.drawLine({ start: { x: px, y: height - 46 }, end: { x: 825, y: height - 46 }, thickness: 0.4, color: coffee });

  // Nome
  page.drawText(nome.toUpperCase(), { x: px, y: height - 62, size: 14, color: cream });
  page.drawLine({ start: { x: px, y: height - 72 }, end: { x: 825, y: height - 72 }, thickness: 0.3, color: mid });

  // Dados HD
  const rows = [
    ['Tipo Energético',    props?.Type?.id             || '—'],
    ['Estratégia',         props?.Strategy?.id         || '—'],
    ['Autoridade Interna', props?.InnerAuthority?.id   || '—'],
    ['Perfil',             props?.Profile?.id          || '—'],
    ['Definição',          props?.Definition?.id       || '—'],
    ['Assinatura',         props?.Signature?.id        || '—'],
    ['Tema Não-Self',      props?.NotSelfTheme?.id     || '—'],
    ['Cruz de Encarnação', props?.IncarnationCross?.id || '—'],
  ];

  rows.forEach(([label, value], i) => {
    const y = height - 96 - i * 56;
    page.drawRectangle({ x: px - 2, y: y - 10, width: 320, height: 48, color: rgb(0.14, 0.10, 0.08) });
    page.drawLine({ start: { x: px, y: y + 30 }, end: { x: px + 314, y: y + 30 }, thickness: 0.3, color: coffee });
    page.drawText(label.toUpperCase(), { x: px + 4, y: y + 18, size: 6.5, color: peach });
    const val = String(value);
    if (val.length > 34) {
      page.drawText(val.slice(0, 34), { x: px + 4, y: y + 6,  size: 8, color: cream });
      page.drawText(val.slice(34),    { x: px + 4, y: y - 4,  size: 8, color: cream });
    } else {
      page.drawText(val, { x: px + 4, y: y + 4, size: 9, color: cream });
    }
  });

  // Rodapé
  page.drawRectangle({ x: 0, y: 0, width, height: 22, color: mid });
  page.drawText('© 2025 Vida Autoral · Todos os direitos reservados', { x: 285, y: 7, size: 6.5, color: rgb(0.4, 0.35, 0.3) });

  return await pdfDoc.save();
}

// ── E-mails ───────────────────────────────────────────────────────────────────
function buildConfirmationEmail({ nome, data, hora, local }) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<style>body{margin:0;padding:0;background:#E9D7C0;font-family:Georgia,serif;}.wrap{max-width:580px;margin:0 auto;background:#fff;}.header{background:#1a1410;padding:2.5rem 2rem;text-align:center;}.header h1{color:#E9D7C0;font-size:1.3rem;font-weight:400;letter-spacing:.15em;margin:.8rem 0 0;}.body{padding:2.5rem 2rem;}p{color:#4a3a2e;font-size:.95rem;line-height:1.8;margin-bottom:1rem;}.info{background:#FED8A6;border-left:3px solid #9B7D61;padding:1rem 1.2rem;margin:1.5rem 0;}.info p{margin:0;font-size:.88rem;color:#5a3f28;line-height:1.8;}.badge{display:inline-block;background:#E9D7C0;border:1px solid rgba(155,125,97,.3);padding:.6rem 1.2rem;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:#9B7D61;margin:1.5rem 0;}.footer{background:#1a1410;padding:1.5rem 2rem;text-align:center;}.footer p{color:rgba(233,215,192,.35);font-size:.7rem;margin:0;}</style>
</head><body><div class="wrap">
  <div class="header"><svg width="36" height="36" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#9B7D61" stroke-width="2" fill="none"/></svg><h1>Vida Autoral</h1></div>
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
<style>body{margin:0;padding:0;background:#E9D7C0;font-family:Georgia,serif;}.wrap{max-width:580px;margin:0 auto;background:#fff;}.header{background:#1a1410;padding:2.5rem 2rem;text-align:center;}.header h1{color:#E9D7C0;font-size:1.3rem;font-weight:400;letter-spacing:.15em;margin:.8rem 0 0;}.body{padding:2.5rem 2rem;}p{color:#4a3a2e;font-size:.95rem;line-height:1.8;margin-bottom:1rem;}.info{background:#FED8A6;border-left:3px solid #9B7D61;padding:1rem 1.2rem;margin:1.5rem 0;}.info p{margin:0;font-size:.88rem;color:#5a3f28;line-height:1.8;}.footer{background:#1a1410;padding:1.5rem 2rem;text-align:center;}.footer p{color:rgba(233,215,192,.35);font-size:.7rem;margin:0;}</style>
</head><body><div class="wrap">
  <div class="header"><svg width="36" height="36" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#9B7D61" stroke-width="2" fill="none"/></svg><h1>Vida Autoral</h1></div>
  <div class="body">
    <p>Olá, <strong>${nome}</strong>,</p>
    <p>Seu mapa de Human Design está pronto! O PDF completo está em anexo neste e-mail.</p>
    <div class="info"><p><strong>Seus dados:</strong><br/>📅 ${data} &nbsp;·&nbsp; 🕐 ${hora}<br/>📍 ${local}</p></div>
    <p>O PDF contém o gráfico personalizado com seu Tipo Energético, Autoridade, Perfil, Centros e Canais. Qualquer dúvida, responda este e-mail.</p>
    <p style="font-size:.85rem;color:#9b836f;">Com carinho,<br/><strong>Equipe Vida Autoral</strong></p>
  </div>
  <div class="footer"><p>© 2025 Vida Autoral · Todos os direitos reservados</p></div>
</div></body></html>`;
}

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

  const { nome, email, data, hora, local } = req.body;
  if (!nome || !email || !data || !hora || !local) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    console.log(`[1] Iniciando para ${email}`);

    await sendEmail({
      to: email,
      subject: `${nome}, recebemos seus dados ✦`,
      html: buildConfirmationEmail({ nome, data, hora, local })
    });
    console.log(`[2] Confirmação enviada`);

    const timezone = await resolveTimezone(local);
    console.log(`[3] Timezone: ${timezone}`);

    const hdData = await generateHDChart(data, hora, timezone);
    console.log(`[4] Dados HD — Tipo: ${hdData?.Properties?.Type?.id} | SVG: ${hdData?.SVG ? hdData.SVG.length + ' chars' : 'ausente'}`);

    const pdfBytes  = await buildPdf(nome, hdData);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    console.log(`[5] PDF gerado (${pdfBytes.length} bytes)`);

    await sendEmail({
      to: email,
      subject: `${nome}, seu mapa de Human Design está pronto ✦`,
      html: buildPdfEmail({ nome, data, hora, local }),
      attachments: [{
        filename: `mapa-human-design-${nome.split(' ')[0].toLowerCase()}.pdf`,
        content: pdfBase64
      }]
    });
    console.log(`[6] PDF enviado com sucesso`);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[Erro]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
