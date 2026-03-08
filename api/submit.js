'use strict';
// Node 20.x (ver package.json) usa runtime classico do Vercel, sem Fluid/Rust bytecode.
// require() normal funciona pois Node 20 usa runtime classico (sem Fluid).
//   - pdf-lib (geracao de PDF)
//   - @pdf-lib/fontkit (unicode nos simbolos planetarios)
//   - @resvg/resvg-js (SVG -> PNG via binario nativo .node, sem WASM)


const maxDuration = 30;
module.exports = handler;
module.exports.maxDuration = maxDuration;

// --- DEPS (carregadas via eval para nao serem analisadas estaticamente) --------
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit              = require('@pdf-lib/fontkit');

// @resvg/resvg-js: binario nativo (.node), sem WASM - nao corrompido pelo Fluid runtime
// Especializado em SVG->PNG com suporte a fontes customizadas
const { Resvg } = require('@resvg/resvg-js');
const fs_   = require('fs');
const path_ = require('path');
let fontBuffer = null;

function ensureFontBuffer() {
  if (fontBuffer) return;
  const fontPath = path_.join(process.cwd(), 'fonts', 'DejaVuSans.ttf');
  console.log('[font] path:', fontPath, 'exists:', fs_.existsSync(fontPath));
  fontBuffer = fs_.readFileSync(fontPath);
}

// --- ENV -----------------------------------------------------------------------
const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

// --- TRADUCOES -----------------------------------------------------------------
const T = {
  'Generator':'Gerador','Manifested Generator':'Gerador Manifestado',
  'Manifestor':'Manifestador','Projector':'Projetor','Reflector':'Refletor',
  'To Respond':'Responder','To Inform':'Informar','To Initiate':'Iniciar',
  'Wait for the Invitation':'Aguardar o Convite',
  'Wait for a Lunar Cycle':'Aguardar Ciclo Lunar',
  'Wait a Lunar Cycle':'Aguardar Ciclo Lunar',
  'Sacral':'Sacral','Emotional':'Emocional','Splenic':'Esplen\u00e9tica',
  'Ego':'Ego','Self-Projected':'Proje\u00e7\u00e3o do Eu','Mental':'Mental',
  'No Authority':'Sem Autoridade Interna','Lunar':'Lunar',
  'Ego Manifestor':'Ego (Manifestador)',
  'Single Definition':'Defini\u00e7\u00e3o \u00danica',
  'Split Definition':'Defini\u00e7\u00e3o Dividida',
  'Triple Split Definition':'Tripla Divis\u00e3o',
  'Quadruple Split':'Qu\u00e1drupla Divis\u00e3o',
  'No Definition':'Sem Defini\u00e7\u00e3o',
  'Satisfaction':'Satisfa\u00e7\u00e3o','Success':'Sucesso',
  'Peace':'Paz','Surprise':'Surpresa',
  'Frustration':'Frustra\u00e7\u00e3o','Bitterness':'Amargura',
  'Anger':'Raiva','Disappointment':'Decep\u00e7\u00e3o',
};
function tr(v) { return (v && T[v]) || v || '-'; }

// --- BODYGRAPH API -------------------------------------------------------------
async function resolveTimezone(city) {
  const url = BODYGRAPH_BASE + '/v210502/locations?api_key=' + BODYGRAPH_API_KEY
    + '&query=' + encodeURIComponent(city);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Locations API: ' + res.status);
  const data = await res.json();
  if (!data || !data.length) throw new Error('Cidade nao encontrada: ' + city);
  return data[0].timezone;
}

async function fetchHDData(date, hora, timezone) {
  const url = BODYGRAPH_BASE + '/v221006/hd-data?api_key=' + BODYGRAPH_API_KEY
    + '&date=' + encodeURIComponent(date + ' ' + hora)
    + '&timezone=' + encodeURIComponent(timezone)
    + '&design=Leo';
  const res = await fetch(url);
  if (!res.ok) throw new Error('HD Data API: ' + res.status);
  return res.json();
}

