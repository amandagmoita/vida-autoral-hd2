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
'Split Definition':'Defini\u00e7\u00e3o Bipartida',
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
  cruz: {},
};

function getDesc(categoria, valor) {
  if (!valor || valor === '-') return '';
  var mapa = DESC[categoria] || {};
  if (mapa[valor] !== undefined) return mapa[valor];
  var key = Object.keys(mapa).find(function(k) { return valor.includes(k) || k.includes(valor); });
  return key !== undefined ? mapa[key] : '';
}

function getTipoObj(valor) {
  if (!valor) return null;
  var mapa = DESC.tipo || {};
  return mapa[valor] || null;
}

// — TRADUÇÃO DE CRUZES DE ENCARNAÇÃO ————————————————————
// Dicionário de nomes temáticos das cruzes (EN → PT-BR)
// Referência: Genetic Matrix (geneticmatrix.com/pt-pt)
var CRUZ_NOMES = {
  // ── Ângulo Direito (16 nomes temáticos) ──
  'the Sphinx':             'da Esfinge',
  'Sphinx':                 'da Esfinge',
  'Explanation':            'da Explica\u00e7\u00e3o',
  'Contagion':              'do Cont\u00e1gio',
  'the Sleeping Phoenix':   'da F\u00eanix Adormecida',
  'Sleeping Phoenix':       'da F\u00eanix Adormecida',
  'Planning':               'do Planejamento',
  'Consciousness':          'da Consci\u00eancia',
  'the Rulebook':           'da Reg\u00eancia',
  'Rulebook':               'da Reg\u00eancia',
  'Eden':                   'do \u00c9den',
  'the Vessel of Love':     'da Embarca\u00e7\u00e3o do Amor',
  'Vessel of Love':         'da Embarca\u00e7\u00e3o do Amor',
  'Service':                'do Servi\u00e7o',
  'Tension':                'da Tens\u00e3o',
  'Penetration':            'da Penetra\u00e7\u00e3o',
  'Maya':                   'de Maia',
  'Laws':                   'das Leis',
  'the Unexpected':         'do Inesperado',
  'Unexpected':             'do Inesperado',
  'the Four Ways':          'dos Quatro Caminhos',
  'Four Ways':              'dos Quatro Caminhos',

  // ── Ângulo Esquerdo (32 nomes temáticos) ──
  'Masks':              'das M\u00e1scaras',
  'Revolution':         'da Revolu\u00e7\u00e3o',
  'Industry':           'da Ind\u00fastria',
  'Spirit':             'do Esp\u00edrito',
  'Migration':          'da Migra\u00e7\u00e3o',
  'Dominion':           'do Dom\u00ednio',
  'Informing':          'de Informar',
  'Plane':              'do Avi\u00e3o',
  'Healing':            'da Cura',
  'Upheaval':           'da Agita\u00e7\u00e3o',
  'Endeavor':           'do Esfor\u00e7o',
  'Clarion':            'do Clarion',
  'Limitation':         'da Limita\u00e7\u00e3o',
  'Wishes':             'dos Desejos',
  'Alignment':          'do Alinhamento',
  'Incarnation':        'da Encarna\u00e7\u00e3o',
  'Defiance':           'do Desafio',
  'Dedication':         'da Dedica\u00e7\u00e3o',
  'Uncertainty':        'da Incerteza',
  'Duality':            'da Dualidade',
  'Identification':     'da Identifica\u00e7\u00e3o',
  'Separation':         'da Separa\u00e7\u00e3o',
  'Confrontation':      'do Confronto',
  'Education':          'da Educa\u00e7\u00e3o',
  'Prevention':         'da Preven\u00e7\u00e3o',
  'Demands':            'das Demandas',
  'Individualism':      'do Individualismo',
  'Cycles':             'dos Ciclos',
  'Obscuration':        'da Obscura\u00e7\u00e3o',
  'Distraction':        'da Distra\u00e7\u00e3o',
  'the Alpha':          'do Alfa',
  'Alpha':              'do Alfa',
  'Refinement':         'do Refinamento',

  // ── Justaposição (nomes extras) ──
  'Fates':              'dos Destinos',
  'Listening':          'da Escuta',
  'Possession':         'da Posse',
  'Austerity':          'da Austeridade',
  'Contribution':       'da Contribui\u00e7\u00e3o',
  'Power':              'do Poder',
  'Habits':             'dos H\u00e1bitos',
  'Assimilation':       'da Assimila\u00e7\u00e3o',
  'Experimentation':    'da Experimenta\u00e7\u00e3o',
  'Shock':              'do Choque',
  'Caring':             'do Cuidado',
  'Crisis':             'da Crise',
  'Alertness':          'do Alerta',
  'Innocence':          'da Inoc\u00eancia',
  'Formulization':      'da Formaliza\u00e7\u00e3o',
  'Depth':              'da Profundidade',
  'Retreat':            'do Retiro',
  'Oppression':         'da Opress\u00e3o',
  'Provocation':        'da Provoca\u00e7\u00e3o',
  'Beginnings':         'dos Come\u00e7os',
  'Fantasy':            'da Fantasia',
  'Articulation':       'da Articula\u00e7\u00e3o',
  'Duration':           'da Dura\u00e7\u00e3o',
  'Grace':              'da Gra\u00e7a',
  'Completion':         'da Conclus\u00e3o',
  'Stillness':          'da Quietude',
  'Ambition':           'da Ambi\u00e7\u00e3o',
  'Influence':          'da Influ\u00eancia',
  'Serendipity':        'da Serendipidade',
  'Nourishment':        'da Nutri\u00e7\u00e3o',
  'Mutation':           'da Muta\u00e7\u00e3o',
  'Principles':         'dos Princ\u00edpios',
  'Need':               'da Necessidade',
  'Complexities':       'das Complexidades',
  'Interaction':        'da Intera\u00e7\u00e3o',
  'Correction':         'da Corre\u00e7\u00e3o',
  'Insight':            'do Insight',
  'Opinions':           'das Opini\u00f5es',
  'Contrariness':       'da Contrariedade',
  'Rationalization':    'da Racionaliza\u00e7\u00e3o',
  'Transitoriness':     'da Transitoriedade',
  'Extremes':           'dos Extremos',
  'Abundance':          'da Abund\u00e2ncia',
  'Interference':       'da Interfer\u00eancia',
  'Focus':              'do Foco',
  'Bargains':           'das Barganhas',
  'Struggle':           'da Luta',
  'Confusion':          'da Confus\u00e3o',
  'Strategy':           'da Estrat\u00e9gia',
  'Thinking':           'do Pensamento',
  'Detail':             'do Detalhe',
  'Conflict':           'do Conflito',
  'Progress':           'do Progresso',
  'Disputing':          'da Disputa',
  'Caution':            'da Cautela',
  'Risking':            'do Risco',
  'Endeavour':          'do Esfor\u00e7o',
  'Values':             'dos Valores',
  'Nurturing':          'da Nutri\u00e7\u00e3o',
  'Opposition':         'da Oposi\u00e7\u00e3o',
  'Sensitivity':        'da Sensibilidade',
  'Alerting':           'do Alerta',
  'Vessel':             'da Embarca\u00e7\u00e3o',
};

