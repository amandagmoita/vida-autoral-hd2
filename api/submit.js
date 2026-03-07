import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { PDFDocument, rgb } from 'pdf-lib';
// @resvg/resvg-wasm é carregado via dynamic import no ensureWasm()
// para evitar que o bundler do Vercel (esbuild) tente resolver binários nativos
let Resvg = null;

export const maxDuration = 30;

// ─── WASM + Font singleton ─────────────────────────────────────────────────────
// DIAGNÓSTICO: resvg-wasm em ambiente serverless NÃO tem fontes do sistema.
// Sem fonte carregada, todos os elementos <text> são silenciosamente ignorados.
// Solução: bundlar DejaVu Sans TTF e carregá-la explicitamente via fontBuffers.
let wasmInitialized = false;
let fontBuffer = null;

async function ensureWasm() {
  if (wasmInitialized) return;

  const __dir = dirname(fileURLToPath(import.meta.url));

  // Dynamic import do .mjs puro — bypassa o bundler do Vercel (esbuild).
  // O import estático de '@resvg/resvg-wasm' seria resolvido em build-time
  // e tentaria carregar binários nativos de plataforma que não existem no serverless.
  const mjsPath = join(__dir, '..', 'node_modules', '@resvg', 'resvg-wasm', 'index.mjs');
  const resvgModule = await import(/* @vite-ignore */ 'file://' + mjsPath);
  Resvg = resvgModule.Resvg;
  const initWasm = resvgModule.initWasm;

  // Lê e inicializa o WASM binary
  const wasmPath = join(__dir, '..', 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm');
  await initWasm(await readFile(wasmPath));

  // TTF commitada em /fonts/ — caminho resolvido via import.meta.url
  const fontPath = join(__dir, '..', 'fonts', 'DejaVuSans.ttf');
  fontBuffer = await readFile(fontPath);

  wasmInitialized = true;
}

// ─── ENV ───────────────────────────────────────────────────────────────────────
const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.FROM_EMAIL;
const FROM_NAME         = process.env.FROM_NAME;
const REPLY_TO          = process.env.REPLY_TO;
const BODYGRAPH_API_KEY = process.env.BODYGRAPH_API_KEY;
const BODYGRAPH_BASE    = 'https://api.bodygraphchart.com';

// ─── TRADUÇÕES ─────────────────────────────────────────────────────────────────
const TRADUCOES = {
  // Tipos
  'Generator':            'Gerador',
  'Manifested Generator': 'Gerador Manifestado',
  'Manifestor':           'Manifestador',
  'Projector':            'Projetor',
  'Reflector':            'Refletor',
  // Estratégias
  'To Respond':                'Responder',
  'To Inform':                 'Informar',
  'To Initiate':               'Iniciar',
  'Wait for the Invitation':   'Aguardar o Convite',
  'Wait for a Lunar Cycle':    'Aguardar um Ciclo Lunar',
  'Wait a Lunar Cycle':        'Aguardar um Ciclo Lunar',
  // Autoridades
  'Sacral':             'Sacral',
  'Emotional':          'Emocional',
  'Splenic':            'Esplênica',
  'Ego':                'Ego',
  'Self-Projected':     'Projeção do Eu',
  'Mental':             'Mental',
  'No Authority':       'Sem Autoridade Interna',
  'Lunar':              'Lunar',
  'Ego Manifestor':     'Ego (Manifestador)',
  // Definições
  'Single Definition':      'Definição Única',
  'Split Definition':       'Definição Dividida',
  'Triple Split Definition':'Tripla Divisão',
  'Quadruple Split':        'Quádrupla Divisão',
  'No Definition':          'Sem Definição',
  // Assinaturas
  'Satisfaction': 'Satisfação',
  'Success':      'Sucesso',
  'Peace':        'Paz',
  'Surprise':     'Surpresa',
  // Temas Não-Self
  'Frustration':   'Frustração',
  'Bitterness':    'Amargura',
  'Anger':         'Raiva',
  'Disappointment':'Decepção',
};

function traduzir(valor) {
  if (!valor) return '—';
  return TRADUCOES[valor] || valor;
}

// ─── BODYGRAPH API ─────────────────────────────────────────────────────────────
async function resolveTimezone(city) {
  const url = `${BODYGRAPH_BASE}/v210502/locations?api_key=${BODYGRAPH_API_KEY}&query=${encodeURIComponent(city)}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Locations API error: ${res.status}`);
  const data = await res.json();
  if (!data?.length) throw new Error(`Cidade não encontrada: ${city}`);
  return data[0].timezone;
}