// --- DADOS HD ------------------------------------------------------------------
const PLANET_ORDER = ['Sun','Earth','North Node','South Node','Moon','Mercury',
                      'Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PLANET_PT  = {
  'Sun':'Sol','Earth':'Terra','North Node':'N\u00f3 Norte','South Node':'N\u00f3 Sul',
  'Moon':'Lua','Mercury':'Merc\u00faio','Venus':'V\u00eanus','Mars':'Marte',
  'Jupiter':'J\u00fapiter','Saturn':'Saturno','Uranus':'Urano',
  'Neptune':'Netuno','Pluto':'Plut\u00e3o',
};
const PLANET_SYM = {
  'Sun':'\u2609','Earth':'\u2295','North Node':'\u260a','South Node':'\u260b',
  'Moon':'\u263d','Mercury':'\u263f','Venus':'\u2640','Mars':'\u2642',
  'Jupiter':'\u2643','Saturn':'\u2644','Uranus':'\u2645','Neptune':'\u2646','Pluto':'\u2647',
};

function extrairPlanetas(hd) {
  const pers   = hd.Personality || {};
  const design = hd.Design      || {};
  return PLANET_ORDER.map(name => ({
    name, pt: PLANET_PT[name]||name, sym: PLANET_SYM[name]||'',
    pers:   pers[name]   && pers[name].Gate   ? pers[name].Gate   + '.' + pers[name].Line   : '-',
    design: design[name] && design[name].Gate  ? design[name].Gate + '.' + design[name].Line : '-',
  }));
}

function extrairPortoesCanais(hd) {
  // Portoes
  let portoes = [];
  if (hd.ActiveGates && hd.ActiveGates.length) {
    portoes = hd.ActiveGates.map(Number);
  } else {
    const seen = {};
    const add = side => Object.values(side).forEach(p => {
      if (p && p.Gate && !seen[p.Gate]) { seen[p.Gate]=true; portoes.push(+p.Gate); }
    });
    if (hd.Personality) add(hd.Personality);
    if (hd.Design) add(hd.Design);
  }
  // Canais: a API pode retornar array de strings "20-57", objetos {Gate1,Gate2} ou {id}
  let canais = [];
  const raw = hd.ActiveChannels || hd.Channels || hd.channels || [];
  console.log('[canais] raw type:', typeof raw, 'length:', raw.length, 'sample:', JSON.stringify(raw[0]));
  raw.forEach(c => {
    if (typeof c === 'string') canais.push(c);
    else if (c && c.id) canais.push(String(c.id));
    else if (c && c.Gate1 && c.Gate2) canais.push(c.Gate1 + '-' + c.Gate2);
    else if (c && c.gate1 && c.gate2) canais.push(c.gate1 + '-' + c.gate2);
    else canais.push(JSON.stringify(c));
  });
  return { portoes, canais };
}

function getSetas(hd) {
  const v = hd.Variables || {};
  return { tl:v.Digestion||'left', tr:v.Perspective||'left', bl:v.Environment||'left', br:v.Awareness||'left' };
}

// --- SVG -> PNG ---------------------------------------------------------------
function prepararSvg(svg) {
  // Garante namespace
  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  // Remove hrefs externos
  svg = svg.replace(/xlink:href="https?:\/\/[^"]*"/g, 'xlink:href=""');
  svg = svg.replace(/ href="https?:\/\/[^"]*"/g, '');
  // Extrai viewBox para derivar dimensoes
  const vb = svg.match(/viewBox=["']([^"']+)["']/);
  const hasW = /\swidth=["'][^"']+["']/.test(svg);
  const hasH = /\sheight=["'][^"']+["']/.test(svg);
  if (vb && (!hasW || !hasH)) {
    const parts = vb[1].trim().split(/[\s,]+/);
    const vw = parseFloat(parts[2]) || 500;
    const vh = parseFloat(parts[3]) || 600;
    if (!hasW) svg = svg.replace('<svg', '<svg width="' + vw + '"');
    if (!hasH) svg = svg.replace('<svg', '<svg height="' + vh + '"');
  } else if (!hasW) {
    svg = svg.replace('<svg', '<svg width="500" height="600"');
  }
  return svg;
}

