'use strict';
// ZERO dependencias npm. Apenas APIs nativas do Node.js 18+:
// fetch, Buffer, process.env, stream (req.on)
// Motivo: o runtime Fluid do Vercel (Rust/V8 bytecode) corrompe qualquer
// bundle que inclua dependencias npm de tamanho relevante (pdf-lib 20MB, resvg-wasm 2.4MB).

const maxDuration = 30;
module.exports = handler;
module.exports.maxDuration = maxDuration;

const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

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
function t(v) { return (v && T[v]) || v || '-'; }

async function resolveTimezone(city) {
  const url = BODYGRAPH_BASE + '/v210502/locations?api_key=' + BODYGRAPH_API_KEY + '&query=' + encodeURIComponent(city);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Locations API: ' + res.status);
  const data = await res.json();
  if (!data || !data.length) throw new Error('Cidade nao encontrada: ' + city);
  return data[0].timezone;
}

async function fetchHDData(date, hora, timezone) {
  const dt  = date + ' ' + hora;
  const url = BODYGRAPH_BASE + '/v221006/hd-data?api_key=' + BODYGRAPH_API_KEY
    + '&date=' + encodeURIComponent(dt)
    + '&timezone=' + encodeURIComponent(timezone)
    + '&design=Leo';
  const res = await fetch(url);
  if (!res.ok) throw new Error('HD Data API: ' + res.status);
  return res.json();
}

