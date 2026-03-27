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
      descricao:       'Sua energia é magnética — mas só quando seu corpo diz sim de verdade. Forçar um "sim" por obrigação? É aí que o esgotamento começa.',
      fraseIdentidade: 'Quando você segue o sim do seu corpo, algo muda: as pessoas ao redor se sentem mais vivas. Essa é sua assinatura — e ela transforma ambientes.',
    },
    'Manifested Generator': {
      descricao:       'Seu caminho não é linear — e isso não é defeito. Enquanto tentam te forçar a focar em "uma coisa só", você foi desenhada pra mudar de rota e chegar antes.',
      fraseIdentidade: 'Quando você para de se forçar a ser linear, algo acontece: as pessoas se sentem energizadas perto de você. Você encontra atalhos que ninguém vê.',
    },
    'Manifesting Generator': {
      descricao:       'Seu caminho não é linear — e isso não é defeito. Enquanto tentam te forçar a focar em "uma coisa só", você foi desenhada pra mudar de rota e chegar antes.',
      fraseIdentidade: 'Quando você para de se forçar a ser linear, algo acontece: as pessoas se sentem energizadas perto de você. Você encontra atalhos que ninguém vê.',
    },
    'Manifestor': {
      descricao:       'Algo em você faz as coisas acontecerem — sem pedir permissão. Mas existe um detalhe que separa o Manifestor admirado do Manifestor sozinho.',
      fraseIdentidade: 'Na sua presença, as pessoas sentem vontade de agir. Quando você honra seus impulsos E avisa antes, a resistência vira apoio. Tudo muda.',
    },
    'Projector': {
      descricao:       'Você enxerga o que ninguém vê — nos outros, nos sistemas, nos detalhes. Esse dom é raro. Mas tem uma armadilha que pega quase todo Projetor.',
      fraseIdentidade: 'Perto de você, as pessoas se sentem profundamente vistas. Você lê energia como ninguém. Seu papel não é correr junto — é guiar quem pede.',
    },
    'Reflector': {
      descricao:       'Menos de 1% tem seu design. Você sente tudo antes de qualquer palavra ser dita. Não é fragilidade — é um superpoder com manual próprio.',
      fraseIdentidade: 'Quando sua energia está limpa, as pessoas se veem através do seu reflexo como nunca antes. Você revela verdades que estavam escondidas.',
    },
  },
  estrategia: {
    'To Respond':              'Quanto mais você tenta iniciar, mais se esgota. Mas quando algo acende seu corpo? Ninguém te para.',
    'To Inform':               'Primeiro: espere a resposta do corpo. Depois: avise quem será impactado. Pular um cria o caos.',
    'To Initiate':             'Antes do impulso, avise quem será impactado. Esse gesto transforma resistência em portas abertas.',
    'Wait for the Invitation': 'Esperar o convite não é passividade — é se posicionar para que seu dom seja reconhecido e valorizado.',
    'Wait for a Lunar Cycle':  'Suas maiores decisões pedem 28 dias. Não é indecisão — é sabedoria. A clareza vem com o tempo certo.',
    'Wait a Lunar Cycle':      'Suas maiores decisões pedem 28 dias. Não é indecisão — é sabedoria. A clareza vem com o tempo certo.',
  },
  autoridade: {
    'Sacral':                   'Esqueça os prós e contras. Aquele "hm-hm" interno é o sim mais confiável que existe. O "uhn-uhn"? Te protege de caminhos errados.',
    'Emotional':                'Suas piores decisões vieram no auge de uma emoção forte. A clareza mora do outro lado da onda.',
    'Emotional - Solar Plexus': 'Suas piores decisões vieram no auge de uma emoção forte. A clareza mora do outro lado da onda.',
    'Splenic':                  'Aquele instinto que aparece num flash — e quando você ignora, se arrepende? Essa é sua bússola. Confie nela.',
    'Ego':                      'Se seu coração não está de verdade, você não vai até o fim. Sua vontade genuína é o guia, não o dever.',
    'Ego Manifestor':           'Se seu coração não está de verdade, você não vai até o fim. Sua vontade genuína é o guia, não o dever.',
    'Self-Projected':           'Sua clareza não mora na mente — mora na voz. Fale em voz alta. A verdade aparece no que você diz.',
    'Mental':                   'Você não decide no calor do momento — e isso não é fraqueza. Durma, mude de ambiente. A clareza vem.',
    'No Authority':             'Você não decide no calor do momento — e isso não é fraqueza. Durma, mude de ambiente. A clareza vem.',
    'Lunar':                    'Suas maiores decisões pedem 28 dias. Enquanto outros erram por pressa, você acerta por paciência.',
  },
  perfil: {
    '1/3': 'Você não aprende por teoria — aprende mergulhando fundo e errando. Cada erro é um dado que te torna única.',
    '1/4': 'Conhecimento profundo + confiança de quem te conhece. Seu impacto é cirúrgico, não viral.',
    '2/4': 'Seus dons chamam atenção naturalmente — mesmo quando prefere ficar quieta. Honre os dois lados.',
    '2/5': 'As pessoas enxergam em você a solução que precisam — sem você se oferecer. Isso é dom, não acaso.',
    '3/5': 'Seu caminho parece bagunçado por fora. Por dentro? Cada erro virou autoridade vivida. Isso inspira.',
    '3/6': 'Sua vida tem três atos: vivência intensa, observação e sabedoria. Você se torna modelo pelo que viveu.',
    '4/6': 'Você influencia pela proximidade e pelo exemplo. Sua rede de confiança é seu maior ativo — vira referência.',
    '4/1': 'Relacionamentos são sua alavanca — os que funcionam vêm de base sólida e confiança mútua. Aí o impacto explode.',
    '5/1': 'As pessoas projetam em você a solução que precisam. O que sustenta essa expectativa não é carisma — é preparo.',
    '5/2': 'Genialidade natural + projeção de todos. Seu equilíbrio: brilhe quando chamada, recolha-se pra renovar.',
    '6/2': 'Três fases: experimentar tudo, observar do alto, descer com sabedoria. Você vira modelo que outros seguem.',
    '6/3': 'Ninguém te ensinou nos livros — a vida te ensinou na prática. Essa vivência te torna referência real.',
  },
  definicao: {
    'Single Definition':      'Sua energia é um bloco coeso — consistente, menos dependente dos outros. Você já tem dentro de si o que busca fora.',
    'Split Definition':       'Certas pessoas te fazem sentir mais inteira — não é dependência, é mecânica. Saber quem "liga" seu circuito muda tudo.',
    'Triple Split Definition':'Três partes da sua energia funcionam separadas. Precisa de mais conexões pra se sentir integrada — e tudo bem.',
    'Quadruple Split':        'Ambiente e pessoas te moldam mais que a maioria. Não é instabilidade — é sensibilidade. Onde você está te define.',
    'No Definition':          'Sua energia é totalmente fluida. Escolher bem seu entorno é a decisão mais importante da sua vida.',
  },
  assinatura: {
    'Satisfaction': 'Alinhada, você não sente euforia — sente solidez. Satisfação de saber que o que faz importa. É esse o sinal.',
    'Success':      'Seu sucesso não é forçado — é reconhecido. Quando o convite chega, tudo flui. Esse é o caminho certo.',
    'Peace':        'Avise antes de agir — e veja a resistência sumir. Paz é sua assinatura. E ela muda tudo ao redor.',
    'Surprise':     'Quando está alinhada, a vida te surpreende de formas que não planejou. Se a surpresa sumiu, algo precisa mudar.',
  },
  naoself: {
    'Frustration':    'Frustrada? Não é "não ser boa o suficiente". É ter dito sim quando seu corpo dizia não. É GPS, não sentença.',
    'Anger':          'Raiva frequente não é defeito — é aviso. Você agiu sem comunicar. Ajuste a comunicação, não a si mesma.',
    'Bitterness':     'Sente que ninguém valoriza o que faz? Observe: ofereceu sem ser convidada? Seu valor é real — espere o convite.',
    'Disappointment': 'Decepção frequente? Pergunte: decidi rápido demais? Estou no lugar certo? Seu design pede mais tempo.',
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
    'Left Angle Cross of Separation':           '',
    'Left Angle Cross of Demands':              '',
    'Left Angle Cross of Masks':                '',
    'Left Angle Cross of Incarnation':          '',
    'Left Angle Cross of Alignment':            '',
    'Left Angle Cross of Education':            '',
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
  if (mapa[valor] !== undefined) return mapa[valor];
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

  const DEFINED_COLOR = '#C8C8C8';
  const OPEN_COLOR    = '#FFFFFF';

  const definedSet = new Set((definedCenters || []).map(c => c.toLowerCase()));
  const openSet    = new Set((openCenters    || []).map(c => c.toLowerCase()));

  Object.entries(CENTER_SVG_MAP).forEach(([apiName, svgIds]) => {
    const isDefined = definedSet.has(apiName);
    const isOpen    = openSet.has(apiName);
    const targetColor = isDefined ? DEFINED_COLOR : (isOpen ? OPEN_COLOR : null);

    if (!targetColor) return;

    svgIds.forEach(svgId => {
      const idRegex = new RegExp(
        '(<[^>]*\\bid\\s*=\\s*["\'][^"\']*' + escapeRegex(svgId) + '[^"\']*["\'][^>]*)(fill\\s*=\\s*["\'][^"\']*["\'])',
        'gi'
      );
      svg = svg.replace(idRegex, function(match, before, fillAttr) {
        return before + 'fill="' + targetColor + '"';
      });

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

const fontPath = require('path').join(process.cwd(), 'fonts', 'DejaVuSans.ttf');
doc.registerFont('DejaVu', fontPath);

const W = 841.89, H = 595.28;
const DIVIDER = 490;
const COL_W   = 72;
const PILL_H  = 20;
const PILL_W  = COL_W - 6;
const HEADER_H = 41.4;
const FOOTER_H = 20;
const PAD_TOP  = 30;
const PAD_BOT  = 20;
const CONTENT_Y0 = HEADER_H + PAD_TOP;
const CONTENT_Y1 = H - FOOTER_H - PAD_BOT;
const AREA_H     = CONTENT_Y1 - CONTENT_Y0;
const CHART_X0 = COL_W;
const CHART_W  = DIVIDER - COL_W * 2;

const props = hd.Properties || {};

const COFFEE    = '#9B7D61';
const PEACH     = '#DAA38F';
const EUCALYPT  = '#92ADA4';
const WHEAT     = '#E9D7C0';
const SALMON    = '#C7826F';
const MINT      = '#7DAAA0';
const GRAY_LT   = '#F5F4F2';
const TEXT_DARK = '#2E2419';
const TEXT_MED  = '#6B5A4B';

doc.rect(0, 0, W, H).fill('#ffffff');

doc.rect(0, 0, DIVIDER, 64.4).fill(WHEAT);

const LOGO_SIZE = 21.165;
const LOGO_VB_W = 237.7;
const LOGO_VB_H = 204.8;
const LOGO_X = 10;
const LOGO_SCALE = LOGO_SIZE / LOGO_VB_H;
const LOGO_RENDER_W = LOGO_VB_W * LOGO_SCALE;
const LOGO_Y = 32.01 - LOGO_SIZE / 2;
const TEXT_X_HDR = LOGO_X + LOGO_RENDER_W + 8;

const LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="130.9 152.0 237.7 204.8">'
  + '<path fill="' + COFFEE + '" d="M142.405 152.52C151.92 152.039 165.173 152.42 174.981 152.422L236.611 152.432L314.743 152.431C328.203 152.43 343.15 152.088 356.483 152.509C354.808 156.741 352.265 160.165 349.989 164.067C348.253 167.044 346.565 170.05 344.831 173.034L318.228 218.611L276.955 289.203L265.017 309.681C262.355 314.267 259.825 318.919 256.848 323.298C254.997 319.411 253.687 319.347 256.01 315.144L324.575 197.707C329.203 189.678 333.876 181.676 338.596 173.701C341.81 168.246 344.986 163.088 347.964 157.489L150 157.482C152.452 160.913 154.682 164.84 156.554 168.614C155.403 168.708 151.975 169.117 151.432 168.466C149.082 165.65 142.766 155.641 142.405 152.52Z"/>'
  + '<path fill="' + COFFEE + '" d="M351.345 174.796C354.065 174.489 365.579 174.747 368.614 174.834C365.768 180.642 361.518 187.034 358.141 192.706C351.982 203.06 345.882 213.449 339.84 223.872L288.55 311.615C279.773 326.578 270.734 341.723 262.138 356.788C258.643 351.045 255.289 344.95 251.813 339.134L189.817 234.06C182.18 221.192 174.394 207.152 166.431 194.638C164.409 191.401 162.657 188.569 161.115 185.053C164.643 184.635 165.955 184.069 168.018 187.429C170.791 191.945 173.43 196.545 176.11 201.118L190.636 225.654L245.29 318.625L254.717 334.652C257.533 339.509 258.747 342.474 262.382 346.886C265.167 340.866 268.027 336.737 271.339 331.097L285.711 306.49L333.522 224.746L350.348 196.118C353.628 190.509 356.854 185.448 359.787 179.633C356.416 179.79 351.01 179.533 347.418 179.526C348.529 177.15 348.882 175.785 351.345 174.796Z"/>'
  + '<path fill="' + COFFEE + '" d="M158.881 174.873L264.701 174.666C278.921 174.77 293.141 174.8 307.361 174.755C315.263 174.762 323.166 174.905 331.064 174.738C328.021 179.25 329.806 179.67 323.158 179.724C318.88 179.759 314.455 179.592 310.18 179.591L285.336 179.695L207.965 179.707L162.471 179.684C155.847 179.679 145.365 179.974 138.938 179.549C140.839 183.586 143.332 187.438 145.653 191.257C148.519 195.986 151.358 200.732 154.169 205.494L186.272 260.112L222.663 321.648C224.828 325.362 227.046 329.045 229.318 332.695C232.322 337.458 235.301 341.663 237.477 346.905C238.746 344.948 242.085 339.304 243.261 337.947L243.673 337.997C244.923 338.931 245.375 340.407 245.949 341.839C244.924 345.229 239.687 352.76 237.725 356.763C236.91 354.882 235.872 353.092 234.874 351.303C227.798 338.622 219.946 326.394 212.571 313.889L151.536 210.65L138.424 188.541C136.166 184.76 132.368 178.925 130.931 175.05C133.294 174.863 136.011 175.07 138.444 175.005C145.192 174.824 152.175 175.156 158.881 174.873Z"/>'
  + '</svg>';

SVGtoPDF(doc, LOGO_SVG, LOGO_X, LOGO_Y, { width: LOGO_RENDER_W, height: LOGO_SIZE });

doc.font('DejaVu').fontSize(12.65).fillColor(COFFEE)
   .text('VIDA AUTORAL', TEXT_X_HDR, 20.7, { lineBreak: false, characterSpacing: 1 });
doc.font('DejaVu').fontSize(6.325).fillColor(TEXT_MED)
   .text('MAPA DO DESENHO HUMANO', TEXT_X_HDR, 37, { lineBreak: false, characterSpacing: 1 });

const pillStepBase = PILL_H + (AREA_H / PLANET_ORDER.length - PILL_H) / 2;
const pillStep = pillStepBase * 1.144;
const pillsTotalH = PLANET_ORDER.length * pillStep;
const pillsStartY = H / 2 - pillsTotalH / 2 + 10;

const labelY = pillsStartY - 5;
doc.font('DejaVu').fontSize(7).fillColor(SALMON)
   .text('DESIGN', 0, labelY, { width: COL_W, align: 'center', lineBreak: false });
doc.font('DejaVu').fontSize(7).fillColor(MINT)
   .text('PERSONALIDADE', DIVIDER - COL_W, labelY, { width: COL_W, align: 'center', lineBreak: false });

planetas.forEach((p, i) => {
  const pillTop = pillsStartY + i * pillStep + (pillStep - PILL_H) / 2;

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

const chartX = CHART_X0;
const chartY = CONTENT_Y0;
if (hd.SVG) {
  try {
    let svg = hd.SVG;

    svg = colorirCentrosSVG(svg, hd.DefinedCenters || [], hd.OpenCenters || []);

    const vb = svg.match(/viewbox=["']([^"']+)["']/i);
    let vbW = 400, vbH = 694;
    if (vb) {
      const parts = vb[1].trim().split(/[\s,]+/);
      vbW = parseFloat(parts[2]) || 400;
      vbH = parseFloat(parts[3]) || 694;
    }

    const scaleX = CHART_W / vbW;
    const scaleY = AREA_H / vbH;
    const baseScale = Math.min(scaleX, scaleY);
    const scale = baseScale * 1.20;
    const fitW = vbW * scale;
    const fitH = vbH * scale;

    const areaCenterX = (COL_W + (DIVIDER - COL_W)) / 2;
    const areaCenterY = H / 2;
    const CHART_OFFSET_X = 38;
    const CHART_OFFSET_Y = 90;
    const cx = areaCenterX - fitW / 2 + CHART_OFFSET_X;
    const cy = areaCenterY - fitH / 2 + CHART_OFFSET_Y;

    doc.save();
    doc.translate(cx, cy);
    doc.scale(scale);
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
    var allX = [], allY = [];
    (hd.SVG.match(/\bcx=["']([^"']+)["']/gi) || []).forEach(function(m) {
      var v = parseFloat(m.replace(/cx=["']/i,''));
      if (!isNaN(v)) allX.push(v);
    });
    (hd.SVG.match(/\bcy=["']([^"']+)["']/gi) || []).forEach(function(m) {
      var v = parseFloat(m.replace(/cy=["']/i,''));
      if (!isNaN(v)) allY.push(v);
    });
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

const arrowY1 = chartY + AREA_H * 0.06 + 30;
const arrowY2 = chartY + AREA_H * 0.12 + 30;
const chartCenterX = (COL_W + (DIVIDER - COL_W)) / 2;
const lgc   = COL_W + 30;
const rgc   = (DIVIDER - COL_W) - 30;

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
seta(lgc, arrowY1, sv.tl, SALMON);
seta(rgc, arrowY1, sv.tr, MINT);
seta(lgc, arrowY2, sv.bl, SALMON);
seta(rgc, arrowY2, sv.br, MINT);

const DX = DIVIDER + 14;
const DW = W - DIVIDER - 20;

doc.rect(DIVIDER, 0, W - DIVIDER, 64.4).fill(COFFEE);

const nomeDisplay = nome.length > 28 ? nome.slice(0,28)+'...' : nome;
doc.font('DejaVu').fontSize(14.95).fillColor('#ffffff')
   .text(nomeDisplay.toUpperCase(), DX, 19.3, { lineBreak: false, characterSpacing: 1 });

doc.font('DejaVu').fontSize(6.9).fillColor(WHEAT)
   .text(local + '  \u00b7  ' + data + '  \u00b7  ' + hora, DX, 38, { lineBreak: false, characterSpacing: 1 });

const rawTipo       = props.Type && props.Type.id;
const rawEstrategia = props.Strategy && props.Strategy.id;
const rawAutoridade = props.InnerAuthority && props.InnerAuthority.id;
const rawPerfilRaw  = (props.Profile && props.Profile.id) || null;
const rawPerfil     = rawPerfilRaw ? rawPerfilRaw.replace(/\s/g, '') : null;
const rawDefinicao  = props.Definition && props.Definition.id;
const rawAssinatura = props.Signature && props.Signature.id;
const rawNaoSelf    = props.NotSelfTheme && props.NotSelfTheme.id;

const tipoObj = getTipoObj(rawTipo);

const COL_GAP     = 10;
const CW2        = (DW / 2) - (COL_GAP / 2);
const TIPO_H     = 75;
const CARD_H     = 60;
const ROW_H      = CARD_H + 9;
const CARDS_START_Y = 95;

const tipoY = CARDS_START_Y;
doc.roundedRect(DX, tipoY, DW, TIPO_H, 5).fill(GRAY_LT);

doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
   .text('TIPO', DX+6, tipoY+7, { lineBreak: false, characterSpacing: 1 });

doc.font('DejaVu').fontSize(11).fillColor(TEXT_DARK)
   .text(tr(rawTipo) || '-', DX+6, tipoY+17, { lineBreak: false });

if (tipoObj) {
  doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
     .text(tipoObj.descricao, DX+6, tipoY+32, { width: DW - 12, lineBreak: true, ellipsis: true });

  const afterDesc = doc.y + 5;
  doc.font('DejaVu').fontSize(6.5).fillColor(COFFEE)
     .text('\u201C' + tipoObj.fraseIdentidade + '\u201D', DX+6, afterDesc, { width: DW - 12, lineBreak: true, ellipsis: true });
}

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

  doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
     .text(label.toUpperCase(), lx+6, ly+7, { lineBreak: false, characterSpacing: 1 });

  doc.font('DejaVu').fontSize(10).fillColor(TEXT_DARK)
     .text((val||'-').slice(0, 28), lx+6, ly+17, { lineBreak: false });

  if (desc) {
    doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
       .text(desc, lx+6, ly+31, { width: CW2 - 12, height: CARD_H - 33, lineBreak: true, ellipsis: true });
  }
});

const cruzRaw  = (props.IncarnationCross && props.IncarnationCross.id) || '-';
const cruzY    = GRID_START_Y + Math.ceil(LABELS.length / 2) * ROW_H;
const cruzVal  = traduzirCruz(cruzRaw);
const CRUZ_H   = 36;

doc.roundedRect(DX, cruzY, DW, CRUZ_H, 5).fill(GRAY_LT);
doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
   .text('CRUZ DE ENCARNA\u00c7\u00c3O', DX+6, cruzY+7, { lineBreak: false, characterSpacing: 1 });
doc.font('DejaVu').fontSize(10).fillColor(TEXT_DARK)
   .text(cruzVal, DX+6, cruzY+17, { width: DW - 12, lineBreak: false, ellipsis: true });

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
  const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 500 500"><path fill="white" d="M142.405 152.52C151.92 152.039 165.173 152.42 174.981 152.422L236.611 152.432L314.743 152.431C328.203 152.43 343.15 152.088 356.483 152.509C354.808 156.741 352.265 160.165 349.989 164.067C348.253 167.044 346.565 170.05 344.831 173.034L318.228 218.611L276.955 289.203L265.017 309.681C262.355 314.267 259.825 318.919 256.848 323.298C254.997 319.411 253.687 319.347 256.01 315.144L324.575 197.707C329.203 189.678 333.876 181.676 338.596 173.701C341.81 168.246 344.986 163.088 347.964 157.489L150 157.482C152.452 160.913 154.682 164.84 156.554 168.614C155.403 168.708 151.975 169.117 151.432 168.466C149.082 165.65 142.766 155.641 142.405 152.52Z"/><path fill="white" d="M351.345 174.796C354.065 174.489 365.579 174.747 368.614 174.834C365.768 180.642 361.518 187.034 358.141 192.706C351.982 203.06 345.882 213.449 339.84 223.872L288.55 311.615C279.773 326.578 270.734 341.723 262.138 356.788C258.643 351.045 255.289 344.95 251.813 339.134L189.817 234.06C182.18 221.192 174.394 207.152 166.431 194.638C164.409 191.401 162.657 188.569 161.115 185.053C164.643 184.635 165.955 184.069 168.018 187.429C170.791 191.945 173.43 196.545 176.11 201.118L190.636 225.654L245.29 318.625L254.717 334.652C257.533 339.509 258.747 342.474 262.382 346.886C265.167 340.866 268.027 336.737 271.339 331.097L285.711 306.49L333.522 224.746L350.348 196.118C353.628 190.509 356.854 185.448 359.787 179.633C356.416 179.79 351.01 179.533 347.418 179.526C348.529 177.15 348.882 175.785 351.345 174.796Z"/><path fill="white" d="M158.881 174.873L264.701 174.666C278.921 174.77 293.141 174.8 307.361 174.755C315.263 174.762 323.166 174.905 331.064 174.738C328.021 179.25 329.806 179.67 323.158 179.724C318.88 179.759 314.455 179.592 310.18 179.591L285.336 179.695L207.965 179.707L162.471 179.684C155.847 179.679 145.365 179.974 138.938 179.549C140.839 183.586 143.332 187.438 145.653 191.257C148.519 195.986 151.358 200.732 154.169 205.494L186.272 260.112L222.663 321.648C224.828 325.362 227.046 329.045 229.318 332.695C232.322 337.458 235.301 341.663 237.477 346.905C238.746 344.948 242.085 339.304 243.261 337.947L243.673 337.997C244.923 338.931 245.375 340.407 245.949 341.839C244.924 345.229 239.687 352.76 237.725 356.763C236.91 354.882 235.872 353.092 234.874 351.303C227.798 338.622 219.946 326.394 212.571 313.889L151.536 210.65L138.424 188.541C136.166 184.76 132.368 178.925 130.931 175.05C133.294 174.863 136.011 175.07 138.444 175.005C145.192 174.824 152.175 175.156 158.881 174.873Z"/></svg>';

function emailConfirmacao(nome, data, hora, local, telefone) {
return '<!DOCTYPE html><html><head><meta charset="utf-8">' + CSS + '</head><body>'
+ '<div class="w"><div class="h">' + LOGO + '<h1>VIDA AUTORAL</h1></div>'
+ '<div class="b"><p>Ol\u00e1, <strong>' + nome + '</strong>!</p>'
+ '<p>Recebemos seus dados. Seu mapa est\u00e1 sendo gerado e chegar\u00e1 em breve.</p>'
+ '<div class="info">\ud83d\udcc5 ' + data + ' \u00b7 \ud83d\udd54 ' + hora + '<br>\ud83d\udccd ' + local + (telefone ? '<br>\ud83d\udcf1 ' + telefone : '') + '</div>'
+ '<p style="font-size:.83rem;color:#9b836f">Com carinho,<br><strong>Equipe Vida Autoral</strong></p>'
+ '</div><div class="f">\u00a9 2026 Vida Autoral</div></div></body></html>';
}

function emailPdf(nome, data, hora, local, telefone) {
return '<!DOCTYPE html><html><head><meta charset="utf-8">' + CSS + '</head><body>'
+ '<div class="w"><div class="h">' + LOGO + '<h1>VIDA AUTORAL</h1></div>'
+ '<div class="b"><p>Ol\u00e1, <strong>' + nome + '</strong>!</p>'
+ '<p>Seu Mapa de Desenho Humano est\u00e1 pronto \ud83c\udf81 O PDF completo com seu gr\u00e1fico Bodygraph est\u00e1 em anexo.</p>'
+ '<div class="info">\ud83d\udcc5 ' + data + ' \u00b7 \ud83d\udd54 ' + hora + '<br>\ud83d\udccd ' + local + (telefone ? '<br>\ud83d\udcf1 ' + telefone : '') + '</div>'
+ '<p>O PDF inclui: Tipo, Estrat\u00e9gia, Autoridade, Perfil, Defini\u00e7\u00e3o, planetas Design e Personalidade, setas do Variable, Port\u00f5es e Canais ativados.</p>'
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
const { nome, email, telefone, data, hora, local } = body;
if (!nome||!email||!data||!hora||!local)
return res.status(400).json({ error:'Todos os campos sao obrigatorios.' });

try {
console.log('[1] Iniciando para', email, '| tel:', telefone || 'n/a');
await sendEmail(email, nome+', recebemos seus dados \u2605', emailConfirmacao(nome,data,hora,local,telefone));
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
  emailPdf(nome, data, hora, local, telefone),
  [{ filename:'mapa-desenho-humano-'+primeiroNome+'.pdf', content:pdfBase64 }]
);
console.log('[6] PDF enviado com sucesso');

// — MONTAR PAYLOAD PARA A PÁGINA DE RESULTADO ————————
const props = hd.Properties || {};

// Helper: extrai string de uma propriedade que pode ser string, objeto com .id, ou objeto com .label
function extractStr(prop) {
  if (!prop) return null;
  if (typeof prop === 'string') return prop;
  if (typeof prop === 'object') {
    // tenta as chaves mais comuns em ordem de prioridade
    return prop.id || prop.label || prop.name || prop.value || prop.type || null;
  }
  return String(prop);
}

const tipoId       = extractStr(props.Type);
const estrategiaId = extractStr(props.Strategy);
// A API usa InnerAuthority, não Authority
const autoridadeId = extractStr(props.InnerAuthority) || extractStr(props.Authority);
const perfilId     = extractStr(props.Profile);
const definicaoId  = extractStr(props.Definition);
const assinaturaId = extractStr(props.Signature);
// A API usa NotSelfTheme, não NotSelf
const naoselfId    = extractStr(props.NotSelfTheme) || extractStr(props.NotSelf);
const cruzRaw      = props.IncarnationCross
  ? (typeof props.IncarnationCross === 'string'
      ? props.IncarnationCross
      : (props.IncarnationCross.label || props.IncarnationCross.id || ''))
  : '';

console.log('[payload] tipo:', tipoId, '| estrategia:', estrategiaId, '| autoridade:', autoridadeId, '| perfil:', perfilId);
console.log('[payload] props.InnerAuthority raw:', JSON.stringify(props.InnerAuthority));
console.log('[payload] props.Authority raw:', JSON.stringify(props.Authority));

// SVG colorido com centros definidos/abertos
const svgColorido = colorirCentrosSVG(hd.SVG || '', hd.DefinedCenters || [], hd.OpenCenters || []);

const mapaPayload = {
  nome,
  data,
  hora,
  local,
  svg: svgColorido,
  tipo:      { id: tipoId, label: tr(tipoId), desc: getDesc('tipo', tipoId), frase: (getTipoObj(tipoId)||{}).fraseIdentidade || '' },
  estrategia:{ id: estrategiaId, label: tr(estrategiaId), desc: getDesc('estrategia', estrategiaId) },
  autoridade:{ id: autoridadeId, label: tr(autoridadeId), desc: getDesc('autoridade', autoridadeId) },
  perfil:    { id: perfilId, label: perfilId, desc: getDesc('perfil', perfilId) },
  definicao: { id: definicaoId, label: tr(definicaoId), desc: getDesc('definicao', definicaoId) },
  assinatura:{ id: assinaturaId, label: tr(assinaturaId), desc: getDesc('assinatura', assinaturaId) },
  naoself:   { id: naoselfId, label: tr(naoselfId), desc: getDesc('naoself', naoselfId) },
  cruz:      traduzirCruz(cruzRaw),
  planetas,
  portoes:   portoes.sort((a,b) => a-b),
  canais,
  setas:     sv,
};

return res.status(200).json({ ok:true, mapa: mapaPayload });

} catch(err) {
console.error('[Erro]', err.message);
return res.status(500).json({ error: err.message });
}
}