function svgParaPng(svgString) {
  ensureFontBuffer();
  const svg = prepararSvg(svgString);
  console.log('[SVG] tamanho:', svg.length, 'chars');
  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 700 },
      background: '#ffffff',
      font: { fontBuffers: [fontBuffer], defaultFontFamily: 'DejaVu Sans', loadSystemFonts: false },
    });
    const png = resvg.render().asPng();
    console.log('[SVG->PNG] OK:', png.length, 'bytes');
    return png;
  } catch(e) {
    console.error('[SVG->PNG] ERRO resvg-js:', e.message);
    throw e;
  }
}

// --- PDF -----------------------------------------------------------------------
// Layout: A4 paisagem 841.89 x 595.28 pts
// Coluna esquerda (0-490): pills Design | grafico | pills Personality + setas
// Coluna direita (490-841): dados, portoes, canais

async function buildPdf(nome, hd, planetas, portoes, canais, sv) {
  ensureFontBuffer(); // garante que fontBuffer esta carregado
  const props = hd.Properties || {};
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font   = await pdfDoc.embedFont(fontBuffer);   // DejaVu (unicode)
  const page   = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Paleta
  const branco     = rgb(1,1,1);
  const coffee     = rgb(0.608,0.490,0.380);   // #9B7D61
  const peach      = rgb(0.855,0.639,0.561);   // #DAA38F
  const eucalyptus = rgb(0.573,0.678,0.643);   // #92ADA4
  const wheat      = rgb(0.914,0.843,0.753);   // #E9D7C0
  const textEsc    = rgb(0.180,0.141,0.114);
  const textMed    = rgb(0.420,0.353,0.294);
  const cinzaClaro = rgb(0.965,0.957,0.949);
  const designBg   = rgb(0.780,0.510,0.435);   // salmon
  const persBg     = rgb(0.490,0.667,0.627);   // mint

  const DIVIDER = 490;
  const COL_W   = 72;
  const PILL_H  = 22;
  const PILL_W  = COL_W - 6;
  const PILL_M  = 3;
  const MARGIN_V= 28;
  const AREA_TOP = height - 36 - MARGIN_V;
  const AREA_BOT = 20 + MARGIN_V;
  const AREA_H   = AREA_TOP - AREA_BOT;
  const CHART_X0 = COL_W;
  const CHART_W  = DIVIDER - COL_W * 2;

  // Fundo
  page.drawRectangle({ x:0, y:0, width, height, color:branco });

  // Cabecalho esquerdo
  page.drawRectangle({ x:0, y:height-36, width:DIVIDER, height:36, color:wheat });
  page.drawText('DESIGN',      { x:3,             y:height-25, size:6.5, color:designBg, font });
  page.drawText('PERSONALITY', { x:DIVIDER-COL_W+3, y:height-25, size:5.5, color:persBg, font });

  // Pills planetas
  const totalH = AREA_H;
  const pillStep = totalH / PLANET_ORDER.length;

  planetas.forEach((p, i) => {
    const pillY = AREA_BOT + (PLANET_ORDER.length - 1 - i) * pillStep + (pillStep - PILL_H) / 2;

    // Design (esquerda)
    page.drawRectangle({ x:PILL_M, y:pillY, width:PILL_W, height:PILL_H,
      color: p.design !== '-' ? designBg : cinzaClaro, borderRadius:5 });
    if (p.sym) page.drawText(p.sym, { x:PILL_M+3, y:pillY+5, size:12, font, color:branco });
    if (p.design !== '-') page.drawText(p.design, { x:PILL_M+19, y:pillY+6, size:8.5, font, color:branco });

    // Personality (direita)
    const px = DIVIDER - COL_W + PILL_M;
    page.drawRectangle({ x:px, y:pillY, width:PILL_W, height:PILL_H,
      color: p.pers !== '-' ? persBg : cinzaClaro, borderRadius:5 });
    if (p.sym) page.drawText(p.sym, { x:px+3, y:pillY+5, size:12, font, color:branco });
    if (p.pers !== '-') page.drawText(p.pers, { x:px+19, y:pillY+6, size:8.5, font, color:branco });
  });

  // Grafico bodygraph
  let imgX = CHART_X0, imgY = AREA_BOT, imgW = CHART_W, imgH = AREA_H;
  if (hd.SVG) {
    try {
      const png  = svgParaPng(hd.SVG);
      const img  = await pdfDoc.embedPng(png);
      const dims = img.scaleToFit(CHART_W, AREA_H);
      imgX = CHART_X0 + (CHART_W - dims.width) / 2;
      imgY = AREA_BOT  + (AREA_H  - dims.height) / 2;
      imgW = dims.width; imgH = dims.height;
      page.drawImage(img, { x:imgX, y:imgY, width:imgW, height:imgH });
      console.log('[PDF] Grafico OK:', Math.round(imgW)+'x'+Math.round(imgH));
    } catch(e) { console.error('[PDF] Grafico erro:', e.message); }
  }

  // Setas do Variable
  const headY = imgY + imgH * 0.88;
  const rootY = imgY + imgH * 0.08;
  const lgc   = (COL_W + imgX) / 2;
  const rgc   = (imgX + imgW + (DIVIDER - COL_W)) / 2;

  function seta(cx, cy, dir, cor) {
    const W=12, H=5;
    if (dir==='right') {
      const tip = cx + W/2;
      page.drawLine({ start:{x:tip-W,y:cy}, end:{x:tip,y:cy}, thickness:2, color:cor });
      page.drawLine({ start:{x:tip,y:cy}, end:{x:tip-6,y:cy+H}, thickness:2, color:cor });
      page.drawLine({ start:{x:tip,y:cy}, end:{x:tip-6,y:cy-H}, thickness:2, color:cor });
    } else {
      const tip = cx - W/2;
      page.drawLine({ start:{x:tip+W,y:cy}, end:{x:tip,y:cy}, thickness:2, color:cor });
      page.drawLine({ start:{x:tip,y:cy}, end:{x:tip+6,y:cy+H}, thickness:2, color:cor });
      page.drawLine({ start:{x:tip,y:cy}, end:{x:tip+6,y:cy-H}, thickness:2, color:cor });
    }
  }
  seta(lgc, headY, sv.tl, designBg);
  seta(rgc, headY, sv.tr, persBg);
  seta(lgc, rootY, sv.bl, designBg);
  seta(rgc, rootY, sv.br, persBg);

  // === COLUNA DIREITA ===
  const px = DIVIDER + 14;
  const pw = width - DIVIDER - 20;

  // Cabecalho direito
  page.drawRectangle({ x:DIVIDER, y:height-56, width:width-DIVIDER, height:56, color:coffee });

  // Logo triangulo
  page.drawLine({ start:{x:px,y:height-10},   end:{x:px+20,y:height-46}, thickness:1.5, color:branco });
  page.drawLine({ start:{x:px+20,y:height-46},end:{x:px+40,y:height-10}, thickness:1.5, color:branco });
  page.drawLine({ start:{x:px+40,y:height-10},end:{x:px,y:height-10},    thickness:1.5, color:branco });

  page.drawText('VIDA AUTORAL',           { x:px+48, y:height-24, size:9,  color:branco, font });
  page.drawText('MAPA DO DESENHO HUMANO', { x:px+48, y:height-37, size:6.5,color:wheat,  font });

  // Nome
  const nomeDisplay = nome.length > 28 ? nome.slice(0,28)+'...' : nome;
  page.drawText(nomeDisplay.toUpperCase(), { x:px, y:height-70, size:11, color:textEsc, font });

  // Props em grid 2 colunas
  const LABELS = [
    ['Tipo',         tr(props.Type && props.Type.id)],
    ['Estrat\u00e9gia', tr(props.Strategy && props.Strategy.id)],
    ['Autoridade',   tr(props.InnerAuthority && props.InnerAuthority.id)],
    ['Perfil',       (props.Profile && props.Profile.id) || '-'],
    ['Defini\u00e7\u00e3o', tr(props.Definition && props.Definition.id)],
    ['Cruz',         (props.IncarnationCross && props.IncarnationCross.id) || '-'],
    ['Assinatura',   tr(props.Signature && props.Signature.id)],
    ['N\u00e3o-Self', tr(props.NotSelfTheme && props.NotSelfTheme.id)],
  ];
  const CW2 = pw / 2 - 5;
  LABELS.forEach(([label, val], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = px + col * (CW2 + 5);
    const cy = height - 92 - row * 38;
    page.drawRectangle({ x:cx, y:cy-28, width:CW2, height:32, color:cinzaClaro, borderRadius:4 });
    page.drawRectangle({ x:cx, y:cy+4,  width:CW2, height:3,  color:peach });
    page.drawText(label.toUpperCase(), { x:cx+4, y:cy-4,  size:5.5, color:textMed, font });
    const valStr = (val||'-').slice(0,22);
    page.drawText(valStr, { x:cx+4, y:cy-16, size:8, color:textEsc, font });
  });

  // Portoes
  const secY = height - 258;
  page.drawText('PORT\u00d5ES ATIVADOS', { x:px, y:secY, size:6, color:coffee, font });
  const portSorted = portoes.slice().sort((a,b)=>a-b);
  let bx = px, by = secY - 16;
  portSorted.forEach(g => {
    const label = String(g);
    const bw = label.length * 5.5 + 10;
    if (bx + bw > width - 10) { bx=px; by -= 16; }
    page.drawRectangle({ x:bx, y:by-2, width:bw, height:13, color:eucalyptus, borderRadius:6 });
    page.drawText(label, { x:bx+5, y:by+1, size:7, color:branco, font });
    bx += bw + 4;
  });

  // Canais
  const canaisY = by - 28;
  page.drawText('CANAIS ATIVADOS', { x:px, y:canaisY, size:6, color:coffee, font });
  let cx2 = px, cy2 = canaisY - 16;
  canais.forEach(c => {
    const label = String(c);
    const cw = label.length * 5 + 10;
    if (cx2 + cw > width - 10) { cx2=px; cy2 -= 16; }
    page.drawRectangle({ x:cx2, y:cy2-2, width:cw, height:13, color:wheat, borderRadius:4 });
    page.drawText(label, { x:cx2+5, y:cy2+1, size:7, color:textMed, font });
    cx2 += cw + 4;
  });

  // Rodape
  page.drawText('\u00a9 2025 Vida Autoral . Todos os direitos reservados', { x:300, y:6, size:5.5, color:textMed, font });

  return pdfDoc.save();
}