const PLANET_ORDER = ['Sun','Earth','North Node','South Node','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PLANET_PT    = {'Sun':'Sol','Earth':'Terra','North Node':'N\u00f3 Norte','South Node':'N\u00f3 Sul','Moon':'Lua','Mercury':'Merc\u00faio','Venus':'V\u00eanus','Mars':'Marte','Jupiter':'J\u00fapiter','Saturn':'Saturno','Uranus':'Urano','Neptune':'Netuno','Pluto':'Plut\u00e3o'};
const PLANET_SYM   = {'Sun':'\u2609','Earth':'\u2295','North Node':'\u260a','South Node':'\u260b','Moon':'\u263d','Mercury':'\u263f','Venus':'\u2640','Mars':'\u2642','Jupiter':'\u2643','Saturn':'\u2644','Uranus':'\u2645','Neptune':'\u2646','Pluto':'\u2647'};

function extrairPlanetas(hd) {
  const pers   = hd.Personality || {};
  const design = hd.Design      || {};
  return PLANET_ORDER.map(function(name) {
    const p = pers[name]   || {};
    const d = design[name] || {};
    return {
      pt:   PLANET_PT[name] || name,
      sym:  PLANET_SYM[name] || '',
      pers:   (p.Gate) ? (p.Gate + '.' + p.Line) : '-',
      design: (d.Gate) ? (d.Gate + '.' + d.Line) : '-',
    };
  });
}

function extrairPortoesCanais(hd) {
  let portoes = [], canais = [];
  if (hd.ActiveGates) { portoes = hd.ActiveGates; }
  else {
    const seen = {};
    function add(side) {
      Object.values(side).forEach(function(p) {
        if (p && p.Gate && !seen[p.Gate]) { seen[p.Gate] = true; portoes.push(p.Gate); }
      });
    }
    if (hd.Personality) add(hd.Personality);
    if (hd.Design) add(hd.Design);
  }
  if (hd.ActiveChannels) canais = hd.ActiveChannels;
  return { portoes, canais };
}

function getSetas(hd) {
  const v = hd.Variables || {};
  return { tl: v.Digestion||'left', tr: v.Perspective||'left', bl: v.Environment||'left', br: v.Awareness||'left' };
}

function arrowChar(dir) { return dir === 'left' ? '\u25c4' : '\u25ba'; }

function prop(label, value) {
  return '<div class="prop"><div class="prop-label">' + label + '</div><div class="prop-value">' + (value || '-') + '</div></div>';
}

const CSS = '<style>'
  + 'body{margin:0;padding:0;background:#f5f0eb;font-family:Georgia,serif}'
  + '.wrap{max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden}'
  + '.header{background:#9B7D61;padding:28px 32px;display:flex;align-items:center;gap:16px}'
  + '.header h1{color:#fff;margin:0;font-size:20px;letter-spacing:2px;font-weight:400}'
  + '.header p{color:#E9D7C0;margin:0;font-size:12px;letter-spacing:1px}'
  + '.body{padding:32px}'
  + '.body p{color:#2E2419;line-height:1.7;font-size:15px}'
  + '.info{background:#FEF3E8;border-left:3px solid #DAA38F;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;font-size:14px;color:#6B5A4B}'
  + '.section-title{font-size:11px;letter-spacing:2px;color:#9B7D61;text-transform:uppercase;margin:28px 0 12px;border-bottom:1px solid #E9D7C0;padding-bottom:6px}'
  + '.props-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}'
  + '.prop{background:#F6F4F2;border-radius:8px;padding:10px 14px}'
  + '.prop-label{font-size:10px;letter-spacing:1.5px;color:#9B7D61;text-transform:uppercase;margin-bottom:4px}'
  + '.prop-value{font-size:14px;color:#2E2419;font-weight:500}'
  + '.planets-table{width:100%;border-collapse:collapse;font-size:13px}'
  + '.planets-table th{background:#E9D7C0;color:#6B5A4B;font-weight:400;letter-spacing:1px;padding:8px 10px;text-align:left;font-size:11px}'
  + '.planets-table td{padding:7px 10px;border-bottom:1px solid #F0EBE4;color:#2E2419}'
  + '.planets-table tr:last-child td{border-bottom:none}'
  + '.col-pers{color:#7DAAA0;font-weight:600}'
  + '.col-des{color:#C7826F;font-weight:600}'
  + '.badges{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}'
  + '.badge-g{background:#92ADA4;color:#fff;border-radius:20px;padding:4px 12px;font-size:12px}'
  + '.badge-c{background:#E9D7C0;color:#6B5A4B;border-radius:6px;padding:4px 12px;font-size:12px}'
  + '.bodygraph-wrap{text-align:center;background:#FAFAF9;border-radius:10px;padding:16px;margin:20px 0}'
  + '.bodygraph-wrap svg{max-width:320px;height:auto}'
  + '.arrow-box{display:flex;justify-content:space-between;background:#F6F4F2;border-radius:8px;padding:10px 20px;margin:8px 0;font-size:13px;color:#6B5A4B}'
  + '.footer{background:#F6F4F2;padding:18px 32px;text-align:center;font-size:11px;color:#9B7D61;letter-spacing:1px}'
  + '@media(max-width:480px){.props-grid{grid-template-columns:1fr}.header{flex-direction:column;text-align:center}}'
  + '</style>';

const LOGO_SVG = '<svg width="36" height="36" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#fff" stroke-width="2.5" fill="none"/></svg>';

function buildEmailHTML(opts) {
  const { nome, data, hora, local, hd, planetas, portoes, canais, sv } = opts;
  const props = hd.Properties || {};
  const tipo  = t(props.Type && props.Type.id);
  const aut   = t(props.Authority && props.Authority.id);
  const est   = t(props.Strategy && props.Strategy.id);
  const perf  = props.Profile ? (props.Profile.num1 + '/' + props.Profile.num2) : '-';
  const def   = t(props.Definition && props.Definition.id);
  const sig   = t(props.Signature && props.Signature.id);
  const nself = t(props.NotSelf && props.NotSelf.id);
  const inc   = (props.Incarnation && props.Incarnation.id) || '-';

  const svgBlock = hd.SVG
    ? '<div class="bodygraph-wrap"><p style="font-size:11px;letter-spacing:1.5px;color:#9B7D61;text-transform:uppercase;margin:0 0 12px">Seu Bodygraph</p>'
      + hd.SVG.replace('<svg', '<svg style="max-width:320px;height:auto"') + '</div>'
    : '';

  const propsGrid = '<div class="props-grid">'
    + prop('Tipo', tipo) + prop('Estrat\u00e9gia', est)
    + prop('Autoridade', aut) + prop('Perfil', perf)
    + prop('Defini\u00e7\u00e3o', def) + prop('Cross', inc)
    + prop('Assinatura', sig) + prop('N\u00e3o-Self', nself)
    + '</div>';

  const setasBlock = '<div class="section-title">Setas do Variable</div>'
    + '<div class="arrow-box"><span>' + arrowChar(sv.tl) + ' ' + sv.tl.toUpperCase() + ' (Digestion)</span><span>' + sv.tr.toUpperCase() + ' ' + arrowChar(sv.tr) + ' (Perspective)</span></div>'
    + '<div class="arrow-box"><span>' + arrowChar(sv.bl) + ' ' + sv.bl.toUpperCase() + ' (Environment)</span><span>' + sv.br.toUpperCase() + ' ' + arrowChar(sv.br) + ' (Awareness)</span></div>';

  let planetasTable = '<div class="section-title">Planetas</div>'
    + '<table class="planets-table"><thead><tr>'
    + '<th>Planeta</th><th class="col-pers">Personalidade</th><th class="col-des">Design</th>'
    + '</tr></thead><tbody>';
  planetas.forEach(function(p) {
    planetasTable += '<tr><td>' + p.sym + ' ' + p.pt + '</td>'
      + '<td class="col-pers">' + p.pers + '</td>'
      + '<td class="col-des">' + p.design + '</td></tr>';
  });
  planetasTable += '</tbody></table>';

  let portBlock = '<div class="section-title">Port\u00f5es Ativados</div><div class="badges">';
  if (portoes.length) {
    portoes.slice().sort(function(a,b){return a-b;}).forEach(function(g) { portBlock += '<span class="badge-g">' + g + '</span>'; });
  } else { portBlock += '<span style="color:#9B7D61;font-size:13px">-</span>'; }
  portBlock += '</div>';

  let canaisBlock = '<div class="section-title">Canais Ativados</div><div class="badges">';
  if (canais.length) {
    canais.forEach(function(c) { canaisBlock += '<span class="badge-c">' + c + '</span>'; });
  } else { canaisBlock += '<span style="color:#9B7D61;font-size:13px">-</span>'; }
  canaisBlock += '</div>';

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">' + CSS + '</head><body>'
    + '<div class="wrap">'
    + '<div class="header">' + LOGO_SVG + '<div><h1>VIDA AUTORAL</h1><p>MAPA DO DESENHO HUMANO</p></div></div>'
    + '<div class="body">'
    + '<p>Ol\u00e1, <strong>' + nome + '</strong>!</p>'
    + '<p>Seu Mapa de Desenho Humano est\u00e1 pronto \ud83c\udf81</p>'
    + '<div class="info">\ud83d\udcc5 <strong>' + data + '</strong> &nbsp;&middot;&nbsp; \ud83d\udd54 <strong>' + hora + '</strong><br/>\ud83d\udccd ' + local + '</div>'
    + '<div class="section-title">Seus Dados</div>'
    + propsGrid + svgBlock + setasBlock + planetasTable + portBlock + canaisBlock
    + '<p style="font-size:.83rem;color:#9b836f;margin-top:28px">Com carinho,<br/><strong>Equipe Vida Autoral</strong></p>'
    + '</div>'
    + '<div class="footer">&copy; 2025 Vida Autoral &middot; Todos os direitos reservados</div>'
    + '</div></body></html>';
}

function buildConfirmationHTML(nome, data, hora, local) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8">' + CSS + '</head><body>'
    + '<div class="wrap">'
    + '<div class="header">' + LOGO_SVG + '<div><h1>VIDA AUTORAL</h1></div></div>'
    + '<div class="body">'
    + '<p>Ol\u00e1, <strong>' + nome + '</strong>!</p>'
    + '<p>Recebemos seus dados e em instantes voc\u00ea receber\u00e1 seu mapa completo.</p>'
    + '<div class="info">\ud83d\udcc5 <strong>' + data + '</strong> &nbsp;&middot;&nbsp; \ud83d\udd54 <strong>' + hora + '</strong><br/>\ud83d\udccd ' + local + '</div>'
    + '<p style="font-size:.83rem;color:#9b836f">Com carinho,<br/><strong>Equipe Vida Autoral</strong></p>'
    + '</div>'
    + '<div class="footer">&copy; 2025 Vida Autoral</div>'
    + '</div></body></html>';
}