function traduzirCruz(v) {
  if (!v) return '-';

  var resultado = v;

  // Traduzir prefixos (ordem importa: mais específico primeiro)
  // Os nomes em CRUZ_NOMES já incluem o artigo (da/do/das/dos/de)
  resultado = resultado
    .replace('Right Angle Cross of the ', 'Cruz de \u00c2ngulo Reto ')
    .replace('Right Angle Cross of ',     'Cruz de \u00c2ngulo Reto ')
    .replace('Left Angle Cross of the ',  'Cruz de \u00c2ngulo Esquerdo ')
    .replace('Left Angle Cross of ',      'Cruz de \u00c2ngulo Esquerdo ')
    .replace('Juxtaposition Cross of the ','Cruz de Justaposi\u00e7\u00e3o ')
    .replace('Juxtaposition Cross of ',   'Cruz de Justaposi\u00e7\u00e3o ')
    .replace('Right Angle Cross',         'Cruz de \u00c2ngulo Reto')
    .replace('Left Angle Cross',          'Cruz de \u00c2ngulo Esquerdo')
    .replace('Juxtaposition Cross',       'Cruz de Justaposi\u00e7\u00e3o');

  // Traduzir nome temático — varrer do mais longo pro mais curto
  // para evitar substituição parcial (ex: "Vessel of Love" antes de "Vessel")
  // Usa word-boundary para não re-substituir dentro de texto já traduzido
  var chaves = Object.keys(CRUZ_NOMES).sort(function(a, b) { return b.length - a.length; });
  chaves.forEach(function(en) {
    var regex = new RegExp('\\b' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    if (regex.test(resultado)) {
      resultado = resultado.replace(regex, CRUZ_NOMES[en]);
    }
  });

  // Limpar artigos residuais em inglês
  resultado = resultado
    .replace(' The ', ' ')
    .replace(' the ', ' ');

  return resultado;
}

// — BODYGRAPH API ———————————————————––
async function resolveTimezone(city) {
var url = BODYGRAPH_BASE + '/v210502/locations?api_key=' + BODYGRAPH_API_KEY
+ '&query=' + encodeURIComponent(city);
var res = await fetch(url);
if (!res.ok) throw new Error('Locations API: ' + res.status);
var data = await res.json();
if (!data || !data.length) throw new Error('Cidade nao encontrada: ' + city);
return data[0].timezone;
}

async function fetchHDData(date, hora, timezone) {
var url = BODYGRAPH_BASE + '/v221006/hd-data?api_key=' + BODYGRAPH_API_KEY
+ '&date=' + encodeURIComponent(date + ' ' + hora)
+ '&timezone=' + encodeURIComponent(timezone)
+ '&design=Leo';
var res = await fetch(url);
if (!res.ok) throw new Error('HD Data API: ' + res.status);
return res.json();
}

// — DADOS HD ——————————————————————
var PLANET_ORDER = ['Sun','Earth','North Node','South Node','Moon','Mercury',
'Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
var PLANET_PT  = {
'Sun':'Sol','Earth':'Terra','North Node':'N\u00f3 Norte','South Node':'N\u00f3 Sul',
'Moon':'Lua','Mercury':'Merc\u00fario','Venus':'V\u00eanus','Mars':'Marte',
'Jupiter':'J\u00fapiter','Saturn':'Saturno','Uranus':'Urano',
'Neptune':'Netuno','Pluto':'Plut\u00e3o',
};
var PLANET_SYM = {
'Sun':'\u2609','Earth':'\u2295','North Node':'\u260a','South Node':'\u260b',
'Moon':'\u263d','Mercury':'\u263f','Venus':'\u2640','Mars':'\u2642',
'Jupiter':'\u2643','Saturn':'\u2644','Uranus':'\u2645','Neptune':'\u2646','Pluto':'\u2647'
};

function extrairPlanetas(hd) {
var pers   = hd.Personality || {};
var design = hd.Design      || {};
return PLANET_ORDER.map(function(name) {
return {
name: name, pt: PLANET_PT[name]||name, sym: PLANET_SYM[name]||'',
pers:   pers[name]   && pers[name].Gate   ? pers[name].Gate   + '.' + pers[name].Line   : '-',
design: design[name] && design[name].Gate  ? design[name].Gate + '.' + design[name].Line : '-',
};
});
}

function extrairPortoesCanais(hd) {
var portoes = [];
if (hd.ActiveGates && hd.ActiveGates.length) {
portoes = hd.ActiveGates.map(Number);
} else {
var seen = {};
var add = function(side) { Object.values(side).forEach(function(p) {
if (p && p.Gate && !seen[p.Gate]) { seen[p.Gate]=true; portoes.push(+p.Gate); }
}); };
if (hd.Personality) add(hd.Personality);
if (hd.Design) add(hd.Design);
}
var canais = [];
var raw = hd.ActiveChannels || hd.Channels || hd.channels || [];
console.log('[canais] raw type:', typeof raw, 'length:', raw.length, 'sample:', JSON.stringify(raw[0]));
raw.forEach(function(c) {
if (typeof c === 'string') canais.push(c);
else if (c && c.id) canais.push(String(c.id));
else if (c && c.Gate1 && c.Gate2) canais.push(c.Gate1 + '-' + c.Gate2);
else if (c && c.gate1 && c.gate2) canais.push(c.gate1 + '-' + c.gate2);
else canais.push(JSON.stringify(c));
});
return { portoes: portoes, canais: canais };
}

function getSetas(hd) {
var v = hd.Variables || {};
return { tl:v.Digestion||'left', tr:v.Perspective||'left', bl:v.Environment||'left', br:v.Awareness||'left' };
}

var CENTER_SVG_MAP = {
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

  var DEFINED_COLOR = '#C8C8C8';
  var OPEN_COLOR    = '#FFFFFF';

  var definedSet = new Set((definedCenters || []).map(function(c) { return c.toLowerCase(); }));
  var openSet    = new Set((openCenters    || []).map(function(c) { return c.toLowerCase(); }));

  Object.entries(CENTER_SVG_MAP).forEach(function(entry) {
    var apiName = entry[0];
    var svgIds  = entry[1];
    var isDefined = definedSet.has(apiName);
    var isOpen    = openSet.has(apiName);
    var targetColor = isDefined ? DEFINED_COLOR : (isOpen ? OPEN_COLOR : null);

    if (!targetColor) return;

    svgIds.forEach(function(svgId) {
      var idRegex = new RegExp(
        '(<[^>]*\\bid\\s*=\\s*["\'][^"\']*' + escapeRegex(svgId) + '[^"\']*["\'][^>]*)(fill\\s*=\\s*["\'][^"\']*["\'])',
        'gi'
      );
      svg = svg.replace(idRegex, function(match, before, fillAttr) {
        return before + 'fill="' + targetColor + '"';
      });

      var classRegex = new RegExp(
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
return new Promise(function(resolve, reject) {
var PDFDoc   = require('pdfkit');
var SVGtoPDF = require('svg-to-pdfkit');
var chunks   = [];

var doc = new PDFDoc({ size: 'A4', layout: 'landscape', margin: 0,
  info: { Title: 'Mapa de Desenho Humano', Author: 'Vida Autoral' } });

doc.on('data',  function(c) { chunks.push(c); });
doc.on('end',   function() { resolve(Buffer.concat(chunks)); });
doc.on('error', reject);

var fontPath = require('path').join(process.cwd(), 'fonts', 'DejaVuSans.ttf');
doc.registerFont('DejaVu', fontPath);

var W = 841.89, H = 595.28;
var DIVIDER = 490;
var COL_W   = 72;
var PILL_H  = 20;
var PILL_W  = COL_W - 6;
var HEADER_H = 41.4;
var FOOTER_H = 20;
var PAD_TOP  = 30;
var PAD_BOT  = 20;
var CONTENT_Y0 = HEADER_H + PAD_TOP;
var CONTENT_Y1 = H - FOOTER_H - PAD_BOT;
var AREA_H     = CONTENT_Y1 - CONTENT_Y0;
var CHART_X0 = COL_W;
var CHART_W  = DIVIDER - COL_W * 2;

var props = hd.Properties || {};

var COFFEE    = '#9B7D61';
var PEACH     = '#DAA38F';
var EUCALYPT  = '#92ADA4';
var WHEAT     = '#E9D7C0';
var SALMON    = '#C7826F';
var MINT      = '#7DAAA0';
var GRAY_LT   = '#F5F4F2';
var TEXT_DARK = '#2E2419';
var TEXT_MED  = '#6B5A4B';

doc.rect(0, 0, W, H).fill('#ffffff');

doc.rect(0, 0, DIVIDER, 64.4).fill(WHEAT);

var LOGO_SIZE = 21.165;
var LOGO_VB_W = 237.7;
var LOGO_VB_H = 204.8;
var LOGO_X = 10;
var LOGO_SCALE = LOGO_SIZE / LOGO_VB_H;
var LOGO_RENDER_W = LOGO_VB_W * LOGO_SCALE;
var LOGO_Y = 32.01 - LOGO_SIZE / 2;
var TEXT_X_HDR = LOGO_X + LOGO_RENDER_W + 8;

var LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="130.9 152.0 237.7 204.8">'
  + '<path fill="' + COFFEE + '" d="M142.405 152.52C151.92 152.039 165.173 152.42 174.981 152.422L236.611 152.432L314.743 152.431C328.203 152.43 343.15 152.088 356.483 152.509C354.808 156.741 352.265 160.165 349.989 164.067C348.253 167.044 346.565 170.05 344.831 173.034L318.228 218.611L276.955 289.203L265.017 309.681C262.355 314.267 259.825 318.919 256.848 323.298C254.997 319.411 253.687 319.347 256.01 315.144L324.575 197.707C329.203 189.678 333.876 181.676 338.596 173.701C341.81 168.246 344.986 163.088 347.964 157.489L150 157.482C152.452 160.913 154.682 164.84 156.554 168.614C155.403 168.708 151.975 169.117 151.432 168.466C149.082 165.65 142.766 155.641 142.405 152.52Z"/>'
  + '<path fill="' + COFFEE + '" d="M351.345 174.796C354.065 174.489 365.579 174.747 368.614 174.834C365.768 180.642 361.518 187.034 358.141 192.706C351.982 203.06 345.882 213.449 339.84 223.872L288.55 311.615C279.773 326.578 270.734 341.723 262.138 356.788C258.643 351.045 255.289 344.95 251.813 339.134L189.817 234.06C182.18 221.192 174.394 207.152 166.431 194.638C164.409 191.401 162.657 188.569 161.115 185.053C164.643 184.635 165.955 184.069 168.018 187.429C170.791 191.945 173.43 196.545 176.11 201.118L190.636 225.654L245.29 318.625L254.717 334.652C257.533 339.509 258.747 342.474 262.382 346.886C265.167 340.866 268.027 336.737 271.339 331.097L285.711 306.49L333.522 224.746L350.348 196.118C353.628 190.509 356.854 185.448 359.787 179.633C356.416 179.79 351.01 179.533 347.418 179.526C348.529 177.15 348.882 175.785 351.345 174.796Z"/>'
  + '<path fill="' + COFFEE + '" d="M158.881 174.873L264.701 174.666C278.921 174.77 293.141 174.8 307.361 174.755C315.263 174.762 323.166 174.905 331.064 174.738C328.021 179.25 329.806 179.67 323.158 179.724C318.88 179.759 314.455 179.592 310.18 179.591L285.336 179.695L207.965 179.707L162.471 179.684C155.847 179.679 145.365 179.974 138.938 179.549C140.839 183.586 143.332 187.438 145.653 191.257C148.519 195.986 151.358 200.732 154.169 205.494L186.272 260.112L222.663 321.648C224.828 325.362 227.046 329.045 229.318 332.695C232.322 337.458 235.301 341.663 237.477 346.905C238.746 344.948 242.085 339.304 243.261 337.947L243.673 337.997C244.923 338.931 245.375 340.407 245.949 341.839C244.924 345.229 239.687 352.76 237.725 356.763C236.91 354.882 235.872 353.092 234.874 351.303C227.798 338.622 219.946 326.394 212.571 313.889L151.536 210.65L138.424 188.541C136.166 184.76 132.368 178.925 130.931 175.05C133.294 174.863 136.011 175.07 138.444 175.005C145.192 174.824 152.175 175.156 158.881 174.873Z"/>'
  + '</svg>';

SVGtoPDF(doc, LOGO_SVG, LOGO_X, LOGO_Y, { width: LOGO_RENDER_W, height: LOGO_SIZE });

doc.font('DejaVu').fontSize(12.65).fillColor(COFFEE)
   .text('VIDA AUTORAL', TEXT_X_HDR, 20.7, { lineBreak: false, characterSpacing: 1 });
doc.font('DejaVu').fontSize(6.325).fillColor(TEXT_MED)
   .text('MAPA DO DESENHO HUMANO', TEXT_X_HDR, 37, { lineBreak: false, characterSpacing: 1 });

var pillStepBase = PILL_H + (AREA_H / PLANET_ORDER.length - PILL_H) / 2;
var pillStep = pillStepBase * 1.144;
var pillsTotalH = PLANET_ORDER.length * pillStep;
var pillsStartY = H / 2 - pillsTotalH / 2 + 10;

var labelY = pillsStartY - 5;
doc.font('DejaVu').fontSize(7).fillColor(SALMON)
   .text('DESIGN', 0, labelY, { width: COL_W, align: 'center', lineBreak: false });
doc.font('DejaVu').fontSize(7).fillColor(MINT)
   .text('PERSONALIDADE', DIVIDER - COL_W, labelY, { width: COL_W, align: 'center', lineBreak: false });

planetas.forEach(function(p, i) {
  var pillTop = pillsStartY + i * pillStep + (pillStep - PILL_H) / 2;

  var dActive = p.design !== '-';
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

  var prActive = p.pers !== '-';
  var px2 = DIVIDER - COL_W + 3;
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

var chartX = CHART_X0;
var chartY = CONTENT_Y0;
if (hd.SVG) {
  try {
    var svg = hd.SVG;

    svg = colorirCentrosSVG(svg, hd.DefinedCenters || [], hd.OpenCenters || []);

    var vb = svg.match(/viewbox=["']([^"']+)["']/i);
    var vbW = 400, vbH = 694;
    if (vb) {
      var parts = vb[1].trim().split(/[\s,]+/);
      vbW = parseFloat(parts[2]) || 400;
      vbH = parseFloat(parts[3]) || 694;
    }

    var scaleX = CHART_W / vbW;
    var scaleY = AREA_H / vbH;
    var baseScale = Math.min(scaleX, scaleY);
    var scale = baseScale * 1.20;
    var fitW = vbW * scale;
    var fitH = vbH * scale;

    var areaCenterX = (COL_W + (DIVIDER - COL_W)) / 2;
    var areaCenterY = H / 2;
    var CHART_OFFSET_X = 38;
    var CHART_OFFSET_Y = 90;
    var cx = areaCenterX - fitW / 2 + CHART_OFFSET_X;
    var cy = areaCenterY - fitH / 2 + CHART_OFFSET_Y;

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

var arrowY1 = chartY + AREA_H * 0.06 + 30;
var arrowY2 = chartY + AREA_H * 0.12 + 30;
var chartCenterX = (COL_W + (DIVIDER - COL_W)) / 2;
var lgc   = COL_W + 30;
var rgc   = (DIVIDER - COL_W) - 30;

function seta(cx, cy, dir, cor) {
  var W2=12, H2=5;
  doc.strokeColor(cor).lineWidth(2);
  if (dir==='right') {
    var tip = cx + W2/2;
    doc.moveTo(tip-W2, cy).lineTo(tip, cy).stroke();
    doc.moveTo(tip, cy).lineTo(tip-6, cy-H2).stroke();
    doc.moveTo(tip, cy).lineTo(tip-6, cy+H2).stroke();
  } else {
    var tip = cx - W2/2;
    doc.moveTo(tip+W2, cy).lineTo(tip, cy).stroke();
    doc.moveTo(tip, cy).lineTo(tip+6, cy-H2).stroke();
    doc.moveTo(tip, cy).lineTo(tip+6, cy+H2).stroke();
  }
}
seta(lgc, arrowY1, sv.tl, SALMON);
seta(rgc, arrowY1, sv.tr, MINT);
seta(lgc, arrowY2, sv.bl, SALMON);
seta(rgc, arrowY2, sv.br, MINT);

var DX = DIVIDER + 14;
var DW = W - DIVIDER - 20;

doc.rect(DIVIDER, 0, W - DIVIDER, 64.4).fill(COFFEE);

var nomeDisplay = nome.length > 28 ? nome.slice(0,28)+'...' : nome;
doc.font('DejaVu').fontSize(14.95).fillColor('#ffffff')
   .text(nomeDisplay.toUpperCase(), DX, 19.3, { lineBreak: false, characterSpacing: 1 });

doc.font('DejaVu').fontSize(6.9).fillColor(WHEAT)
   .text(local + '  \u00b7  ' + data + '  \u00b7  ' + hora, DX, 38, { lineBreak: false, characterSpacing: 1 });

var rawTipo       = props.Type && props.Type.id;
var rawEstrategia = props.Strategy && props.Strategy.id;
var rawAutoridade = props.InnerAuthority && props.InnerAuthority.id;
var rawPerfilRaw  = (props.Profile && props.Profile.id) || null;
var rawPerfil     = rawPerfilRaw ? rawPerfilRaw.replace(/\s/g, '') : null;
var rawDefinicao  = props.Definition && props.Definition.id;
var rawAssinatura = props.Signature && props.Signature.id;
var rawNaoSelf    = props.NotSelfTheme && props.NotSelfTheme.id;

var tipoObj = getTipoObj(rawTipo);

var COL_GAP     = 10;
var CW2        = (DW / 2) - (COL_GAP / 2);
var TIPO_H     = 75;
var CARD_H     = 60;
var ROW_H      = CARD_H + 9;
var CARDS_START_Y = 95;

var tipoY = CARDS_START_Y;
doc.roundedRect(DX, tipoY, DW, TIPO_H, 5).fill(GRAY_LT);

doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
   .text('TIPO', DX+6, tipoY+7, { lineBreak: false, characterSpacing: 1 });

doc.font('DejaVu').fontSize(11).fillColor(TEXT_DARK)
   .text(tr(rawTipo) || '-', DX+6, tipoY+17, { lineBreak: false });

if (tipoObj) {
  doc.font('DejaVu').fontSize(6.5).fillColor(TEXT_MED)
     .text(tipoObj.descricao, DX+6, tipoY+32, { width: DW - 12, lineBreak: true, ellipsis: true });

  var afterDesc = doc.y + 5;
  doc.font('DejaVu').fontSize(6.5).fillColor(COFFEE)
     .text('\u201C' + tipoObj.fraseIdentidade + '\u201D', DX+6, afterDesc, { width: DW - 12, lineBreak: true, ellipsis: true });
}

var LABELS = [
  ['Estrat\u00e9gia',  tr(rawEstrategia),  getDesc('estrategia', rawEstrategia)],
  ['Autoridade',        tr(rawAutoridade),  getDesc('autoridade', rawAutoridade)],
  ['Perfil',            rawPerfilRaw || '-',   getDesc('perfil', rawPerfil)],
  ['Defini\u00e7\u00e3o', tr(rawDefinicao), getDesc('definicao',  rawDefinicao)],
  ['Assinatura',        tr(rawAssinatura),  getDesc('assinatura', rawAssinatura)],
  ['Sinal de Desalinhamento', tr(rawNaoSelf), getDesc('naoself', rawNaoSelf)],
];

var GRID_START_Y = tipoY + TIPO_H + 9;

LABELS.forEach(function(item, i) {
  var label = item[0], val = item[1], desc = item[2];
  var col = i % 2;
  var row = Math.floor(i / 2);
  var lx = DX + col * (CW2 + COL_GAP);
  var ly = GRID_START_Y + row * ROW_H;

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

var cruzRaw  = (props.IncarnationCross && props.IncarnationCross.id) || '-';
var cruzY    = GRID_START_Y + Math.ceil(LABELS.length / 2) * ROW_H;
var cruzVal  = traduzirCruz(cruzRaw);
var CRUZ_H   = 36;

doc.roundedRect(DX, cruzY, DW, CRUZ_H, 5).fill(GRAY_LT);
doc.font('DejaVu').fontSize(6).fillColor(TEXT_MED)
   .text('CRUZ DE ENCARNA\u00c7\u00c3O', DX+6, cruzY+7, { lineBreak: false, characterSpacing: 1 });
doc.font('DejaVu').fontSize(10).fillColor(TEXT_DARK)
   .text(cruzVal, DX+6, cruzY+17, { width: DW - 12, lineBreak: false, ellipsis: true });

var secY = cruzY + CRUZ_H + 8;
doc.font('DejaVu').fontSize(6).fillColor(COFFEE)
   .text('PORT\u00d5ES ATIVADOS', DX, secY);
var bx = DX, by2 = secY + 12;
portoes.slice().sort(function(a,b){return a-b;}).forEach(function(g) {
  var lbl = String(g);
  var bw = lbl.length * 5.5 + 10;
  if (bx + bw > W - 10) { bx = DX; by2 += 16; }
  doc.roundedRect(bx, by2, bw, 13, 6).fill(EUCALYPT);
  doc.font('DejaVu').fontSize(7).fillColor('#ffffff')
     .text(lbl, bx+5, by2+2, { lineBreak: false });
  bx += bw + 4;
});

var cy3 = by2 + 22;
doc.font('DejaVu').fontSize(6).fillColor(COFFEE)
   .text('CANAIS ATIVADOS', DX, cy3);
var cx3 = DX; cy3 += 12;
canais.forEach(function(c) {
  var lbl = String(c);
  var cw  = lbl.length * 5 + 10;
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
var CSS = '<style>'
+ 'body{margin:0;background:#f5f0eb;font-family:Georgia,serif}'
+ '.w{max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden}'
+ '.h{background:#9B7D61;padding:24px 32px;display:flex;align-items:center;gap:14px}'
+ '.h h1{color:#fff;margin:0;font-size:18px;letter-spacing:2px;font-weight:400}'
+ '.b{padding:28px 32px}'
+ '.b p{color:#2E2419;line-height:1.7;font-size:15px}'
+ '.info{background:#FEF3E8;border-left:3px solid #DAA38F;padding:12px 16px;border-radius:0 8px 8px 0;margin:18px 0;font-size:14px;color:#6B5A4B}'
+ '.f{background:#F6F4F2;padding:14px 32px;text-align:center;font-size:11px;color:#9B7D61}'
+ '</style>';
  var LOGO = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 500 500"><path fill="white" d="M142.405 152.52C151.92 152.039 165.173 152.42 174.981 152.422L236.611 152.432L314.743 152.431C328.203 152.43 343.15 152.088 356.483 152.509C354.808 156.741 352.265 160.165 349.989 164.067C348.253 167.044 346.565 170.05 344.831 173.034L318.228 218.611L276.955 289.203L265.017 309.681C262.355 314.267 259.825 318.919 256.848 323.298C254.997 319.411 253.687 319.347 256.01 315.144L324.575 197.707C329.203 189.678 333.876 181.676 338.596 173.701C341.81 168.246 344.986 163.088 347.964 157.489L150 157.482C152.452 160.913 154.682 164.84 156.554 168.614C155.403 168.708 151.975 169.117 151.432 168.466C149.082 165.65 142.766 155.641 142.405 152.52Z"/><path fill="white" d="M351.345 174.796C354.065 174.489 365.579 174.747 368.614 174.834C365.768 180.642 361.518 187.034 358.141 192.706C351.982 203.06 345.882 213.449 339.84 223.872L288.55 311.615C279.773 326.578 270.734 341.723 262.138 356.788C258.643 351.045 255.289 344.95 251.813 339.134L189.817 234.06C182.18 221.192 174.394 207.152 166.431 194.638C164.409 191.401 162.657 188.569 161.115 185.053C164.643 184.635 165.955 184.069 168.018 187.429C170.791 191.945 173.43 196.545 176.11 201.118L190.636 225.654L245.29 318.625L254.717 334.652C257.533 339.509 258.747 342.474 262.382 346.886C265.167 340.866 268.027 336.737 271.339 331.097L285.711 306.49L333.522 224.746L350.348 196.118C353.628 190.509 356.854 185.448 359.787 179.633C356.416 179.79 351.01 179.533 347.418 179.526C348.529 177.15 348.882 175.785 351.345 174.796Z"/><path fill="white" d="M158.881 174.873L264.701 174.666C278.921 174.77 293.141 174.8 307.361 174.755C315.263 174.762 323.166 174.905 331.064 174.738C328.021 179.25 329.806 179.67 323.158 179.724C318.88 179.759 314.455 179.592 310.18 179.591L285.336 179.695L207.965 179.707L162.471 179.684C155.847 179.679 145.365 179.974 138.938 179.549C140.839 183.586 143.332 187.438 145.653 191.257C148.519 195.986 151.358 200.732 154.169 205.494L186.272 260.112L222.663 321.648C224.828 325.362 227.046 329.045 229.318 332.695C232.322 337.458 235.301 341.663 237.477 346.905C238.746 344.948 242.085 339.304 243.261 337.947L243.673 337.997C244.923 338.931 245.375 340.407 245.949 341.839C244.924 345.229 239.687 352.76 237.725 356.763C236.91 354.882 235.872 353.092 234.874 351.303C227.798 338.622 219.946 326.394 212.571 313.889L151.536 210.65L138.424 188.541C136.166 184.76 132.368 178.925 130.931 175.05C133.294 174.863 136.011 175.07 138.444 175.005C145.192 174.824 152.175 175.156 158.881 174.873Z"/></svg>';

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
var body = {
from: FROM_NAME + ' <' + FROM_EMAIL + '>',
to: [to], reply_to: REPLY_TO, subject: subject, html: html,
};
if (attachments && attachments.length) body.attachments = attachments;
var res = await fetch('https://api.resend.com/emails', {
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
return new Promise(function(resolve, reject) {
var raw = '';
req.on('data', function(c) { raw += c; });
req.on('end',  function() { try { resolve(JSON.parse(raw||'{}')); } catch(e) { resolve({}); } });
req.on('error', reject);
});
}

// — HANDLER ——————————————————————
async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
res.setHeader('Access-Control-Allow-Origin', '*');

var body = await parseBody(req);
var nome = body.nome, email = body.email, telefone = body.telefone, data = body.data, hora = body.hora, local = body.local;
if (!nome||!email||!data||!hora||!local)
return res.status(400).json({ error:'Todos os campos sao obrigatorios.' });

try {
console.log('[1] Iniciando para', email, '| tel:', telefone || 'n/a');
await sendEmail(email, nome+', recebemos seus dados \u2605', emailConfirmacao(nome,data,hora,local,telefone));
console.log('[2] Confirmacao enviada');

var timezone = await resolveTimezone(local);
console.log('[3] Timezone:', timezone);

var hd = await fetchHDData(data, hora, timezone);
var tipo = hd.Properties && hd.Properties.Type && hd.Properties.Type.id;
console.log('[4] HD ok. Tipo:', tipo, '| SVG:', (hd.SVG||'').length, 'chars');
console.log('[4b] DefinedCenters:', JSON.stringify(hd.DefinedCenters));
console.log('[4c] OpenCenters:', JSON.stringify(hd.OpenCenters));

var planetas = extrairPlanetas(hd);
var portCanais = extrairPortoesCanais(hd);
var portoes = portCanais.portoes;
var canais  = portCanais.canais;
var sv = getSetas(hd);

var pdfBytes  = await buildPdf(nome, data, hora, local, hd, planetas, portoes, canais, sv);
var pdfBase64 = Buffer.from(pdfBytes).toString('base64');
console.log('[5] PDF gerado:', pdfBytes.length, 'bytes');

var primeiroNome = nome.split(' ')[0].toLowerCase();
await sendEmail(
  email,
  nome + ', seu Mapa de Desenho Humano est\u00e1 pronto \u2605',
  emailPdf(nome, data, hora, local, telefone),
  [{ filename:'mapa-desenho-humano-'+primeiroNome+'.pdf', content:pdfBase64 }]
);
console.log('[6] PDF enviado com sucesso');

// — MONTAR PAYLOAD PARA A PÁGINA DE RESULTADO ————————
var props = hd.Properties || {};

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

var tipoId       = extractStr(props.Type);
var estrategiaId = extractStr(props.Strategy);
// A API usa InnerAuthority, não Authority
var autoridadeId = extractStr(props.InnerAuthority) || extractStr(props.Authority);
var perfilId     = extractStr(props.Profile);
var definicaoId  = extractStr(props.Definition);
var assinaturaId = extractStr(props.Signature);
// A API usa NotSelfTheme, não NotSelf
var naoselfId    = extractStr(props.NotSelfTheme) || extractStr(props.NotSelf);
var cruzRawPayload = props.IncarnationCross
  ? (typeof props.IncarnationCross === 'string'
      ? props.IncarnationCross
      : (props.IncarnationCross.label || props.IncarnationCross.id || ''))
  : '';

console.log('[payload] tipo:', tipoId, '| estrategia:', estrategiaId, '| autoridade:', autoridadeId, '| perfil:', perfilId);
console.log('[payload] props.InnerAuthority raw:', JSON.stringify(props.InnerAuthority));
console.log('[payload] props.Authority raw:', JSON.stringify(props.Authority));

// SVG colorido com centros definidos/abertos
var svgColorido = colorirCentrosSVG(hd.SVG || '', hd.DefinedCenters || [], hd.OpenCenters || []);

var mapaPayload = {
  nome: nome,
  data: data,
  hora: hora,
  local: local,
  svg: svgColorido,
  tipo:      { id: tipoId, label: tr(tipoId), desc: getDesc('tipo', tipoId), frase: (getTipoObj(tipoId)||{}).fraseIdentidade || '' },
  estrategia:{ id: estrategiaId, label: tr(estrategiaId), desc: getDesc('estrategia', estrategiaId) },
  autoridade:{ id: autoridadeId, label: tr(autoridadeId), desc: getDesc('autoridade', autoridadeId) },
  perfil:    { id: perfilId, label: perfilId, desc: getDesc('perfil', perfilId) },
  definicao: { id: definicaoId, label: tr(definicaoId), desc: getDesc('definicao', definicaoId) },
  assinatura:{ id: assinaturaId, label: tr(assinaturaId), desc: getDesc('assinatura', assinaturaId) },
  desalinhamento: { id: naoselfId, label: tr(naoselfId), desc: getDesc('naoself', naoselfId) },
  cruz:      traduzirCruz(cruzRawPayload),
  planetas:  planetas,
  portoes:   portoes.sort(function(a,b) { return a-b; }),
  canais:    canais,
  setas:     sv,
};

return res.status(200).json({ ok:true, mapa: mapaPayload });

} catch(err) {
console.error('[Erro]', err.message);
return res.status(500).json({ error: err.message });
}
}
