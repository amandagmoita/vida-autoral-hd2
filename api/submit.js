'use strict';
// pdfkit + svg-to-pdfkit: JS puro. SVG do bodygraph inserido como vetor no PDF.
// Zero WASM, zero binarios nativos - Fluid runtime nao tem nada para corromper.

const maxDuration = 30;
module.exports = handler;
module.exports.maxDuration = maxDuration;

// — ENV ———————————————————————–
const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

// — TRADUCOES —————————————————————–
const T = {
'Generator':'Gerador','Manifested Generator':'Gerador Manifestado',
'Manifestor':'Manifestador','Projector':'Projetor','Reflector':'Refletor',
'To Respond':'Responder','To Inform':'Informar','To Initiate':'Iniciar',
'Wait for the Invitation':'Aguardar o Convite',
'Wait for a Lunar Cycle':'Aguardar Ciclo Lunar',
'Wait a Lunar Cycle':'Aguardar Ciclo Lunar',
'Sacral':'Sacral','Emotional':'Emocional','Splenic':'Espl\u00e9nica',
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
'Emotional - Solar Plexus':'Emocional','Sacral Authority':'Sacral',
'Manifesting Generator':'Gerador Manifestante',
};
function tr(v) { return (v && T[v]) || v || '-'; }

// — DESCRIÇÕES DOS TÓPICOS ————————————————————————
const DESC = {
  tipo: {
    'Generator': {
      descricao:       'Você é a força vital do mundo. Sua energia constrói, sustenta e inspira — mas só quando seu corpo diz sim de verdade.',
      fraseIdentidade: 'Na minha presença as pessoas se sentem elevadas e entusiasmadas. Elevo a energia dos meus clientes quando sigo o sim do meu corpo.',
    },
    'Manifested Generator': {
      descricao:       'Multipotencial com energia ágil. Você responde, inicia e avança rápido — e seu caminho não precisa ser linear para ser poderoso.',
      fraseIdentidade: 'Na minha presença as pessoas se sentem elevadas e entusiasmadas. Tenho energia ágil e multipotencial para encontrar o caminho mais rápido ao resultado.',
    },
    'Manifesting Generator': {
      descricao:       'Multipotencial com energia ágil. Você responde, inicia e avança rápido — e seu caminho não precisa ser linear para ser poderoso.',
      fraseIdentidade: 'Na minha presença as pessoas se sentem elevadas e entusiasmadas. Tenho energia ágil e multipotencial para encontrar o caminho mais rápido ao resultado.',
    },
    'Manifestor': {
      descricao:       'Você nasceu para iniciar movimentos. Seu poder é colocar coisas no mundo — e tudo flui quando você age com coragem e informa antes.',
      fraseIdentidade: 'Na minha presença as pessoas se sentem movidas a agir. Inicio movimentos na vida dos meus clientes quando sigo minhas próprias inspirações.',
    },
    'Projector': {
      descricao:       'Você veio para guiar, não para correr. Sua visão de águia enxerga o que ninguém mais vê — e brilha quando é reconhecida e convidada.',
      fraseIdentidade: 'Na minha presença as pessoas se sentem profundamente vistas e ouvidas. Sou uma guia poderosa que lê a energia das pessoas e dos ambientes.',
    },
    'Reflector': {
      descricao:       'Você é o espelho do ambiente. Rara e sensível, revela verdades que ninguém mais percebe — e decide melhor com tempo e espaço.',
      fraseIdentidade: 'Na minha presença as pessoas se veem como nunca antes. Reflito a energia dos meus clientes quando mantenho minha própria energia limpa.',
    },
  },
  estrategia: {
    'To Respond':              'Não inicie — reaja. Quando algo de fora acende seu sacral, esse é o sinal. Forçar sem resposta esgota.',
    'To Inform':               'Responda ao que vem de fora, depois avise quem será impactado. Pular um dos dois cria caos.',
    'To Initiate':             'Antes de agir, avise quem será impactado. Esse gesto simples transforma resistência em apoio.',
    'Wait for the Invitation': 'Sua orientação é valiosa demais para ser dada sem pedido. Espere ser reconhecida — então vá fundo.',
    'Wait for a Lunar Cycle':  'Decisões grandes pedem 28 dias. Fale com pessoas diferentes, observe — a clareza vem com o tempo.',
    'Wait a Lunar Cycle':      'Decisões grandes pedem 28 dias. Fale com pessoas diferentes, observe — a clareza vem com o tempo.',
  },
  autoridade: {
    'Sacral':                   'Sua bússola é o gut. Um "hm-hm" interno significa sim; "uhn-uhn" significa não. Confie sem precisar explicar.',
    'Emotional':                'Nunca decida no pico da emoção. Sua clareza vem depois que a onda passa — espere a névoa baixar.',
    'Emotional - Solar Plexus': 'Nunca decida no pico da emoção. Sua clareza vem depois que a onda passa — espere a névoa baixar.',
    'Splenic':                  'É um sussurro no momento presente. Você sabe, mas não sabe explicar por quê. Confie na primeira impressão.',
    'Ego':                      'Se não sai do coração de verdade, não vai até o fim. Sua vontade genuína é o guia — não o dever.',
    'Ego Manifestor':           'Se não sai do coração de verdade, não vai até o fim. Sua vontade genuína é o guia — não o dever.',
    'Self-Projected':           'Fale em voz alta com alguém neutro. A clareza vem ouvindo a própria voz — não pela mente pensante.',
    'Mental':                   'Você precisa de tempo e de ambientes diferentes para decidir. Durma, observe, converse — depois escolha.',
    'No Authority':             'Você precisa de tempo e de ambientes diferentes para decidir. Durma, observe, converse — depois escolha.',
    'Lunar':                    'Decisões grandes pedem 28 dias. Fale com pessoas diferentes, observe — a clareza vem com o tempo.',
  },
  perfil: {
    '1/3': 'Você aprende estudando fundo e testando na prática — às vezes na marra. Cada erro é um dado valioso.',
    '1/4': 'Base sólida de conhecimento + rede de confiança. Você influencia quem já conhece.',
    '2/4': 'Precisa de tempo a sós para recarregar, mas seus dons chamam as pessoas naturalmente.',
    '2/5': 'Você parece ter a solução que os outros precisam. Sua presença projeta liderança — queira ou não.',
    '3/5': 'Aprende pela tentativa e erro e vira referência por isso. Seu caminho não precisa ser linear.',
    '3/6': 'Fase de experiências intensas → sabedoria compartilhada. Você vai se tornar um modelo de vida.',
    '4/6': 'Rede de relacionamentos de confiança + visão de longo prazo. Você é o modelo que inspira pelo exemplo.',
    '4/1': 'Você influencia quem está perto com base sólida de conhecimento. Relacionamento é sua alavanca.',
    '5/1': 'As pessoas projetam em você a solução que precisam. Sua preparação é o que sustenta essa expectativa.',
    '5/2': 'Você tem genialidade natural e atrai projeções. Hora de recolhimento é essencial para se renovar.',
    '6/2': 'Três fases: experimentação, observação, sabedoria. Com o tempo, você vira o modelo que outros seguem.',
    '6/3': 'Você aprende tudo na prática — e essa vivência te transforma em referência autêntica.',
  },
  definicao: {
    'Single Definition':      'Você é consistente e previsível. Seu campo de energia é um bloco coeso — menos impactado pelos outros.',
    'Split Definition':       'Você tem duas ilhas de energia. Certas pessoas naturalmente "completam" seu circuito — e você sente.',
    'Triple Split Definition':'Três blocos independentes. Você precisa de mais conexões para se sentir inteira — e tudo bem.',
    'Quadruple Split':        'Quatro ilhas de energia. Você é muito adaptável ao ambiente e às pessoas — o contexto te molda muito.',
    'No Definition':          'Você é o espelho puro do coletivo. Sua energia é fluida — escolher bem seu entorno é essencial.',
  },
  assinatura: {
    'Satisfaction': 'Quando você está alinhada, sente satisfação profunda no que faz — não euforia, mas solidez interior.',
    'Success':      'Quando reconhecida e convidada, você prospera. O sucesso flui — não é forçado, é natural.',
    'Peace':        'Sua assinatura é paz. Quando você avisa antes de agir, a resistência desaparece e tudo flui.',
    'Surprise':     'Você está alinhada quando a vida te surpreende positivamente. A surpresa é seu sinal de que está certa.',
  },
  naoself: {
    'Frustration':    'Frustração é o sinal de que você iniciou sem resposta ou disse sim para algo errado. Pare e redirecione.',
    'Anger':          'Raiva é o sinal de que você agiu sem avisar. Não é defeito — é aviso para ajustar a comunicação.',
    'Bitterness':     'Amargura aparece quando você oferece seu dom sem ser chamada. Espere o convite — seu valor é real.',
    'Disappointment': 'Decepção indica que você decidiu rápido demais ou está num ambiente errado. Dê mais tempo a si.',
  },
  cruz: {
    'Right Angle Cross of the Sphinx':          '',
    'Right Angle Cross of Planning':            '',
    'Right Angle Cross of the Vessel of Love':  '',
    'Right Angle Cross of Eden':                '',
    'Right Angle Cross of the Sleeping Phoenix':'',
    'Right Angle Cross of the Unexpected':      '',
    'Right Angle Cross of Penetration':         '',
    'Right Angle Cross of Consciousness':       '',
    'Right Angle Cross of Explanation':         '',
    'Right Angle Cross of the Four Ways':       '',
    'Right Angle Cross of Laws':                '',
    'Right Angle Cross of Service':             '',
    'Right Angle Cross of the Rulebook':        '',
    'Right Angle Cross of Revolution':          '',
    'Right Angle Cross of the Vessel':          '',
    'Right Angle Cross':                        '',
    'Juxtaposition Cross of the Sphinx':        '',
    'Juxtaposition Cross of Planning':          '',
    'Juxtaposition Cross of Penetration':       '',
    'Juxtaposition Cross of Consciousness':     '',
    'Juxtaposition Cross':                      '',
    // Ângulo Esquerdo — propósito transpessoal
    'Left Angle Cross of Separation':           'Seu propósito é transpessoal. Você está aqui para impactar os outros — sua vida afeta mais do que imagina.',
    'Left Angle Cross of Demands':              'Seu propósito é transpessoal. Você está aqui para impactar os outros — sua vida afeta mais do que imagina.',
    'Left Angle Cross of Masks':                'Seu propósito é transpessoal. Você está aqui para impactar os outros — sua vida afeta mais do que imagina.',
    'Left Angle Cross of Incarnation':          'Seu propósito é transpessoal. Você está aqui para impactar os outros — sua vida afeta mais do que imagina.',
    'Left Angle Cross of Alignment':            'Seu propósito é transpessoal. Você está aqui para impactar os outros — sua vida afeta mais do que imagina.',
    'Left Angle Cross of Education':            'Seu propósito é transpessoal. Você está aqui para impactar os outros — sua vida afeta mais do que imagina.',
    'Left Angle Cross of the Alpha':            '',
    'Left Angle Cross of Healing':              '',
    'Left Angle Cross of Prevention':           '',
    'Left Angle Cross of the Clarion':          '',
    'Left Angle Cross of Defiance':             '',
    'Left Angle Cross of Migration':            '',
    'Left Angle Cross':                         '',
  },
};