// --- EMAIL HTML ---------------------------------------------------------------
const CSS = '<style>'
  + 'body{margin:0;background:#f5f0eb;font-family:Georgia,serif}'
  + '.w{max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden}'
  + '.h{background:#9B7D61;padding:24px 32px;display:flex;align-items:center;gap:14px}'
  + '.h h1{color:#fff;margin:0;font-size:18px;letter-spacing:2px;font-weight:400}'
  + '.b{padding:28px 32px}'
  + '.b p{color:#2E2419;line-height:1.7;font-size:15px}'
  + '.info{background:#FEF3E8;border-left:3px solid #DAA38F;padding:12px 16px;border-radius:0 8px 8px 0;margin:18px 0;font-size:14px;color:#6B5A4B}'
  + '.f{background:#F6F4F2;padding:14px 32px;text-align:center;font-size:11px;color:#9B7D61}'
  + '</style>';
const LOGO = '<svg width="32" height="32" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#fff" stroke-width="2.5" fill="none"/></svg>';

function emailConfirmacao(nome, data, hora, local) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8">' + CSS + '</head><body>'
    + '<div class="w"><div class="h">' + LOGO + '<h1>VIDA AUTORAL</h1></div>'
    + '<div class="b"><p>Ol\u00e1, <strong>' + nome + '</strong>!</p>'
    + '<p>Recebemos seus dados. Seu mapa est\u00e1 sendo gerado e chegar\u00e1 em breve.</p>'
    + '<div class="info">\ud83d\udcc5 ' + data + ' &middot; \ud83d\udd54 ' + hora + '<br>\ud83d\udccd ' + local + '</div>'
    + '<p style="font-size:.83rem;color:#9b836f">Com carinho,<br><strong>Equipe Vida Autoral</strong></p>'
    + '</div><div class="f">&copy; 2025 Vida Autoral</div></div></body></html>';
}

