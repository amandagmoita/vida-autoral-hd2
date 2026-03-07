/**
 * api/submit.js — Vercel Serverless Function
 * Sem sharp — PDF gerado com pdf-lib puro (só texto e formas)
 */

import { PDFDocument, rgb } from 'pdf-lib';

export const maxDuration = 30;

const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

// ── 1. Resolve timezone ───────────────────────────────────────────────────────
async function resolveTimezone(city) {
  const url = `${BODYGRAPH_BASE}/v210502/locations?api_key=${BODYGRAPH_API_KEY}&query=${encodeURIComponent(city)}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Locations API error: ${res.status}`);
  const data = await res.json();
  if (!data || data.length === 0) throw new Error(`Cidade não encontrada: ${city}`);
  return data[0].timezone;
}

// ── 2. Gera dados HD ──────────────────────────────────────────────────────────
async function generateHDChart(date, hora, timezone) {
  const datetime = `${date} ${hora}`;
  // sem &design= pois não usamos mais o SVG
  const url = `${BODYGRAPH_BASE}/v221006/hd-data?api_key=${BODYGRAPH_API_KEY}&date=${encodeURIComponent(datetime)}&timezone=${encodeURIComponent(timezone)}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HD Data API error: ${res.status}`);
  return await res.json();
}

// ── 3. Gera PDF com pdf-lib (sem imagens, só texto e formas) ─────────────────
async function buildPdf(nome, hdData) {
  const props = hdData.Properties || {};

  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595.28, 841.89]); // A4 retrato
  const { width, height } = page.getSize();

  const cream  = rgb(0.914, 0.847, 0.753);  // #E9D7C0
  const peach  = rgb(0.855, 0.639, 0.561);  // #DAA38F
  const coffee = rgb(0.608, 0.490, 0.380);  // #9B7D61
  const dark   = rgb(0.102, 0.078, 0.063);  // #1a1410
  const mid    = rgb(0.16,  0.12,  0.10);

  // Fundo escuro
  page.drawRectangle({ x: 0, y: 0, width, height, color: dark });

  // Faixa de topo
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: mid });

  // Triângulo decorativo
  page.drawLine({ start: { x: 297, y: height - 15 }, end: { x: 317, y: height - 38 }, thickness: 1.2, color: coffee });
  page.drawLine({ start: { x: 317, y: height - 38 }, end: { x: 277, y: height - 38 }, thickness: 1.2, color: coffee });
  page.drawLine({ start: { x: 277, y: height - 38 }, end: { x: 297, y: height - 15 }, thickness: 1.2, color: coffee });

  // Nome da marca
  page.drawText('VIDA AUTORAL', { x: 218, y: height - 60, size: 13, color: coffee });
  page.drawText('MAPA DO DESENHO HUMANO', { x: 172, y: height - 78, size: 9,  color: cream });

  // Nome do lead
  const nomeX = Math.max(50, (width - nome.length * 8.5) / 2);
  page.drawText(nome.toUpperCase(), { x: nomeX, y: height - 115, size: 17, color: cream });
  page.drawLine({ start: { x: 50, y: height - 128 }, end: { x: width - 50, y: height - 128 }, thickness: 0.5, color: coffee });

  // Dados em grade 2x4
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
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = col === 0 ? 50  : 315;
    const y   = height - 195 - row * 90;

    page.drawRectangle({ x: x - 2, y: y - 10, width: 245, height: 62, color: rgb(0.14, 0.10, 0.08) });
    page.drawLine({ start: { x, y: y + 44 }, end: { x: x + 240, y: y + 44 }, thickness: 0.3, color: coffee });
    page.drawText(label.toUpperCase(), { x, y: y + 30, size: 7,  color: peach });

    // Quebra valor longo em duas linhas se necessário
    const val = String(value);
    if (val.length > 30) {
      const mid = val.indexOf(' ', 20);
      if (mid > 0) {
        page.drawText(val.slice(0, mid),  { x, y: y + 16, size: 9, color: cream });
        page.drawText(val.slice(mid + 1), { x, y: y + 4,  size: 9, color: cream });
      } else {
        page.drawText(val, { x, y: y + 10, size: 8, color: cream });
      }
    } else {
      page.drawText(val, { x, y: y + 10, size: 10, color: cream });
    }
  });

  // Seção: centros e canais
  const secY = height - 580;
  page.drawLine({ start: { x: 50, y: secY + 16 }, end: { x: width - 50, y: secY + 16 }, thickness: 0.3, color: coffee });

  const defined  = (hdData.DefinedCenters || []).map(c => c.replace(' center','').replace(/^\w/, s => s.toUpperCase())).join(', ') || '—';
  const openCtrs = (hdData.OpenCenters    || []).map(c => c.replace(' center','').replace(/^\w/, s => s.toUpperCase())).join(', ') || '—';
  const channels = (hdData.Channels       || []).join(' · ') || '—';

  page.drawText('CENTROS DEFINIDOS', { x: 50, y: secY,      size: 7, color: peach });
  page.drawText(defined,             { x: 50, y: secY - 14, size: 9, color: cream });
  page.drawText('CENTROS ABERTOS',   { x: 50, y: secY - 36, size: 7, color: peach });
  page.drawText(openCtrs,            { x: 50, y: secY - 50, size: 9, color: cream });
  page.drawText('CANAIS ATIVOS',     { x: 50, y: secY - 72, size: 7, color: peach });
  page.drawText(channels,            { x: 50, y: secY - 86, size: 9, color: cream });

  // Rodapé
  page.drawRectangle({ x: 0, y: 0, width, height: 45, color: mid });
  page.drawText('© 2025 Vida Autoral · Todos os direitos reservados', { x: 148, y: 16, size: 7, color: rgb(0.4, 0.35, 0.3) });

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
    <p>O PDF contém seu Tipo Energético, Autoridade, Perfil, Centros, Canais e Cruz de Encarnação. Qualquer dúvida, responda este e-mail.</p>
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
    console.log(`[4] Dados HD recebidos — Tipo: ${hdData?.Properties?.Type?.id}`);

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
