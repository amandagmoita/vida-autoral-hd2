import { Resvg } from '@resvg/resvg-js';
import { PDFDocument, rgb } from 'pdf-lib';

export const maxDuration = 30;

const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

async function resolveTimezone(city) {
  const url = `${BODYGRAPH_BASE}/v210502/locations?api_key=${BODYGRAPH_API_KEY}&query=${encodeURIComponent(city)}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Locations API error: ${res.status}`);
  const data = await res.json();
  if (!data || data.length === 0) throw new Error(`Cidade não encontrada: ${city}`);
  return data[0].timezone;
}

async function generateHDChart(date, hora, timezone) {
  const datetime = `${date} ${hora}`;
  const url = `${BODYGRAPH_BASE}/v221006/hd-data?api_key=${BODYGRAPH_API_KEY}&date=${encodeURIComponent(datetime)}&timezone=${encodeURIComponent(timezone)}&design=Leo`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HD Data API error: ${res.status}`);
  return await res.json();
}

function svgToPng(svgString) {
  let svg = svgString;

  // Garante xmlns — obrigatório para o resvg processar
  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Remove hrefs externos que resvg não consegue resolver em serverless
  svg = svg.replace(/xlink:href="https?:\/\/[^"]*"/g, 'xlink:href=""');
  svg = svg.replace(/ href="https?:\/\/[^"]*"/g, '');

  // Substitui elementos <image> com src/href externo por elemento vazio
  svg = svg.replace(/<image[^>]*(https?:\/\/)[^>]*\/>/g, '<g/>');
  svg = svg.replace(/<image[^>]*(https?:\/\/)[^/]*>[^<]*<\/image>/g, '<g/>');

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 700 },
    background: '#1a1410',
  });
  return resvg.render().asPng();
}

async function buildPdf(nome, hdData) {
  const props = hdData.Properties || {};
  const svgString = hdData.SVG;

  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const cream  = rgb(0.914, 0.847, 0.753);
  const peach  = rgb(0.855, 0.639, 0.561);
  const coffee = rgb(0.608, 0.490, 0.380);
  const dark   = rgb(0.102, 0.078, 0.063);
  const mid    = rgb(0.155, 0.118, 0.094);

  page.drawRectangle({ x: 0, y: 0, width, height, color: dark });

  // Gráfico lado esquerdo
  if (svgString) {
    try {
      const pngBuf = svgToPng(svgString);
      console.log('[PDF] PNG gerado:', pngBuf.length, 'bytes');
      const pngImg = await pdfDoc.embedPng(pngBuf);
      const dims   = pngImg.scaleToFit(460, height - 40);
      page.drawImage(pngImg, {
        x: 20,
        y: (height - dims.height) / 2,
        width:  dims.width,
        height: dims.height,
      });
      console.log('[PDF] Gráfico embedado com sucesso');
    } catch (e) {
      console.error('[PDF] Erro ao processar SVG:', e.message);
    }
  } else {
    console.warn('[PDF] SVG ausente na resposta da API');
  }

  // Divisória
  page.drawLine({ start: { x: 490, y: 30 }, end: { x: 490, y: height - 30 }, thickness: 0.4, color: coffee });

  // Painel direito
  const px = 505;

  // Triângulo logo
  page.drawLine({ start: { x: 668, y: height - 18 }, end: { x: 682, y: height - 36 }, thickness: 1, color: coffee });
  page.drawLine({ start: { x: 682, y: height - 36 }, end: { x: 654, y: height - 36 }, thickness: 1, color: coffee });
  page.drawLine({ start: { x: 654, y: height - 36 }, end: { x: 668, y: height - 18 }, thickness: 1, color: coffee });

  page.drawText('VIDA AUTORAL',           { x: 530, y: height - 24, size: 9,  color: coffee });
  page.drawText('MAPA DO DESENHO HUMANO', { x: 510, y: height - 38, size: 7,  color: rgb(0.6, 0.55, 0.5) });
  page.drawLine({ start: { x: px, y: height - 46 }, end: { x: 825, y: height - 46 }, thickness: 0.4, color: coffee });

  page.drawText(nome.toUpperCase(), { x: px, y: height - 62, size: 14, color: cream });
  page.drawLine({ start: { x: px, y: height - 72 }, end: { x: 825, y: height - 72 }, thickness: 0.3, color: mid });

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

  page.drawRectangle({ x: 0, y: 0, width, height: 22, color: mid });
  page.drawText('© 2025 Vida Autoral · Todos os direitos reservados', { x: 285, y: 7, size: 6.5, color: rgb(0.4, 0.35, 0.3) });

  return await pdfDoc.save();
}

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
    const svgLen = hdData?.SVG?.length || 0;
    console.log(`[4] Dados HD — Tipo: ${hdData?.Properties?.Type?.id} | SVG: ${svgLen} chars`);

    // Log das primeiras 300 chars do SVG para diagnóstico
    if (hdData?.SVG) console.log(`[4b] SVG início: ${hdData.SVG.slice(0, 300)}`);

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