async function sendEmail(to, subject, html) {
  const body = { from: FROM_NAME + ' <' + FROM_EMAIL + '>', to: [to], reply_to: REPLY_TO, subject, html };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RESEND_API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Resend: ' + JSON.stringify(await res.json()));
  return res.json();
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise(function(resolve, reject) {
    let raw = '';
    req.on('data', function(chunk) { raw += chunk; });
    req.on('end', function() { try { resolve(JSON.parse(raw || '{}')); } catch(e) { resolve({}); } });
    req.on('error', reject);
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');

  const body = await parseBody(req);
  const { nome, email, data, hora, local } = body;
  if (!nome || !email || !data || !hora || !local)
    return res.status(400).json({ error: 'Todos os campos sao obrigatorios.' });

  try {
    console.log('[1] Iniciando para ' + email);
    await sendEmail(email, nome + ', recebemos seus dados \u2605', buildConfirmationHTML(nome, data, hora, local));
    console.log('[2] Confirmacao enviada');

    const timezone = await resolveTimezone(local);
    console.log('[3] Timezone: ' + timezone);

    const hd = await fetchHDData(data, hora, timezone);
    console.log('[4] HD ok. Tipo: ' + (hd.Properties && hd.Properties.Type && hd.Properties.Type.id));

    const planetas = extrairPlanetas(hd);
    const { portoes, canais } = extrairPortoesCanais(hd);
    const sv = getSetas(hd);

    const html = buildEmailHTML({ nome, data, hora, local, hd, planetas, portoes, canais, sv });
    await sendEmail(email, nome + ', seu Mapa de Desenho Humano est\u00e1 pronto \u2605', html);
    console.log('[5] Mapa enviado com sucesso');

    return res.status(200).json({ ok: true });
  } catch(err) {
    console.error('[Erro]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