function getDesc(categoria, valor) {
  if (!valor || valor === '-') return '';
  const mapa = DESC[categoria] || {};
  // Busca direta
  if (mapa[valor] !== undefined) return mapa[valor];
  // Busca por correspondência parcial (útil para Cruz)
  const key = Object.keys(mapa).find(k => valor.includes(k) || k.includes(valor));
  return key !== undefined ? mapa[key] : '';
}

function getTipoObj(valor) {
  if (!valor) return null;
  const mapa = DESC.tipo || {};
  return mapa[valor] || null;
}

function traduzirCruz(v) {
  if (!v) return '-';
  return v
    .replace('Right Angle Cross of', 'Cruz de \u00c2ngulo Reto de')
    .replace('Left Angle Cross of', 'Cruz de \u00c2ngulo Esquerdo de')
    .replace('Juxtaposition Cross of', 'Cruz de Justaposi\u00e7\u00e3o de')
    .replace('Right Angle Cross', 'Cruz de \u00c2ngulo Reto')
    .replace('Left Angle Cross', 'Cruz de \u00c2ngulo Esquerdo')
    .replace('Juxtaposition Cross', 'Cruz de Justaposi\u00e7\u00e3o')
    .replace(' The ', ' ')
    .replace(' the ', ' ')
    .replace(' of ', ' da ')
    .replace(' Of ', ' da ');
}