function emailPdf(nome, data, hora, local) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8">' + CSS + '</head><body>'
    + '<div class="w"><div class="h">' + LOGO + '<h1>VIDA AUTORAL</h1></div>'
    + '<div class="b"><p>Ol\u00e1, <strong>' + nome + '</strong>!</p>'
    + '<p>Seu Mapa de Desenho Humano est\u00e1 pronto \ud83c\udf81 O PDF completo com seu gr\u00e1fico Bodygraph est\u00e1 em anexo.</p>'
    + '<div class="info">\ud83d\udcc5 ' + data + ' &middot; \ud83d\udd54 ' + hora + '<br>\ud83d\udccd ' + local + '</div>'
    + '<p>O PDF inclui: Tipo, Estrat\u00e9gia, Autoridade, Perfil, Defini\u00e7\u00e3o, planetas Design e Personalidade, setas do Variable, Port\u00f5es e Canais ativados.</p>'
    + '<p style="font-size:.83rem;color:#9b836f">Com carinho,<br><strong>Equipe Vida Autoral</strong></p>'
    + '</div><div class="f">&copy; 2025 Vida Autoral</div></div></body></html>';
}

// --- RESEND -------------------------------------------------------------------
async function sendEmail(to, subject, html, attachments) {
  const body = {
    from: FROM_NAME + ' <' + FROM_EMAIL + '>',
    to: [to], reply_to: REPLY_TO, subject, html,
  };
  if (attachments && attachments.length) body.attachments = attachments;
  const res = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+RESEND_API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Resend: ' + JSON.stringify(await res.json()));
  return res.json();
}