async function generateHDChart(date, hora, timezone) {
  const datetime = `${date} ${hora}`;
  const url = `${BODYGRAPH_BASE}/v221006/hd-data?api_key=${BODYGRAPH_API_KEY}&date=${encodeURIComponent(datetime)}&timezone=${encodeURIComponent(timezone)}&design=Leo`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HD Data API error: ${res.status}`);
  return await res.json();
}

// ─── SVG → PNG ─────────────────────────────────────────────────────────────────

/**
 * Prepara o SVG do Bodygraph para renderização com resvg-wasm.
 *
 * IMPORTANTE: NÃO alteramos cores de texto.
 * O SVG já tem cores intencionais: texto branco dentro de círculos escuros
 * (centros ativados) e texto escuro nas áreas claras. As cores eram corretas
 * desde sempre — o problema anterior era apenas ausência de fonte TTF no
 * ambiente serverless, que fazia o resvg ignorar todos os <text> silenciosamente.
 *
 * Agora que a DejaVu Sans é carregada via fontBuffers, basta:
 *   1. Garantir namespace xmlns
 *   2. Remover recursos externos (URLs http) que travam o resvg
 */
function prepararSvg(svgString) {
  let svg = svgString;

  // 1. Garante namespace
  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // 2. Remove recursos externos que podem travar o resvg em ambiente sem rede
  svg = svg.replace(/xlink:href="https?:\/\/[^"]*"/g, 'xlink:href=""');
  svg = svg.replace(/ href="https?:\/\/[^"]*"/g, '');
  svg = svg.replace(/<image[^>]*(https?:\/\/)[^>]*\/>/g, '<g/>');

  return svg;
}

async function svgParaPng(svgString) {
  await ensureWasm();
  const svg   = prepararSvg(svgString);
  const resvg = new Resvg(svg, {
    fitTo:      { mode: 'width', value: 720 },
    background: '#ffffff',
    font: {
      // Sem fonte explícita, resvg-wasm ignora todos os <text> silenciosamente.
      // DejaVu Sans é bundlada no projeto para garantir renderização dos números dos portões.
      fontBuffers:       [fontBuffer],
      defaultFontFamily: 'DejaVu Sans',
      loadSystemFonts:   false,
    },
  });
  return resvg.render().asPng();
}

// ─── PLANETAS E SETAS ──────────────────────────────────────────────────────────

const PLANET_ORDER = ['Sun','Earth','North Node','South Node','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

const PLANET_ABBREV_PT = {
  'Sun':'Sol', 'Earth':'Ter', 'North Node':'NN', 'NNode':'NN',
  'South Node':'NS', 'SNode':'NS', 'Moon':'Lua', 'Mercury':'Mer',
  'Venus':'Ven', 'Mars':'Mar', 'Jupiter':'Jup', 'Saturn':'Sat',
  'Uranus':'Ura', 'Neptune':'Nep', 'Pluto':'Plu',
};

function normalizarPlaneta(p) {
  // Handles multiple field name conventions from Bodygraph API
  const name   = p.planet  || p.Planet  || p.name  || p.Name  || '';
  const gate   = p.gate    || p.Gate    || p.gateNumber || 0;
  const line   = p.line    || p.Line    || 0;
  const color  = p.color   || p.Color   || 0;
  const abbrev = PLANET_ABBREV_PT[name] || name.slice(0,3);
  return { name, gate, line, color, abbrev };
}

function extrairPlanetas(hdData) {
  // Log para debug em produção
  const allKeys = Object.keys(hdData).join(', ');
  console.log('[Planets] hdData keys:', allKeys);

  const planets = hdData.Planets || hdData.planets || hdData.PlanetaryData || {};
  const personality = planets.Personality || planets.personality || planets.PersonalityPlanets || [];
  const design      = planets.Design      || planets.design      || planets.DesignPlanets      || [];

  console.log('[Planets] pers:', personality.length, 'design:', design.length,
    personality[0] ? JSON.stringify(personality[0]).slice(0,80) : 'empty');

  // Sort by canonical HD order
  const sortByOrder = (arr) => {
    const normalized = arr.map(normalizarPlaneta);
    return PLANET_ORDER.map(name => {
      const found = normalized.find(p => p.name === name ||
        (name === 'North Node' && (p.name.includes('North') || p.name === 'NN')) ||
        (name === 'South Node' && (p.name.includes('South') || p.name === 'SN')));
      return found || { name, gate: 0, line: 0, color: 0, abbrev: PLANET_ABBREV_PT[name] || name.slice(0,3) };
    });
  };

  return {
    personalityPlanets: sortByOrder(personality),
    designPlanets:      sortByOrder(design),
    rawPersonality: personality,
    rawDesign: design,
  };
}

function calcularSetas(designPlanets, personalityPlanets) {
  // Variable arrows based on Color: 1-3 = right (→), 4-6 = left (←)
  // Top arrows from Sun, Bottom arrows from North Node
  const dir = (color) => (parseInt(color) || 0) <= 3 ? 'R' : 'L';

  const dSun = designPlanets.find(p => p.name === 'Sun');
  const pSun = personalityPlanets.find(p => p.name === 'Sun');
  const dNN  = designPlanets.find(p => p.name === 'North Node');
  const pNN  = personalityPlanets.find(p => p.name === 'North Node');

  return {
    topLeft:     dir(dSun?.color),   // Design Sun → top-left arrow
    topRight:    dir(pSun?.color),   // Personality Sun → top-right arrow
    bottomLeft:  dir(dNN?.color),    // Design N.Node → bottom-left arrow
    bottomRight: dir(pNN?.color),    // Personality N.Node → bottom-right arrow
  };
}

// ─── EXTRAI PORTÕES E CANAIS ───────────────────────────────────────────────────
function extrairPortoesCanais(hdData) {
  // Canais: array de objetos com id tipo "1-8" ou campo name
  const canaisBrutos = hdData.Channels || hdData.channels || hdData.ActiveChannels || [];
  const canais = canaisBrutos.map(c => {
    if (typeof c === 'string') return c;
    return c.id || c.name || c.gates || JSON.stringify(c);
  }).filter(Boolean).sort();

  // Portões: extraídos dos canais (cada canal = 2 portões) + campo Gates se existir
  const portoesSet = new Set();
  canaisBrutos.forEach(c => {
    const id = typeof c === 'string' ? c : (c.id || '');
    const partes = id.split('-');
    partes.forEach(p => { const n = parseInt(p); if (n >= 1 && n <= 64) portoesSet.add(n); });
  });
  // Campo Gates adicional
  const gatesBrutos = hdData.Gates || hdData.gates || hdData.ActiveGates || [];
  if (Array.isArray(gatesBrutos)) {
    gatesBrutos.forEach(g => {
      const n = typeof g === 'number' ? g : parseInt(g?.id || g);
      if (n >= 1 && n <= 64) portoesSet.add(n);
    });
  }

  const portoes = [...portoesSet].sort((a, b) => a - b);
  return { portoes, canais };
}

// ─── MONTA PDF ─────────────────────────────────────────────────────────────────
async function buildPdf(nome, hdData) {
  const props = hdData.Properties || {};
  const { portoes, canais } = extrairPortoesCanais(hdData);
  const { personalityPlanets, designPlanets } = extrairPlanetas(hdData);
  const setas = calcularSetas(designPlanets, personalityPlanets);
  console.log('[PDF] Setas:', JSON.stringify(setas));

  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Paleta Vida Autoral — tema claro
  const branco      = rgb(1.000, 1.000, 1.000);
  const cinzaClaro  = rgb(0.965, 0.957, 0.949); // #F6F4F2 fundo cards
  const cinzaMedio  = rgb(0.878, 0.863, 0.847); // #E0DCD8 bordas
  const coffee      = rgb(0.608, 0.490, 0.380); // #9B7D61
  const peach       = rgb(0.855, 0.639, 0.561); // #DAA38F
  const eucalyptus  = rgb(0.573, 0.678, 0.643); // #92ADA4
  const textEscuro  = rgb(0.180, 0.141, 0.114); // #2E2419
  const textMedio   = rgb(0.420, 0.353, 0.294); // #6B5A4B
  const wheat       = rgb(0.914, 0.843, 0.753); // #E9D7C0
  const designCor   = rgb(0.545, 0.200, 0.200); // brick red — lado Design
  const persCor     = textEscuro;                 // charcoal  — lado Personality

  // ── Fundo branco ──
  page.drawRectangle({ x: 0, y: 0, width, height, color: branco });

  // ── Faixa de cabeçalho esquerda ──
  page.drawRectangle({ x: 0, y: height - 36, width: 490, height: 36, color: wheat });

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT da coluna esquerda (0–490):
  //   [0–58]  coluna Design (vermelho escuro)
  //   [58–432] gráfico Bodygraph centralizado
  //   [432–490] coluna Personality (carvão)
  // ─────────────────────────────────────────────────────────────────────────────
  const DIVIDER   = 490;
  const COL_W     = 58;   // largura de cada coluna de planetas
  const CHART_X0  = COL_W;
  const CHART_W   = DIVIDER - COL_W * 2; // 374px
  const AREA_TOP  = height - 36;
  const AREA_BOT  = 20;   // acima do rodapé
  const AREA_H    = AREA_TOP - AREA_BOT; // 539px

  // ── Linha sutil separando colunas de planetas do gráfico ──
  page.drawLine({ start: { x: COL_W, y: AREA_BOT }, end: { x: COL_W, y: AREA_TOP }, thickness: 0.3, color: cinzaMedio });
  page.drawLine({ start: { x: DIVIDER - COL_W, y: AREA_BOT }, end: { x: DIVIDER - COL_W, y: AREA_TOP }, thickness: 0.3, color: cinzaMedio });

  // ── Labels de cabeçalho das colunas de planetas ──
  page.drawText('DESIGN',  { x: 4,         y: height - 26, size: 6, color: designCor });
  page.drawText('PERS.',   { x: DIVIDER - COL_W + 4, y: height - 26, size: 6, color: persCor });
  page.drawLine({ start: { x: 0, y: height - 28 }, end: { x: COL_W, y: height - 28 }, thickness: 0.5, color: designCor });
  page.drawLine({ start: { x: DIVIDER - COL_W, y: height - 28 }, end: { x: DIVIDER, y: height - 28 }, thickness: 0.5, color: persCor });

  // ── Colunas de planetas ──
  const rowH    = AREA_H / 13;         // altura por planeta
  const yStart  = AREA_TOP - rowH * 0.5; // y do centro da primeira linha (topo)

  const temDados = designPlanets.some(p => p.gate > 0) || personalityPlanets.some(p => p.gate > 0);

  PLANET_ORDER.forEach((planetName, i) => {
    const cy = yStart - i * rowH; // centro vertical da linha i (PDF coords, de cima p/ baixo)

    // ── Design (esquerda) ──
    const dp = designPlanets[i];
    if (dp) {
      const abbr  = dp.abbrev || planetName.slice(0,3);
      const label = dp.gate > 0 ? `${abbr} ${dp.gate}.${dp.line}` : abbr;
      // Barra colorida lateral
      page.drawLine({ start: { x: 0, y: cy }, end: { x: 3, y: cy }, thickness: rowH * 0.5, color: rgb(0.545, 0.200, 0.200, ) });
      page.drawText(abbr,  { x: 5,  y: cy + 1, size: 5.5, color: designCor });
      if (dp.gate > 0) {
        page.drawText(`${dp.gate}.${dp.line}`, { x: 5, y: cy - 8, size: 7.5, color: designCor });
      }
    }

    // ── Personality (direita) ──
    const pp = personalityPlanets[i];
    if (pp) {
      const abbr = pp.abbrev || planetName.slice(0,3);
      page.drawLine({ start: { x: DIVIDER - 3, y: cy }, end: { x: DIVIDER, y: cy }, thickness: rowH * 0.5, color: textEscuro });
      page.drawText(abbr,  { x: DIVIDER - COL_W + 5, y: cy + 1,  size: 5.5, color: persCor });
      if (pp.gate > 0) {
        page.drawText(`${pp.gate}.${pp.line}`, { x: DIVIDER - COL_W + 5, y: cy - 8, size: 7.5, color: persCor });
      }
    }

    // Linha divisória horizontal leve entre planetas
    if (i < 12) {
      page.drawLine({ start: { x: 0, y: cy - rowH / 2 }, end: { x: COL_W, y: cy - rowH / 2 }, thickness: 0.2, color: cinzaMedio });
      page.drawLine({ start: { x: DIVIDER - COL_W, y: cy - rowH / 2 }, end: { x: DIVIDER, y: cy - rowH / 2 }, thickness: 0.2, color: cinzaMedio });
    }
  });

  // ── Sem dados de planetas: mensagem ──
  if (!temDados) {
    page.drawText('Dados planetários indisponíveis', { x: 2, y: height / 2, size: 5, color: textMedio });
  }

  // ── Gráfico Bodygraph ──
  let imgX = CHART_X0, imgY = AREA_BOT, imgW = CHART_W, imgH = AREA_H;
  if (hdData.SVG) {
    try {
      const pngBuf = await svgParaPng(hdData.SVG);
      console.log('[PDF] PNG:', pngBuf.length, 'bytes');
      const pngImg = await pdfDoc.embedPng(pngBuf);
      const dims   = pngImg.scaleToFit(CHART_W, AREA_H);
      imgX = CHART_X0 + (CHART_W - dims.width) / 2;
      imgY = AREA_BOT  + (AREA_H  - dims.height) / 2;
      imgW = dims.width;
      imgH = dims.height;
      page.drawImage(pngImg, { x: imgX, y: imgY, width: imgW, height: imgH });
      console.log('[PDF] Gráfico embedado ✅ dims:', Math.round(imgW), 'x', Math.round(imgH));
    } catch (e) {
      console.error('[PDF] Erro gráfico:', e.message);
    }
  }

  // ── Quatro setas do Variable (desenhadas sobre o gráfico) ──
  // Posições estimadas com base na anatomia padrão do bodygraph:
  //   Cabeça ≈ topo 13% da imagem | Raiz ≈ base 7% da imagem
  const headY = imgY + imgH * 0.87;  // ~13% do topo
  const rootY = imgY + imgH * 0.07;  // ~7% da base

  // x das setas: ~22% e ~62% da largura do gráfico (flancos do centro cabeça/raiz)
  const arrowLX = imgX + imgW * 0.18; // lado esquerdo
  const arrowRX = imgX + imgW * 0.64; // lado direito

  function desenharSeta(cx, cy, dir, cor) {
    // dir: 'R' (→) ou 'L' (←). cx/cy = ponta da seta.
    const W = 8, H = 3.5;
    if (dir === 'R') {
      page.drawLine({ start: { x: cx - W, y: cy }, end: { x: cx, y: cy }, thickness: 1.5, color: cor });
      page.drawLine({ start: { x: cx, y: cy }, end: { x: cx - 5, y: cy + H }, thickness: 1.5, color: cor });
      page.drawLine({ start: { x: cx, y: cy }, end: { x: cx - 5, y: cy - H }, thickness: 1.5, color: cor });
    } else {
      page.drawLine({ start: { x: cx + W, y: cy }, end: { x: cx, y: cy }, thickness: 1.5, color: cor });
      page.drawLine({ start: { x: cx, y: cy }, end: { x: cx + 5, y: cy + H }, thickness: 1.5, color: cor });
      page.drawLine({ start: { x: cx, y: cy }, end: { x: cx + 5, y: cy - H }, thickness: 1.5, color: cor });
    }
  }

  desenharSeta(arrowLX,        headY, setas.topLeft,     designCor);  // Design   topo-esq
  desenharSeta(arrowRX + 8,    headY, setas.topRight,    persCor);    // Pers     topo-dir
  desenharSeta(arrowLX,        rootY, setas.bottomLeft,  designCor);  // Design   base-esq
  desenharSeta(arrowRX + 8,    rootY, setas.bottomRight, persCor);    // Pers     base-dir

  // ── Divisória vertical ──
  page.drawLine({
    start: { x: 490, y: 22 }, end: { x: 490, y: height },
    thickness: 1, color: cinzaMedio,
  });

  // ── Painel direito ──
  const px = 500;
  const pw = 330; // largura útil do painel

  // Cabeçalho do painel
  page.drawRectangle({ x: 490, y: height - 36, width: width - 490, height: 36, color: coffee });

  // Logo triângulo
  const tx = 497, ty = height - 28;
  page.drawLine({ start: { x: tx + 8, y: ty + 16 }, end: { x: tx + 16, y: ty },     thickness: 1, color: branco });
  page.drawLine({ start: { x: tx + 16, y: ty },      end: { x: tx,      y: ty },     thickness: 1, color: branco });
  page.drawLine({ start: { x: tx,      y: ty },      end: { x: tx + 8,  y: ty + 16 }, thickness: 1, color: branco });

  page.drawText('VIDA AUTORAL',           { x: tx + 22, y: height - 22, size: 9,  color: branco });
  page.drawText('MAPA DO DESENHO HUMANO', { x: tx + 22, y: height - 33, size: 6.5, color: rgb(1,1,1, ) });

  // Nome da pessoa
  const nomeDisplay = nome.length > 28 ? nome.slice(0, 26) + '…' : nome;
  page.drawText(nomeDisplay.toUpperCase(), { x: px, y: height - 54, size: 12, color: textEscuro });
  page.drawLine({ start: { x: px, y: height - 60 }, end: { x: px + pw, y: height - 60 }, thickness: 0.5, color: cinzaMedio });

  // ── 8 propriedades em cards compactos ──
  const propriedades = [
    ['Tipo Energético',    traduzir(props?.Type?.id)],
    ['Estratégia',         traduzir(props?.Strategy?.id)],
    ['Autoridade Interna', traduzir(props?.InnerAuthority?.id)],
    ['Perfil',             props?.Profile?.id || '—'],
    ['Definição',          traduzir(props?.Definition?.id)],
    ['Assinatura',         traduzir(props?.Signature?.id)],
    ['Tema Não-Self',      traduzir(props?.NotSelfTheme?.id)],
    ['Cruz de Encarnação', props?.IncarnationCross?.id || '—'],
  ];

  // Duas colunas de 4 para caber melhor
  const colW   = pw / 2 - 4;
  const cardH  = 44;
  const startY = height - 68;

  propriedades.forEach(([label, valor], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = px + col * (colW + 8);
    const y   = startY - row * (cardH + 4);

    page.drawRectangle({ x, y: y - cardH + 8, width: colW, height: cardH, color: cinzaClaro });
    page.drawLine({ start: { x, y: y - cardH + 8 + cardH }, end: { x: x + colW, y: y - cardH + 8 + cardH }, thickness: 2, color: peach });

    page.drawText(label.toUpperCase(), { x: x + 4, y: y - 4,  size: 5.5, color: coffee });

    const v = String(valor);
    if (v.length > 20) {
      page.drawText(v.slice(0, 20), { x: x + 4, y: y - 16, size: 7.5, color: textEscuro });
      page.drawText(v.slice(20),    { x: x + 4, y: y - 26, size: 7.5, color: textEscuro });
    } else {
      page.drawText(v, { x: x + 4, y: y - 16, size: 8.5, color: textEscuro });
    }
  });

  // ── Portões ativados ──
  const secY = startY - 4 * (cardH + 4) - 2;

  page.drawLine({ start: { x: px, y: secY }, end: { x: px + pw, y: secY }, thickness: 0.5, color: cinzaMedio });
  page.drawText('PORTÕES ATIVADOS', { x: px, y: secY - 12, size: 6, color: coffee });

  if (portoes.length > 0) {
    // Desenha cada portão como um badge pequeno
    let bx = px, by = secY - 26;
    portoes.forEach(p => {
      const label = String(p);
      const bw    = label.length === 1 ? 16 : 20;
      if (bx + bw > px + pw) { bx = px; by -= 16; }
      page.drawRectangle({ x: bx, y: by - 2, width: bw, height: 13, color: eucalyptus });
      page.drawText(label, { x: bx + (bw - label.length * 4.5) / 2, y: by + 1, size: 7, color: branco });
      bx += bw + 3;
    });
  } else {
    page.drawText('Dados não disponíveis', { x: px, y: secY - 26, size: 7, color: textMedio });
  }

  // ── Canais ativados ──
  const canaisY = secY - (portoes.length > 0 ? Math.ceil(portoes.length / 16) * 16 + 36 : 36);

  page.drawLine({ start: { x: px, y: canaisY }, end: { x: px + pw, y: canaisY }, thickness: 0.5, color: cinzaMedio });
  page.drawText('CANAIS ATIVADOS', { x: px, y: canaisY - 12, size: 6, color: coffee });

  if (canais.length > 0) {
    let cx = px, cy = canaisY - 26;
    canais.forEach(c => {
      const label = String(c);
      const cw    = label.length * 5.2 + 10;
      if (cx + cw > px + pw) { cx = px; cy -= 16; }
      page.drawRectangle({ x: cx, y: cy - 2, width: cw, height: 13, color: wheat });
      page.drawLine({ start: { x: cx, y: cy - 2 + 13 }, end: { x: cx + cw, y: cy - 2 + 13 }, thickness: 1, color: peach });
      page.drawText(label, { x: cx + 5, y: cy + 1, size: 7, color: textEscuro });
      cx += cw + 4;
    });
  } else {
    page.drawText('Dados não disponíveis', { x: px, y: canaisY - 26, size: 7, color: textMedio });
  }

  // ── Rodapé ──
  page.drawRectangle({ x: 0, y: 0, width, height: 20, color: cinzaClaro });
  page.drawLine({ start: { x: 0, y: 20 }, end: { x: width, y: 20 }, thickness: 0.5, color: cinzaMedio });
  page.drawText('© 2025 Vida Autoral · Todos os direitos reservados', { x: 300, y: 6, size: 6, color: textMedio });

  return await pdfDoc.save();
}

// ─── EMAILS ────────────────────────────────────────────────────────────────────
const emailBase = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#F0E8DE;font-family:Georgia,serif;}
  .wrap{max-width:560px;margin:0 auto;background:#fff;}
  .header{background:#9B7D61;padding:2rem;text-align:center;}
  .header h1{color:#fff;font-size:1.1rem;font-weight:400;letter-spacing:.18em;margin:.6rem 0 0;}
  .body{padding:2.2rem 2rem;}
  p{color:#3a2e26;font-size:.93rem;line-height:1.9;margin-bottom:.9rem;}
  .info{background:#FED8A6;border-left:3px solid #9B7D61;padding:.9rem 1.1rem;margin:1.4rem 0;border-radius:0 4px 4px 0;}
  .info p{margin:0;font-size:.85rem;color:#5a3f28;}
  .badge{display:inline-block;background:#E9D7C0;border:1px solid #DAA38F;padding:.5rem 1.1rem;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:#9B7D61;margin:1.3rem 0;border-radius:2px;}
  .footer{background:#2e2419;padding:1.2rem;text-align:center;}
  .footer p{color:rgba(233,215,192,.4);font-size:.68rem;margin:0;}
</style></head><body>`;

function buildConfirmationEmail({ nome, data, hora, local }) {
  return emailBase + `<div class="wrap">
  <div class="header">
    <svg width="32" height="32" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#fff" stroke-width="2" fill="none"/></svg>
    <h1>Vida Autoral</h1>
  </div>
  <div class="body">
    <p>Olá, <strong>${nome}</strong>,</p>
    <p>Recebemos seus dados com sucesso! Seu mapa de Desenho Humano está sendo gerado — em instantes você receberá o PDF personalizado.</p>
    <div class="info"><p>📅 <strong>${data}</strong> &nbsp;·&nbsp; 🕐 <strong>${hora}</strong><br/>📍 ${local}</p></div>
    <div class="badge">✦ &nbsp; Seu PDF está a caminho</div>
    <p>Se não chegar em até 5 minutos, verifique a pasta de spam.</p>
    <p style="font-size:.83rem;color:#9b836f;">Com carinho,<br/><strong>Equipe Vida Autoral</strong></p>
  </div>
  <div class="footer"><p>© 2025 Vida Autoral</p></div>
</div></body></html>`;
}

function buildPdfEmail({ nome, data, hora, local }) {
  return emailBase + `<div class="wrap">
  <div class="header">
    <svg width="32" height="32" viewBox="0 0 70 70" fill="none"><polygon points="35,62 4,8 66,8" stroke="#fff" stroke-width="2" fill="none"/></svg>
    <h1>Vida Autoral</h1>
  </div>
  <div class="body">
    <p>Olá, <strong>${nome}</strong>,</p>
    <p>Seu mapa de Desenho Humano está pronto! 🎉 O PDF personalizado está em anexo.</p>
    <div class="info"><p>📅 <strong>${data}</strong> &nbsp;·&nbsp; 🕐 <strong>${hora}</strong><br/>📍 ${local}</p></div>
    <p>O PDF inclui seu gráfico completo com Tipo, Estratégia, Autoridade, Perfil, Centros, Canais e Portões ativados.</p>
    <p style="font-size:.83rem;color:#9b836f;">Com carinho,<br/><strong>Equipe Vida Autoral</strong></p>
  </div>
  <div class="footer"><p>© 2025 Vida Autoral</p></div>
</div></body></html>`;
}

// ─── RESEND ────────────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html, attachments = [] }) {
  const body = { from: `${FROM_NAME} <${FROM_EMAIL}>`, to: [to], reply_to: REPLY_TO, subject, html };
  if (attachments.length) body.attachments = attachments;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(await res.json())}`);
  return res.json();
}

// ─── HANDLER ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { nome, email, data, hora, local } = req.body;
  if (!nome || !email || !data || !hora || !local)
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });

  try {
    console.log(`[1] Iniciando para ${email}`);

    await sendEmail({ to: email, subject: `${nome}, recebemos seus dados ✦`, html: buildConfirmationEmail({ nome, data, hora, local }) });
    console.log(`[2] Confirmação enviada`);

    const timezone = await resolveTimezone(local);
    console.log(`[3] Timezone: ${timezone}`);

    const hdData = await generateHDChart(data, hora, timezone);
    const { portoes, canais } = extrairPortoesCanais(hdData);
    console.log(`[4] Tipo: ${hdData?.Properties?.Type?.id} | SVG: ${hdData?.SVG?.length || 0} chars | Portões: ${portoes.length} | Canais: ${canais.length}`);

    const pdfBytes  = await buildPdf(nome, hdData);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    console.log(`[5] PDF: ${pdfBytes.length} bytes`);

    await sendEmail({
      to: email,
      subject: `${nome}, seu mapa de Desenho Humano está pronto ✦`,
      html: buildPdfEmail({ nome, data, hora, local }),
      attachments: [{ filename: `mapa-desenho-humano-${nome.split(' ')[0].toLowerCase()}.pdf`, content: pdfBase64 }],
    });
    console.log(`[6] PDF enviado com sucesso`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[Erro]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