// — BODYGRAPH API ———————————————————––
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

// — DADOS HD ——————————————————————
const PLANET_ORDER = ['Sun','Earth','North Node','South Node','Moon','Mercury',
'Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PLANET_PT  = {
'Sun':'Sol','Earth':'Terra','North Node':'N\u00f3 Norte','South Node':'N\u00f3 Sul',
'Moon':'Lua','Mercury':'Merc\u00fario','Venus':'V\u00eanus','Mars':'Marte',
'Jupiter':'J\u00fapiter','Saturn':'Saturno','Uranus':'Urano',
'Neptune':'Netuno','Pluto':'Plut\u00e3o',
};
const PLANET_SYM = {
'Sun':'\u2609','Earth':'\u2295','North Node':'\u260a','South Node':'\u260b',
'Moon':'\u263d','Mercury':'\u263f','Venus':'\u2640','Mars':'\u2642',
'Jupiter':'\u2643','Saturn':'\u2644','Uranus':'\u2645','Neptune':'\u2646','Pluto':'\u2647'
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

// — CENTROS: manipular SVG para colorir definidos (cinza) e abertos (branco) —
// A API retorna hd.DefinedCenters e hd.OpenCenters com nomes como "throat center", "ajna center" etc.
// O SVG do bodygraph usa IDs ou classes para os centros. Vamos mapear nomes da API para
// possiveis identificadores no SVG e trocar o fill.

// Mapeamento: nome da API -> possiveis IDs/textos no SVG
const CENTER_SVG_MAP = {
  'head center':        ['head', 'Head'],
  'ajna center':        ['ajna', 'Ajna', 'mind'],
  'throat center':      ['throat', 'Throat'],
  'g center':           ['g-center', 'gcenter', 'g_center', 'identity', 'Identity', 'self', 'Self', 'G Center', 'G-Center'],
  'heart center':       ['heart', 'Heart', 'ego', 'Ego', 'will', 'Will'],
  'sacral center':      ['sacral', 'Sacral'],
  'solar plexus center':['solar', 'Solar', 'solarplexus', 'solar-plexus', 'Solar Plexus', 'emotional', 'Emotional'],
  'splenic center':     ['spleen', 'Spleen', 'splenic', 'Splenic'],
  'root center':        ['root', 'Root'],
};

function colorirCentrosSVG(svg, definedCenters, openCenters) {
  if (!svg) return svg;

  const DEFINED_COLOR = '#C8C8C8';  // cinza para centros definidos (ativados)
  const OPEN_COLOR    = '#FFFFFF';  // branco para centros abertos (nao ativados)

  // Normaliza nomes para lowercase
  const definedSet = new Set((definedCenters || []).map(c => c.toLowerCase()));
  const openSet    = new Set((openCenters    || []).map(c => c.toLowerCase()));

  // Para cada centro, procurar no SVG elementos com id contendo o nome do centro
  // e trocar fill/style para a cor correta
  Object.entries(CENTER_SVG_MAP).forEach(([apiName, svgIds]) => {
    const isDefined = definedSet.has(apiName);
    const isOpen    = openSet.has(apiName);
    const targetColor = isDefined ? DEFINED_COLOR : (isOpen ? OPEN_COLOR : null);

    if (!targetColor) return; // Centro nao mencionado, nao mexer

    svgIds.forEach(svgId => {
      // Procurar por id="..." que contenha o svgId (case insensitive)
      // Regex para encontrar elementos com id contendo o nome do centro
      const idRegex = new RegExp(
        '(<[^>]*\\bid\\s*=\\s*["\'][^"\']*' + escapeRegex(svgId) + '[^"\']*["\'][^>]*)(fill\\s*=\\s*["\'][^"\']*["\'])',
        'gi'
      );
      svg = svg.replace(idRegex, function(match, before, fillAttr) {
        return before + 'fill="' + targetColor + '"';
      });

      // Tambem procurar por class contendo o nome
      const classRegex = new RegExp(
        '(<[^>]*\\bclass\\s*=\\s*["\'][^"\']*' + escapeRegex(svgId) + '[^"\']*["\'][^>]*)(fill\\s*=\\s*["\'][^"\']*["\'])',
        'gi'
      );
      svg = svg.replace(classRegex, function(match, before, fillAttr) {
        return before + 'fill="' + targetColor + '"';
      });
    });
  });

  return svg;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// — PDF ———————————————————————–
function buildPdf(nome, hd, planetas, portoes, canais, sv) {
return new Promise((resolve, reject) => {
const PDFDoc   = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const chunks   = [];

const doc = new PDFDoc({ size: 'A4', layout: 'landscape', margin: 0,
  info: { Title: 'Mapa de Desenho Humano', Author: 'Vida Autoral' } });

doc.on('data',  c => chunks.push(c));
doc.on('end',   () => resolve(Buffer.concat(chunks)));
doc.on('error', reject);

// Fonte com suporte unicode
const fontPath = require('path').join(process.cwd(), 'fonts', 'DejaVuSans.ttf');
doc.registerFont('DejaVu', fontPath);

const W = 841.89, H = 595.28;
const DIVIDER = 490;
const COL_W   = 72;
const PILL_H  = 20;
const PILL_W  = COL_W - 6;
const HEADER_H = 36;
const FOOTER_H = 20;
const PAD_TOP  = 20;   // margem superior do conteudo
const PAD_BOT  = 20;   // margem inferior do conteudo
const CONTENT_Y0 = HEADER_H + PAD_TOP;
const CONTENT_Y1 = H - FOOTER_H - PAD_BOT;
const AREA_H     = CONTENT_Y1 - CONTENT_Y0;
const CHART_X0 = COL_W;
const CHART_W  = DIVIDER - COL_W * 2;

// pdfkit: y=0 e topo (diferente do pdf-lib)

const props = hd.Properties || {};

// Paleta
const COFFEE    = '#9B7D61';
const PEACH     = '#DAA38F';
const EUCALYPT  = '#92ADA4';
const WHEAT     = '#E9D7C0';
const SALMON    = '#C7826F';   // design bg
const MINT      = '#7DAAA0';   // personality bg
const GRAY_LT   = '#F5F4F2';
const TEXT_DARK = '#2E2419';
const TEXT_MED  = '#6B5A4B';

// === FUNDO ===
doc.rect(0, 0, W, H).fill('#ffffff');

// === CABE\xc7ALHO ESQUERDO ===
doc.rect(0, 0, DIVIDER, HEADER_H).fill(WHEAT);
doc.font('DejaVu').fontSize(6.5).fillColor(SALMON)
   .text('DESIGN', 3, 14);
doc.font('DejaVu').fontSize(5.5).fillColor(MINT)
   .text('PERSONALITY', DIVIDER - COL_W + 3, 14);

// === PILLS PLANETAS ===
const pillStep = AREA_H / PLANET_ORDER.length;

planetas.forEach((p, i) => {
  const pillTop = CONTENT_Y0 + i * pillStep + (pillStep - PILL_H) / 2;

  // Design (esquerda)
  const dActive = p.design !== '-';
  doc.roundedRect(3, pillTop, PILL_W, PILL_H, 4)
     .fill(dActive ? SALMON : GRAY_LT);
  if (p.sym) {
    doc.font('DejaVu').fontSize(11).fillColor('#ffffff')
       .text(p.sym, 5, pillTop + 4, { lineBreak: false });
  }
  if (dActive) {
    doc.font('DejaVu').fontSize(8).fillColor('#ffffff')
       .text(p.design, 19, pillTop + 6, { lineBreak: false });
  }

  // Personality (direita)
  const prActive = p.pers !== '-';
  const px2 = DIVIDER - COL_W + 3;
  doc.roundedRect(px2, pillTop, PILL_W, PILL_H, 4)
     .fill(prActive ? MINT : GRAY_LT);
  if (p.sym) {
    doc.font('DejaVu').fontSize(11).fillColor('#ffffff')
       .text(p.sym, px2 + 2, pillTop + 4, { lineBreak: false });
  }
  if (prActive) {
    doc.font('DejaVu').fontSize(8).fillColor('#ffffff')
       .text(p.pers, px2 + 16, pillTop + 6, { lineBreak: false });
  }
});

// === GR\xc1FICO BODYGRAPH (SVG \u2192 PDF vetorial) ===
// FIX 1: Grafico 1.5x maior e centralizado entre as colunas planetarias
// FIX 2: Centros definidos = cinza, abertos = branco
const chartX = CHART_X0;
const chartY = CONTENT_Y0;
if (hd.SVG) {
  try {
    let svg = hd.SVG;

    // FIX 2: Colorir centros ANTES de inserir no PDF
    svg = colorirCentrosSVG(svg, hd.DefinedCenters || [], hd.OpenCenters || []);

    // Extrair viewBox (case-insensitive! A API retorna "viewbox" minusculo)
    const vb = svg.match(/viewbox=["']([^"']+)["']/i);
    let vbW = 400, vbH = 694;
    if (vb) {
      const parts = vb[1].trim().split(/[\s,]+/);
      vbW = parseFloat(parts[2]) || 400;
      vbH = parseFloat(parts[3]) || 694;
    }

    // FIX 1: Escala 1.5x maior que antes
    // Antes: Math.min(scaleX, scaleY) * 0.96 — agora: * 1.44 (= 0.96 * 1.5)
    // O grafico pode ultrapassar ligeiramente as colunas, mas fica
    // centralizado visualmente entre Design e Personality
    const scaleX = CHART_W / vbW;
    const scaleY = AREA_H / vbH;
    const baseScale = Math.min(scaleX, scaleY);
    const scale = baseScale * 1.20;
    const fitW = vbW * scale;
    const fitH = vbH * scale;

    // Centralizar: centro do grafico = centro entre as colunas
    const areaCenterX = (COL_W + (DIVIDER - COL_W)) / 2;
    const areaCenterY = H / 2;  // centro vertical da pagina
    // Offset manual para compensar conteudo visual nao-centrado dentro do viewBox
    // Positivo X = move para direita, negativo = move para esquerda
    // Positivo Y = move para baixo, negativo = move para cima
    // Ajustar empiricamente ate ficar visualmente centralizado
    const CHART_OFFSET_X = 38;
    const CHART_OFFSET_Y = 80;
    const cx = areaCenterX - fitW / 2 + CHART_OFFSET_X;
    const cy = areaCenterY - fitH / 2 + CHART_OFFSET_Y;

    // Usar transformacao do PDF
    doc.save();
    doc.translate(cx, cy);
    doc.scale(scale);
    // Remover width/height para que svg-to-pdfkit use viewBox puro
    svg = svg.replace(/<svg([^>]*)>/, function(m, attrs) {
      attrs = attrs.replace(/\s+width\s*=\s*["'][^"']*["']/gi, '');
      attrs = attrs.replace(/\s+height\s*=\s*["'][^"']*["']/gi, '');
      return '<svg' + attrs + '>';
    });
    SVGtoPDF(doc, svg, 0, 0);
    doc.restore();

    console.log('[PDF] Bodygraph: vb=' + vbW + 'x' + vbH + ' scale=' + scale.toFixed(3) + ' fit=' + fitW.toFixed(0) + 'x' + fitH.toFixed(0) + ' pos=(' + cx.toFixed(0) + ',' + cy.toFixed(0) + ')');
    console.log('[PDF] Layout: COL_W=' + COL_W + ' DIVIDER=' + DIVIDER + ' CHART_X0=' + CHART_X0 + ' CHART_W=' + CHART_W);
    console.log('[PDF] Center: areaCenterX=' + areaCenterX.toFixed(1) + ' areaCenterY=' + areaCenterY.toFixed(1));
    console.log('[PDF] SVG viewBox raw:', (hd.SVG.match(/viewbox=["']([^"']+)["']/i) || ['','none'])[1]);
    console.log('[PDF] Fit bounds: x=[' + cx.toFixed(1) + ' .. ' + (cx+fitW).toFixed(1) + '] y=[' + cy.toFixed(1) + ' .. ' + (cy+fitH).toFixed(1) + ']');
    console.log('[PDF] Page H=' + H + ' halfH=' + (H/2).toFixed(1));
    // Analisar bounding box visual real do SVG
    // Extrair todas coordenadas de cx, cy, x, y, x1, y1, x2, y2 de shapes
    var allX = [], allY = [];
    // circles: cx
    (hd.SVG.match(/\bcx=["']([^"']+)["']/gi) || []).forEach(function(m) {
      var v = parseFloat(m.replace(/cx=["']/i,''));
      if (!isNaN(v)) allX.push(v);
    });
    // circles: cy
    (hd.SVG.match(/\bcy=["']([^"']+)["']/gi) || []).forEach(function(m) {
      var v = parseFloat(m.replace(/cy=["']/i,''));
      if (!isNaN(v)) allY.push(v);
    });
    // rects and others: x, y
    (hd.SVG.match(/\bx=["']([^"']+)["']/gi) || []).forEach(function(m) {
      var v = parseFloat(m.replace(/x=["']/i,''));
      if (!isNaN(v)) allX.push(v);
    });
    (hd.SVG.match(/\by=["']([^"']+)["']/gi) || []).forEach(function(m) {
      var v = parseFloat(m.replace(/y=["']/i,''));
      if (!isNaN(v)) allY.push(v);
    });
    if (allX.length && allY.length) {
      var minX = Math.min.apply(null, allX), maxX = Math.max.apply(null, allX);
      var minY = Math.min.apply(null, allY), maxY = Math.max.apply(null, allY);
      var contentCenterX = (minX + maxX) / 2;
      var contentCenterY = (minY + maxY) / 2;
      var vbCenterX = vbW / 2;
      var vbCenterY = vbH / 2;
      console.log('[PDF] SVG content bbox: x=[' + minX.toFixed(1) + '..' + maxX.toFixed(1) + '] y=[' + minY.toFixed(1) + '..' + maxY.toFixed(1) + ']');
      console.log('[PDF] SVG content center: (' + contentCenterX.toFixed(1) + ',' + contentCenterY.toFixed(1) + ') vs viewBox center: (' + vbCenterX.toFixed(1) + ',' + vbCenterY.toFixed(1) + ')');
      console.log('[PDF] SVG offset needed: dx=' + (vbCenterX - contentCenterX).toFixed(1) + ' dy=' + (vbCenterY - contentCenterY).toFixed(1));
    }
  } catch(e) {
    console.error('[PDF] SVGtoPDF erro:', e.message);
  }
}

// === SETAS ===
// FIX 3: Todas as 4 setas no quadrante superior do grafico
// Duas linhas: tl/tr na primeira, bl/br na segunda (ambas no topo)
// Posicao X: entre a coluna planetaria e o centro do chart, mais proximo do centro
const arrowY1 = chartY + AREA_H * 0.06;   // primeira linha de setas
const arrowY2 = chartY + AREA_H * 0.12;   // segunda linha de setas
const chartCenterX = (COL_W + (DIVIDER - COL_W)) / 2;  // 245
const lgc   = COL_W + 30;              // 30px dentro da borda da coluna Design
const rgc   = (DIVIDER - COL_W) - 30;  // 30px dentro da borda da coluna Personality

function seta(cx, cy, dir, cor) {
  const W2=12, H2=5;
  doc.strokeColor(cor).lineWidth(2);
  if (dir==='right') {
    const tip = cx + W2/2;
    doc.moveTo(tip-W2, cy).lineTo(tip, cy).stroke();
    doc.moveTo(tip, cy).lineTo(tip-6, cy-H2).stroke();
    doc.moveTo(tip, cy).lineTo(tip-6, cy+H2).stroke();
  } else {
    const tip = cx - W2/2;
    doc.moveTo(tip+W2, cy).lineTo(tip, cy).stroke();
    doc.moveTo(tip, cy).lineTo(tip+6, cy-H2).stroke();
    doc.moveTo(tip, cy).lineTo(tip+6, cy+H2).stroke();
  }
}
// Linha 1: Digestion (tl) e Perspective (tr)
seta(lgc, arrowY1, sv.tl, SALMON);
seta(rgc, arrowY1, sv.tr, MINT);
// Linha 2: Environment (bl) e Awareness (br)
seta(lgc, arrowY2, sv.bl, SALMON);
seta(rgc, arrowY2, sv.br, MINT);

// === COLUNA DIREITA ===
const DX = DIVIDER + 14;
const DW = W - DIVIDER - 20;

// Cabe\xe7alho direito
doc.rect(DIVIDER, 0, W - DIVIDER, 56).fill(COFFEE);

// Logo tri\xe2ngulo
doc.strokeColor('#ffffff').lineWidth(1.5)
   .moveTo(DX, 46).lineTo(DX+20, 10).lineTo(DX+40, 46).closePath().stroke();

doc.font('DejaVu').fontSize(9).fillColor('#ffffff')
   .text('VIDA AUTORAL', DX+48, 20, { lineBreak: false });
doc.font('DejaVu').fontSize(6.5).fillColor(WHEAT)
   .text('MAPA DO DESENHO HUMANO', DX+48, 33, { lineBreak: false });

// Nome
const nomeDisplay = nome.length > 28 ? nome.slice(0,28)+'...' : nome;
doc.font('DejaVu').fontSize(11).fillColor(TEXT_DARK)
   .text(nomeDisplay.toUpperCase(), DX, 62, { lineBreak: false });

// Props - grid 2 colunas com descrições
const rawTipo       = props.Type && props.Type.id;
const rawEstrategia = props.Strategy && props.Strategy.id;
const rawAutoridade = props.InnerAuthority && props.InnerAuthority.id;
const rawPerfil     = (props.Profile && props.Profile.id) || null;
const rawDefinicao  = props.Definition && props.Definition.id;
const rawAssinatura = props.Signature && props.Signature.id;
const rawNaoSelf    = props.NotSelfTheme && props.NotSelfTheme.id;

const tipoObj = getTipoObj(rawTipo);

const CW2        = (DW / 2) - 5;
const TIPO_H     = 92;   // card full-width para Tipo (mais alto para caber tudo)
const CARD_H     = 68;
const ROW_H      = CARD_H + 6;
const CARDS_START_Y = 78;

// ── Card TIPO — largura total ──────────────────────────────────────────────
const tipoY = CARDS_START_Y;
doc.rect(DX, tipoY, DW, TIPO_H).fill(GRAY_LT);
doc.rect(DX, tipoY, DW, 3).fill(PEACH);

doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
   .text('TIPO', DX+4, tipoY+6, { lineBreak: false });

doc.font('DejaVu').fontSize(9).fillColor(TEXT_DARK)
   .text(tr(rawTipo) || '-', DX+4, tipoY+18, { lineBreak: false });

if (tipoObj) {
  doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
     .text(tipoObj.descricao, DX+4, tipoY+31, { width: DW - 8, lineBreak: true, ellipsis: true });

  const afterDesc = doc.y + 4;
  doc.font('DejaVu').fontSize(6.5).fillColor(COFFEE)
     .text('\u201C' + tipoObj.fraseIdentidade + '\u201D', DX+4, afterDesc, { width: DW - 8, lineBreak: true, ellipsis: true });
}

// ── Grid 2 colunas — demais campos ────────────────────────────────────────
const LABELS = [
  ['Estrat\u00e9gia',  tr(rawEstrategia),  getDesc('estrategia', rawEstrategia)],
  ['Autoridade',        tr(rawAutoridade),  getDesc('autoridade', rawAutoridade)],
  ['Perfil',            rawPerfil || '-',   getDesc('perfil',     rawPerfil)],
  ['Defini\u00e7\u00e3o', tr(rawDefinicao), getDesc('definicao',  rawDefinicao)],
  ['Assinatura',        tr(rawAssinatura),  getDesc('assinatura', rawAssinatura)],
  ['N\u00e3o-Self / Frustra\u00e7\u00e3o', tr(rawNaoSelf), getDesc('naoself', rawNaoSelf)],
];

const GRID_START_Y = tipoY + TIPO_H + 6;

LABELS.forEach(([label, val, desc], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const lx = DX + col * (CW2 + 5);
  const ly = GRID_START_Y + row * ROW_H;

  doc.rect(lx, ly, CW2, CARD_H).fill(GRAY_LT);
  doc.rect(lx, ly, CW2, 3).fill(PEACH);

  doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
     .text(label.toUpperCase(), lx+4, ly+6, { lineBreak: false });

  doc.font('DejaVu').fontSize(9).fillColor(TEXT_DARK)
     .text((val||'-').slice(0, 28), lx+4, ly+18, { lineBreak: false });

  if (desc) {
    doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
       .text(desc, lx+4, ly+31, { width: CW2 - 8, height: CARD_H - 33, lineBreak: true, ellipsis: true });
  }
});

// Cruz - largura total, traduzida, com descrição
const cruzRaw  = (props.IncarnationCross && props.IncarnationCross.id) || '-';
const cruzY    = GRID_START_Y + Math.ceil(LABELS.length / 2) * ROW_H;
const cruzVal  = traduzirCruz(cruzRaw);
const CRUZ_H   = 42;

doc.rect(DX, cruzY, DW, CRUZ_H).fill(GRAY_LT);
doc.rect(DX, cruzY, DW, 3).fill(PEACH);
doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
   .text('CRUZ DE ENCARNA\u00c7\u00c3O', DX+4, cruzY+6, { lineBreak: false });
doc.font('DejaVu').fontSize(9).fillColor(TEXT_DARK)
   .text(cruzVal, DX+4, cruzY+18, { width: DW - 8, lineBreak: false, ellipsis: true });

// Portões
let secY = cruzY + CRUZ_H + 8;
doc.font('DejaVu').fontSize(6).fillColor(COFFEE)
   .text('PORT\u00d5ES ATIVADOS', DX, secY);
let bx = DX, by2 = secY + 12;
portoes.slice().sort((a,b)=>a-b).forEach(g => {
  const lbl = String(g);
  const bw = lbl.length * 5.5 + 10;
  if (bx + bw > W - 10) { bx = DX; by2 += 16; }
  doc.roundedRect(bx, by2, bw, 13, 6).fill(EUCALYPT);
  doc.font('DejaVu').fontSize(7).fillColor('#ffffff')
     .text(lbl, bx+5, by2+2, { lineBreak: false });
  bx += bw + 4;
});

// Canais
let cy3 = by2 + 22;
doc.font('DejaVu').fontSize(6).fillColor(COFFEE)
   .text('CANAIS ATIVADOS', DX, cy3);
let cx3 = DX; cy3 += 12;
canais.forEach(c => {
  const lbl = String(c);
  const cw  = lbl.length * 5 + 10;
  if (cx3 + cw > W - 10) { cx3 = DX; cy3 += 16; }
  doc.roundedRect(cx3, cy3, cw, 13, 4).fill(WHEAT);
  doc.font('DejaVu').fontSize(7).fillColor(TEXT_MED)
     .text(lbl, cx3+5, cy3+2, { lineBreak: false });
  cx3 += cw + 4;
});

// Rodap\xe9
doc.font('DejaVu').fontSize(5.5).fillColor(TEXT_MED)
   .text('\u00a9 2026 Vida Autoral . Todos os direitos reservados', 300, H - FOOTER_H + 4, { lineBreak: false });

doc.end();

});
}

// — EMAIL HTML —————————————————————
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
+ '<div class="info">\ud83d\udcc5 ' + data + ' \u00b7 \ud83d\udd54 ' + hora + '<br>\ud83d\udccd ' + local + '</div>'
+ '<p style="font-size:.83rem;color:#9b836f">Com carinho,<br><strong>Equipe Vida Autoral</strong></p>'
+ '</div><div class="f">\u00a9 2026 Vida Autoral</div></div></body></html>';
}

function emailPdf(nome, data, hora, local, svgString) {
return '<!DOCTYPE html><html><head><meta charset="utf-8">' + CSS + '</head><body>'
+ '<div class="w"><div class="h">' + LOGO + '<h1>VIDA AUTORAL</h1></div>'
+ '<div class="b"><p>Ol\u00e1, <strong>' + nome + '</strong>!</p>'
+ '<p>Seu Mapa de Desenho Humano est\u00e1 pronto \ud83c\udf81 O PDF completo com seu gr\u00e1fico Bodygraph est\u00e1 em anexo.</p>'
+ '<div class="info">\ud83d\udcc5 ' + data + ' \u00b7 \ud83d\udd54 ' + hora + '<br>\ud83d\udccd ' + local + '</div>'
+ '<p>O PDF inclui: Tipo, Estrat\u00e9gia, Autoridade, Perfil, Defini\u00e7\u00e3o, planetas Design e Personalidade, setas do Variable, Port\u00f5es e Canais ativados.</p>'
+ (svgString ? '<div style="text-align:center;margin:16px 0;background:#fff;border-radius:8px;padding:10px"><p style="font-size:.75rem;color:#9b836f;margin:0 0 8px">Seu Bodygraph</p>' + svgString.replace('<svg', '<svg style="max-width:320px;height:auto;display:inline-block"') + '</div>' : '')
+ '<p style="font-size:.83rem;color:#9b836f">Com carinho,<br><strong>Equipe Vida Autoral</strong></p>'
+ '</div><div class="f">\u00a9 2026 Vida Autoral</div></div></body></html>';
}

// — RESEND —————————————————————––
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

// — PARSE BODY —————————————————————
async function parseBody(req) {
if (req.body && typeof req.body === 'object') return req.body;
return new Promise((resolve, reject) => {
let raw = '';
req.on('data', c => { raw += c; });
req.on('end',  () => { try { resolve(JSON.parse(raw||'{}')); } catch(e) { resolve({}); } });
req.on('error', reject);
});
}

// — HANDLER ——————————————————————
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
console.log('[4b] DefinedCenters:', JSON.stringify(hd.DefinedCenters));
console.log('[4c] OpenCenters:', JSON.stringify(hd.OpenCenters));

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
  emailPdf(nome, data, hora, local, hd && hd.SVG),
  [{ filename:'mapa-desenho-humano-'+primeiroNome+'.pdf', content:pdfBase64 }]
);
console.log('[6] PDF enviado com sucesso');

return res.status(200).json({ ok:true });

} catch(err) {
console.error('[Erro]', err.message);
return res.status(500).json({ error: err.message });
}
}
