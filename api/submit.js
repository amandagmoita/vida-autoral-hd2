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
      descricao:       'Você é multipotencial com energia ágil. Você responde, inicia e avança rápido — e seu caminho não precisa ser linear para ser poderoso.',
      fraseIdentidade: 'Na minha presença as pessoas se sentem elevadas e entusiasmadas. Tenho energia ágil e multipotencial para encontrar o caminho mais rápido ao resultado.',
    },
    'Manifesting Generator': {
      descricao:       'Você é multipotencial com energia ágil. Você responde, inicia e avança rápido — e seu caminho não precisa ser linear para ser poderoso.',
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
function buildPdf(nome, data, hora, local, hd, planetas, portoes, canais, sv) {
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

// === CABEÇALHO ESQUERDO — faixa alinhada com o header marrom (56px)
doc.rect(0, 0, DIVIDER, 56).fill(WHEAT);
// "DESIGN" e "PERSONALIDADE" 5px acima do início das pills
const labelY = CONTENT_Y0 - 5;
doc.font('DejaVu').fontSize(7).fillColor(SALMON)
   .text('DESIGN', 0, labelY, { width: COL_W, align: 'center', lineBreak: false });
doc.font('DejaVu').fontSize(7).fillColor(MINT)
   .text('PERSONALIDADE', DIVIDER - COL_W, labelY, { width: COL_W, align: 'center', lineBreak: false });

// === PILLS PLANETAS ===
// Espaçamento entre pills reduzido à metade: gap entre células = metade do original
const pillStep = PILL_H + (AREA_H / PLANET_ORDER.length - PILL_H) / 2;

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
    const scale = baseScale * 1.25;
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
// Eixo horizontal das setas alinhado com a linha central do documento (H/2)
// Linha 1 (Digestion/Perspective) acima do centro, linha 2 (Environment/Awareness) abaixo
const ARROW_GAP = 10;  // distância de cada linha ao centro
const arrowY1 = H / 2 - ARROW_GAP;   // acima do centro
const arrowY2 = H / 2 + ARROW_GAP;   // abaixo do centro
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

// Cabeçalho direito
doc.rect(DIVIDER, 0, W - DIVIDER, 56).fill(COFFEE);

// Logo SVG real (Vida Autoral — triângulo de linhas) + textos lado a lado
// Logo à esquerda, textos "VIDA AUTORAL" e "MAPA DO DESENHO HUMANO" à direita
// Bloco posicionado na margem esquerda do painel direito (DX), alinhado ao topo
const LOGO_SIZE = 36;
const LOGO_SCALE = LOGO_SIZE / 2000;
const LOGO_X = DX;         // margem esquerda do painel
const LOGO_Y = 10;
const TEXT_X = LOGO_X + LOGO_SIZE + 6;  // textos logo à direita do logo

doc.save();
doc.translate(LOGO_X, LOGO_Y);
doc.scale(LOGO_SCALE);
// Paths do logo (fill white)
doc.path('M495.008 541.153C532.838 540.453 572.702 541.02 610.683 541.009L835.063 540.986L1456.93 541.046C1452.5 550.534 1441.44 568.389 1435.88 577.988L1396.86 645.615L1268.67 866.177L1077.79 1196.82C1052.94 1239.79 1026.8 1286.99 1001.12 1329.18L994.755 1318.27L1016.44 1280.76C1042.45 1233.01 1073.89 1182.25 1101.12 1134.79L1313.87 766.311L1388.74 636.178C1402.02 613.342 1425.51 575.523 1436.72 552.474L514.426 552.506C523.03 570.276 536.867 591.461 546.571 609.749L535.211 612.319C526.893 597.837 518.483 583.408 509.981 569.034C505.249 560.95 498.114 549.693 495.008 541.153Z').fill('#ffffff');
doc.path('M555.399 640.08C604.571 639.723 653.744 639.78 702.914 640.251L919.63 640.254L1358.05 639.898C1355.7 643.703 1353.11 647.593 1350.68 651.372C1316.3 652.596 1273.66 651.416 1238.76 651.4L1017.04 651.408L456.756 653.341C462.072 664.311 471.807 680.157 478.072 691.12L523.976 770.694L672.956 1028.47L844.102 1323.84L888.012 1400.27C895.624 1413.69 909.736 1439.81 918.442 1450.84C925.488 1441.64 944.045 1407.75 950.819 1395.92L957.106 1406.67C946.814 1425.98 929.942 1454.89 918.364 1473.23C912.509 1465.48 895.622 1434.5 889.821 1424.51L828.691 1319.39L638.202 989.146L494.516 741.641L456.968 677.577C451.239 667.791 441.618 652.376 437.434 642.357C462.149 641.127 489.779 642.684 514.806 641.958C529.622 641.528 540.135 642.556 555.399 640.08Z').fill('#ffffff');
doc.path('M1431.47 640.059C1457.67 639.918 1485.49 639.647 1511.61 640.344C1502.37 658.63 1486.3 684.696 1475.63 702.693L1431.35 779.026L1267.16 1062.6L1114.24 1327.39L1061.83 1417.41C1051.84 1434.75 1041.05 1455.34 1030.32 1471.88C1019.8 1455.81 1010.36 1436.09 1000.46 1419.42L897.1 1241.59L591.619 714.378C587.134 706.851 582.773 699.249 578.539 691.577L591.334 691.22L896.992 1219.93L982.889 1367.62C993.498 1386.15 1018.41 1433.32 1030.62 1449.27C1036.14 1441.63 1043.73 1427.37 1048.76 1418.81L1093.57 1340.95L1253.6 1064.06C1326.66 937.665 1400.05 811.451 1472.73 684.838C1478.97 673.957 1486.05 662.885 1491.21 651.488L1423.36 651.469C1425.67 647.521 1428 642.862 1431.47 640.059Z').fill('#ffffff');
doc.restore();

// Textos à direita do logo, verticalmente centralizados no header de 36px
doc.font('DejaVu').fontSize(10).fillColor('#ffffff')
   .text('VIDA AUTORAL', TEXT_X, 17, { lineBreak: false });
doc.font('DejaVu').fontSize(6).fillColor(WHEAT)
   .text('MAPA DO DESENHO HUMANO', TEXT_X, 31, { lineBreak: false });

// Nome da pessoa
const nomeDisplay = nome.length > 28 ? nome.slice(0,28)+'...' : nome;
doc.font('DejaVu').fontSize(13).fillColor(TEXT_DARK)
   .text(nomeDisplay.toUpperCase(), DX, 60, { lineBreak: false });

// Dados de nascimento (local · hora)
doc.font('DejaVu').fontSize(7).fillColor(TEXT_MED)
   .text(local + '  \u00b7  ' + data + '  \u00b7  ' + hora, DX, 76, { lineBreak: false });

// Props - grid 2 colunas com descrições
const rawTipo       = props.Type && props.Type.id;
const rawEstrategia = props.Strategy && props.Strategy.id;
const rawAutoridade = props.InnerAuthority && props.InnerAuthority.id;
// Profile: API may return "6 / 3" or "6/3" — normalize to "6/3"
const rawPerfilRaw  = (props.Profile && props.Profile.id) || null;
const rawPerfil     = rawPerfilRaw ? rawPerfilRaw.replace(/\s/g, '') : null;
const rawDefinicao  = props.Definition && props.Definition.id;
const rawAssinatura = props.Signature && props.Signature.id;
const rawNaoSelf    = props.NotSelfTheme && props.NotSelfTheme.id;

const tipoObj = getTipoObj(rawTipo);

const COL_GAP     = 10;                      // espaço entre as duas colunas de cards
const CW2        = (DW / 2) - (COL_GAP / 2);
const TIPO_H     = 75;
const CARD_H     = 60;
const ROW_H      = CARD_H + 9;
const CARDS_START_Y = 92;   // espaço após nome + dados de nascimento

// ── Card TIPO — largura total ──────────────────────────────────────────────
const tipoY = CARDS_START_Y;
doc.roundedRect(DX, tipoY, DW, TIPO_H, 5).fill(GRAY_LT);

// Label categoria — pequeno, leve, espaçado
doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
   .text('TIPO', DX+6, tipoY+7, { lineBreak: false, characterSpacing: 1 });

// Valor principal — forte, destaque
doc.font('DejaVu').fontSize(11).fillColor(TEXT_DARK)
   .text(tr(rawTipo) || '-', DX+6, tipoY+17, { lineBreak: false });

if (tipoObj) {
  // Descrição — leve, com respiro acima
  doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
     .text(tipoObj.descricao, DX+6, tipoY+32, { width: DW - 12, lineBreak: true, ellipsis: true });

  const afterDesc = doc.y + 5;
  // Frase identidade — destaque sutil em COFFEE
  doc.font('DejaVu').fontSize(6.5).fillColor(COFFEE)
     .text('\u201C' + tipoObj.fraseIdentidade + '\u201D', DX+6, afterDesc, { width: DW - 12, lineBreak: true, ellipsis: true });
}

// ── Grid 2 colunas — demais campos ────────────────────────────────────────
const LABELS = [
  ['Estrat\u00e9gia',  tr(rawEstrategia),  getDesc('estrategia', rawEstrategia)],
  ['Autoridade',        tr(rawAutoridade),  getDesc('autoridade', rawAutoridade)],
  ['Perfil',            rawPerfilRaw || '-',   getDesc('perfil', rawPerfil)],
  ['Defini\u00e7\u00e3o', tr(rawDefinicao), getDesc('definicao',  rawDefinicao)],
  ['Assinatura',        tr(rawAssinatura),  getDesc('assinatura', rawAssinatura)],
  ['N\u00e3o-Self / Frustra\u00e7\u00e3o', tr(rawNaoSelf), getDesc('naoself', rawNaoSelf)],
];

const GRID_START_Y = tipoY + TIPO_H + 9;

LABELS.forEach(([label, val, desc], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const lx = DX + col * (CW2 + COL_GAP);
  const ly = GRID_START_Y + row * ROW_H;

  doc.roundedRect(lx, ly, CW2, CARD_H, 5).fill(GRAY_LT);

  // Label — pequeno, leve, espaçado
  doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
     .text(label.toUpperCase(), lx+6, ly+7, { lineBreak: false, characterSpacing: 0.8 });

  // Valor — forte, destaque
  doc.font('DejaVu').fontSize(10).fillColor(TEXT_DARK)
     .text((val||'-').slice(0, 28), lx+6, ly+17, { lineBreak: false });

  if (desc) {
    // Descrição — leve, com respiro acima
    doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
       .text(desc, lx+6, ly+31, { width: CW2 - 12, height: CARD_H - 33, lineBreak: true, ellipsis: true });
  }
});

// Cruz - largura total, traduzida, com descrição
const cruzRaw  = (props.IncarnationCross && props.IncarnationCross.id) || '-';
const cruzY    = GRID_START_Y + Math.ceil(LABELS.length / 2) * ROW_H;
const cruzVal  = traduzirCruz(cruzRaw);
const CRUZ_H   = 36;

doc.roundedRect(DX, cruzY, DW, CRUZ_H, 5).fill(GRAY_LT);
doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
   .text('CRUZ DE ENCARNA\u00c7\u00c3O', DX+6, cruzY+7, { lineBreak: false, characterSpacing: 0.8 });
doc.font('DejaVu').fontSize(10).fillColor(TEXT_DARK)
   .text(cruzVal, DX+6, cruzY+17, { width: DW - 12, lineBreak: false, ellipsis: true });

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

const pdfBytes  = await buildPdf(nome, data, hora, local, hd, planetas, portoes, canais, sv);
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