// --- PARSE BODY ---------------------------------------------------------------
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end',  () => { try { resolve(JSON.parse(raw||'{}')); } catch(e) { resolve({}); } });
    req.on('error', reject);
  });
}

// --- HANDLER ------------------------------------------------------------------
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');

  const body = await parseBody(req);
  const { nome, email, data, hora, local } = body;
  if (!nome||!email||!data||!hora||!local)
    return res.status(400).json({ error:'Todos os campos sao obrigatorios.' });

  try {
    console.log('[1] Iniciando para', email);
    await sendEmail(email, nome+', recebemos seus dados \u2605', emailConfirmacao(nome,data,hora,local));
    console.log('[2] Confirmacao enviada');

    const timezone = await resolveTimezone(local);
    console.log('[3] Timezone:', timezone);

    const hd = await fetchHDData(data, hora, timezone);
    const tipo = hd.Properties && hd.Properties.Type && hd.Properties.Type.id;
    console.log('[4] HD ok. Tipo:', tipo, '| SVG:', (hd.SVG||'').length, 'chars');

    const planetas = extrairPlanetas(hd);
    const { portoes, canais } = extrairPortoesCanais(hd);
    const sv = getSetas(hd);

    const pdfBytes  = await buildPdf(nome, hd, planetas, portoes, canais, sv);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    console.log('[5] PDF gerado:', pdfBytes.length, 'bytes');

    const primeiroNome = nome.split(' ')[0].toLowerCase();
    await sendEmail(
      email,
      nome + ', seu Mapa de Desenho Humano est\u00e1 pronto \u2605',
      emailPdf(nome, data, hora, local),
      [{ filename:'mapa-desenho-humano-'+primeiroNome+'.pdf', content:pdfBase64 }]
    );
    console.log('[6] PDF enviado com sucesso');

    return res.status(200).json({ ok:true });
  } catch(err) {
    console.error('[Erro]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
