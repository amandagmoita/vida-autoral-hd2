const { Resend } = require('resend');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// ── Tipos e dados do Human Design ──────────────────────────────────────────
const TIPOS = {
  generator:           { nome: 'Gerador',             estrategia: 'Responder',                     autoridade_padrao: 'Sacral',    tema: 'Satisfação'    },
  manifesting_generator: { nome: 'Gerador Manifestador', estrategia: 'Responder e depois informar', autoridade_padrao: 'Sacral',    tema: 'Satisfação'    },
  projector:           { nome: 'Projetor',             estrategia: 'Aguardar o convite',            autoridade_padrao: 'Esplênico', tema: 'Sucesso'       },
  manifestor:          { nome: 'Manifestador',         estrategia: 'Informar antes de agir',        autoridade_padrao: 'Emocional', tema: 'Paz'           },
  reflector:           { nome: 'Refletor',             estrategia: 'Aguardar um ciclo lunar',       autoridade_padrao: 'Lunar',     tema: 'Surpresa'      },
};

const AUTORIDADES = {
  emotional:  'Emocional (Solar Plexus)',
  sacral:     'Sacral',
  splenic:    'Esplênico',
  ego:        'Ego',
  self:       'G Center / Identidade',
  none:       'Mental (Ambiente)',
  lunar:      'Lunar',
};

const CENTROS = [
  'Head','Ajna','Throat','G','Heart','Solar Plexus','Sacral','Root','Spleen'
];

// ── Helper: buscar cidade via geocoding ────────────────────────────────────
async function buscarCidade(cidade, pais) {
  try {
    const query = encodeURIComponent(`${cidade}, ${pais}`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { 'User-Agent': 'VidaAutoral-HD/1.0' }
    });
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), nome: data[0].display_name };
    }
  } catch(e) {}
  return null;
}

// ── Helper: chamar API Bodygraph ───────────────────────────────────────────
async function calcularMapa(dadosNascimento) {
  const { ano, mes, dia, hora, minuto, lat, lon } = dadosNascimento;

  const payload = {
    year:   parseInt(ano),
    month:  parseInt(mes),
    day:    parseInt(dia),
    hour:   parseInt(hora),
    minute: parseInt(minuto),
    second: 0,
    longitude: lon,
    latitude:  lat,
  };

  const res = await fetch('https://api.bodygraphchart.com/v20230211/hd-chart', {
    method: 'POST',
    headers: {
      'Authorization': process.env.BODYGRAPH_API_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Bodygraph API error ${res.status}: ${txt}`);
  }

  return await res.json();
}

// ── Helper: gerar PDF com identidade Vida Autoral ─────────────────────────
async function gerarPDF(nome, mapa) {
  const pdfDoc = await PDFDocument.create();

  // ── Cores da marca ──
  const milkyCoffee  = rgb(0.608, 0.490, 0.380);   // #9B7D61
  const roastedPeach = rgb(0.855, 0.639, 0.561);   // #DAA38F
  const wholeWheat   = rgb(0.914, 0.843, 0.753);   // #E9D7C0
  const eucalyptus   = rgb(0.573, 0.678, 0.643);   // #92ADA4
  const cream        = rgb(0.996, 0.847, 0.651);   // #FED8A6
  const darkBrown    = rgb(0.102, 0.082, 0.063);
  const white        = rgb(1, 1, 1);
  const lightGray    = rgb(0.96, 0.94, 0.91);

  // ── Fontes ──
  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // ══════════════════════════════════════════════════════════
  // PÁGINA 1 — Capa
  // ══════════════════════════════════════════════════════════
  const capa = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = capa.getSize();

  // Fundo warm
  capa.drawRectangle({ x:0, y:0, width, height, color: wholeWheat });

  // Bloco decorativo direito
  capa.drawRectangle({ x: width*0.6, y:0, width: width*0.4, height, color: roastedPeach, opacity:0.35 });

  // Triângulo invertido (logo) — desenhado como linhas
  const cx = width / 2, ty = height * 0.55, ts = 60;
  capa.drawLine({ start:{x: cx - ts, y: ty + ts*0.85}, end:{x: cx + ts, y: ty + ts*0.85}, color: milkyCoffee, thickness: 1.5 });
  capa.drawLine({ start:{x: cx - ts, y: ty + ts*0.85}, end:{x: cx,       y: ty - ts*0.15}, color: milkyCoffee, thickness: 1.5 });
  capa.drawLine({ start:{x: cx + ts, y: ty + ts*0.85}, end:{x: cx,       y: ty - ts*0.15}, color: milkyCoffee, thickness: 1.5 });
  // triângulo interno menor
  capa.drawLine({ start:{x: cx - ts*0.55, y: ty + ts*0.55}, end:{x: cx + ts*0.55, y: ty + ts*0.55}, color: milkyCoffee, thickness: 0.75, opacity:0.5 });
  capa.drawLine({ start:{x: cx - ts*0.55, y: ty + ts*0.55}, end:{x: cx,            y: ty + ts*0.0},  color: milkyCoffee, thickness: 0.75, opacity:0.5 });
  capa.drawLine({ start:{x: cx + ts*0.55, y: ty + ts*0.55}, end:{x: cx,            y: ty + ts*0.0},  color: milkyCoffee, thickness: 0.75, opacity:0.5 });

  // Linha decorativa topo
  capa.drawRectangle({ x:60, y: height-80, width: 40, height: 1, color: milkyCoffee });

  // VIDA AUTORAL
  capa.drawText('VIDA AUTORAL', { x:110, y: height-76, size:9, font:fontBold, color:milkyCoffee, characterSpacing:3 });

  // Título principal
  capa.drawText('SEU MAPA DE', { x:60, y: height*0.75, size:28, font:fontBold, color:darkBrown, characterSpacing:2 });
  capa.drawText('DESENHO HUMANO', { x:60, y: height*0.75-38, size:28, font:fontBold, color:milkyCoffee, characterSpacing:2 });

  // Linha separadora
  capa.drawRectangle({ x:60, y: height*0.75-52, width:260, height:1, color:roastedPeach });

  // Nome da pessoa
  capa.drawText(`Preparado para`, { x:60, y: height*0.75-75, size:10, font:fontReg, color:rgb(0.5,0.4,0.3), characterSpacing:1 });
  capa.drawText(nome.toUpperCase(), { x:60, y: height*0.75-95, size:14, font:fontBold, color:darkBrown, characterSpacing:1.5 });

  // Subtítulo
  capa.drawText('Autoconhecimento · Estratégia · Propósito', { x:60, y: height*0.42, size:9, font:fontOblique, color:rgb(0.55,0.45,0.35), characterSpacing:0.5 });

  // Footer capa
  capa.drawRectangle({ x:0, y:0, width, height:50, color:milkyCoffee });
  capa.drawText('vidaautoral.com', { x:width/2 - 45, y:18, size:9, font:fontReg, color:white, characterSpacing:1 });

  // ══════════════════════════════════════════════════════════
  // PÁGINA 2 — Perfil Principal
  // ══════════════════════════════════════════════════════════
  const p2 = pdfDoc.addPage([595, 842]);

  // Header
  p2.drawRectangle({ x:0, y: height-70, width, height:70, color:milkyCoffee });
  p2.drawText('VIDA AUTORAL', { x:40, y: height-30, size:8, font:fontBold, color:white, characterSpacing:3, opacity:0.7 });
  p2.drawText('Seu Perfil de Desenho Humano', { x:40, y: height-52, size:16, font:fontBold, color:white, characterSpacing:0.5 });

  // Extrair dados do mapa
  const tipo       = mapa?.type || 'generator';
  const tipoInfo   = TIPOS[tipo] || TIPOS['generator'];
  const autoridade = mapa?.authority || 'sacral';
  const autoridadeNome = AUTORIDADES[autoridade] || autoridade;
  const perfil     = mapa?.profile ? `${mapa.profile[0]}/${mapa.profile[1]}` : '—';
  const definicao  = mapa?.definition === 'single'  ? 'Simples' :
                     mapa?.definition === 'split'    ? 'Bipartida' :
                     mapa?.definition === 'triple'   ? 'Tripartida' :
                     mapa?.definition === 'quadruple'? 'Quadripartida' : (mapa?.definition || '—');
  const crossName  = mapa?.cross?.name || '—';

  // Cards de destaque — linha 1
  const cards1 = [
    { label: 'TIPO',       valor: tipoInfo.nome,      cor: milkyCoffee  },
    { label: 'AUTORIDADE', valor: autoridadeNome,      cor: eucalyptus   },
    { label: 'PERFIL',     valor: perfil,              cor: roastedPeach },
  ];

  let cx2 = 35;
  cards1.forEach(card => {
    p2.drawRectangle({ x:cx2, y: height-175, width:165, height:85, color:card.cor, opacity:0.15 });
    p2.drawRectangle({ x:cx2, y: height-175, width:165, height:3,  color:card.cor });
    p2.drawText(card.label, { x:cx2+12, y: height-115, size:7, font:fontBold, color:card.cor, characterSpacing:2 });
    p2.drawText(card.valor, { x:cx2+12, y: height-140, size:11, font:fontBold, color:darkBrown });
    cx2 += 175;
  });

  // Cards linha 2
  const cards2 = [
    { label: 'ESTRATÉGIA', valor: tipoInfo.estrategia,  cor: milkyCoffee  },
    { label: 'DEFINIÇÃO',  valor: definicao,            cor: eucalyptus   },
    { label: 'ASSINATURA', valor: tipoInfo.tema,         cor: roastedPeach },
  ];

  let cx3 = 35;
  cards2.forEach(card => {
    p2.drawRectangle({ x:cx3, y: height-275, width:165, height:80, color:card.cor, opacity:0.1 });
    p2.drawRectangle({ x:cx3, y: height-275, width:165, height:2,  color:card.cor, opacity:0.6 });
    p2.drawText(card.label, { x:cx3+12, y: height-215, size:7, font:fontBold, color:card.cor, characterSpacing:2 });
    p2.drawText(card.valor, { x:cx3+12, y: height-240, size:10, font:fontBold, color:darkBrown });
    cx3 += 175;
  });

  // Seção — Sobre seu Tipo
  p2.drawRectangle({ x:35, y: height-320, width:525, height:1, color:wholeWheat, opacity:0.8 });
  p2.drawText('SOBRE O SEU TIPO', { x:35, y: height-345, size:9, font:fontBold, color:milkyCoffee, characterSpacing:2 });

  const descTipo = getTipoDescricao(tipo);
  const linhasTipo = quebrarTexto(descTipo, 90);
  let yTipo = height - 368;
  linhasTipo.slice(0,5).forEach(linha => {
    p2.drawText(linha, { x:35, y:yTipo, size:10, font:fontReg, color:darkBrown });
    yTipo -= 16;
  });

  // Seção — Estratégia
  p2.drawRectangle({ x:35, y:yTipo - 15, width:525, height:1, color:wholeWheat, opacity:0.8 });
  p2.drawText('SUA ESTRATÉGIA', { x:35, y:yTipo-38, size:9, font:fontBold, color:milkyCoffee, characterSpacing:2 });

  const descEst = getEstrategiaDescricao(tipo);
  const linhasEst = quebrarTexto(descEst, 90);
  let yEst = yTipo - 60;
  linhasEst.slice(0,4).forEach(linha => {
    p2.drawText(linha, { x:35, y:yEst, size:10, font:fontReg, color:darkBrown });
    yEst -= 16;
  });

  // Seção — Autoridade
  p2.drawRectangle({ x:35, y:yEst-15, width:525, height:1, color:wholeWheat, opacity:0.8 });
  p2.drawText('SUA AUTORIDADE INTERNA', { x:35, y:yEst-38, size:9, font:fontBold, color:milkyCoffee, characterSpacing:2 });

  const descAut = getAutoridadeDescricao(autoridade);
  const linhasAut = quebrarTexto(descAut, 90);
  let yAut = yEst - 60;
  linhasAut.slice(0,4).forEach(linha => {
    p2.drawText(linha, { x:35, y:yAut, size:10, font:fontReg, color:darkBrown });
    yAut -= 16;
  });

  // Cruz de encarnação
  if (crossName && crossName !== '—') {
    p2.drawRectangle({ x:35, y:yAut-15, width:525, height:1, color:wholeWheat, opacity:0.8 });
    p2.drawText('CRUZ DE ENCARNAÇÃO', { x:35, y:yAut-38, size:9, font:fontBold, color:milkyCoffee, characterSpacing:2 });
    p2.drawText(crossName, { x:35, y:yAut-58, size:11, font:fontBold, color:darkBrown });
  }

  // Footer p2
  p2.drawRectangle({ x:0, y:0, width, height:40, color:lightGray });
  p2.drawText('Vida Autoral  ·  Seu mapa é único — assim como você.', { x:40, y:14, size:8, font:fontOblique, color:milkyCoffee });
  p2.drawText('2', { x:width-40, y:14, size:8, font:fontReg, color:milkyCoffee });

  // ══════════════════════════════════════════════════════════
  // PÁGINA 3 — Centros Definidos / Canais / Portas
  // ══════════════════════════════════════════════════════════
  const p3 = pdfDoc.addPage([595, 842]);

  // Header
  p3.drawRectangle({ x:0, y: height-70, width, height:70, color:eucalyptus, opacity:0.8 });
  p3.drawText('VIDA AUTORAL', { x:40, y: height-30, size:8, font:fontBold, color:white, characterSpacing:3, opacity:0.7 });
  p3.drawText('Centros, Canais e Portas Ativas', { x:40, y: height-52, size:16, font:fontBold, color:white });

  // Centros definidos
  const centrosDefinidos   = mapa?.defined_centers   || [];
  const centrosNaoDefinidos = mapa?.undefined_centers || [];

  p3.drawText('CENTROS DEFINIDOS', { x:35, y: height-105, size:9, font:fontBold, color:milkyCoffee, characterSpacing:2 });

  if (centrosDefinidos.length === 0) {
    p3.drawText('Nenhum centro definido encontrado nos dados.', { x:35, y: height-128, size:10, font:fontOblique, color:rgb(0.6,0.5,0.4) });
  } else {
    let xC = 35, yC = height - 128;
    centrosDefinidos.forEach((centro, i) => {
      p3.drawRectangle({ x:xC, y:yC-20, width:120, height:26, color:milkyCoffee, opacity:0.15 });
      p3.drawRectangle({ x:xC, y:yC+6, width:120, height:2, color:milkyCoffee, opacity:0.7 });
      p3.drawText(String(centro).toUpperCase(), { x:xC+8, y:yC-12, size:9, font:fontBold, color:darkBrown });
      xC += 130;
      if ((i+1) % 4 === 0) { xC = 35; yC -= 36; }
    });
  }

  // Canais
  const canais = mapa?.channels || [];
  let yCh = height - 230;

  p3.drawRectangle({ x:35, y:yCh, width:525, height:1, color:wholeWheat });
  yCh -= 25;
  p3.drawText('CANAIS ATIVOS', { x:35, y:yCh, size:9, font:fontBold, color:milkyCoffee, characterSpacing:2 });
  yCh -= 22;

  if (canais.length === 0) {
    p3.drawText('Nenhum canal ativo encontrado nos dados.', { x:35, y:yCh, size:10, font:fontOblique, color:rgb(0.6,0.5,0.4) });
    yCh -= 20;
  } else {
    let xCh = 35;
    canais.slice(0, 12).forEach((canal, i) => {
      const nomeCan = typeof canal === 'object' ? `${canal.gate1}-${canal.gate2}` : String(canal);
      p3.drawRectangle({ x:xCh, y:yCh-18, width:120, height:24, color:eucalyptus, opacity:0.12 });
      p3.drawText(nomeCan, { x:xCh+8, y:yCh-10, size:9, font:fontBold, color:darkBrown });
      xCh += 130;
      if ((i+1) % 4 === 0) { xCh = 35; yCh -= 30; }
    });
    yCh -= 35;
  }

  // Portas ativas
  const portas = mapa?.active_gates || mapa?.gates || [];
  p3.drawRectangle({ x:35, y:yCh, width:525, height:1, color:wholeWheat });
  yCh -= 25;
  p3.drawText('PORTAS ATIVAS', { x:35, y:yCh, size:9, font:fontBold, color:milkyCoffee, characterSpacing:2 });
  yCh -= 22;

  if (portas.length > 0) {
    const portasStr = portas.slice(0,30).join('  ·  ');
    const linhasP = quebrarTexto(portasStr, 85);
    linhasP.forEach(l => {
      p3.drawText(l, { x:35, y:yCh, size:10, font:fontReg, color:darkBrown });
      yCh -= 16;
    });
  }

  // Mensagem final
  p3.drawRectangle({ x:35, y:120, width:525, height:90, color:cream, opacity:0.5 });
  p3.drawRectangle({ x:35, y:210, width:525, height:2, color:roastedPeach, opacity:0.6 });
  p3.drawText('Uma mensagem da Vida Autoral', { x:55, y:186, size:9, font:fontBold, color:milkyCoffee, characterSpacing:1 });
  const msg = 'Seu mapa não é uma caixa — é um convite para se conhecer mais profundamente. Use-o como uma bússola, não como um limite. Você é muito mais do que qualquer sistema pode capturar.';
  const linhasMsg = quebrarTexto(msg, 85);
  let yMsg = 168;
  linhasMsg.forEach(l => {
    p3.drawText(l, { x:55, y:yMsg, size:9.5, font:fontOblique, color:rgb(0.3,0.22,0.15) });
    yMsg -= 15;
  });

  // Footer p3
  p3.drawRectangle({ x:0, y:0, width, height:40, color:lightGray });
  p3.drawText('Vida Autoral  ·  Seu mapa é único — assim como você.', { x:40, y:14, size:8, font:fontOblique, color:milkyCoffee });
  p3.drawText('3', { x:width-40, y:14, size:8, font:fontReg, color:milkyCoffee });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}

// ── Descrições por tipo ────────────────────────────────────────────────────
function getTipoDescricao(tipo) {
  const desc = {
    generator: 'Você é uma Geradora — o motor do mundo. Sua energia vital é magnética e sustentada quando você está fazendo o que ama. Você foi projetada para responder à vida, não para iniciá-la no vácuo. Quando seu Sacral diz sim, você tem energia para tudo.',
    manifesting_generator: 'Você é uma Geradora Manifestadora — uma combinação poderosa de energia e capacidade de manifestação. Você pode mover-se rapidamente entre projetos e interesses múltiplos. Aprenda a responder primeiro e depois informar os outros sobre seus planos.',
    projector: 'Você é uma Projetora — uma guia natural de sistemas e pessoas. Sua sabedoria é profunda e sua capacidade de ver o outro é extraordinária. Você foi projetada para aguardar o convite certo antes de compartilhar sua visão.',
    manifestor: 'Você é uma Manifestadora — uma força iniciadora rara no mundo. Você tem o poder de começar coisas e impactar os outros de formas que poucas pessoas conseguem. Informar antes de agir é a chave para reduzir a resistência em sua vida.',
    reflector: 'Você é uma Refletora — um espelho raro da comunidade ao seu redor. Você reflete a saúde do ambiente em que está. Aguardar um ciclo lunar completo antes de grandes decisões permite que você tome decisões claras e alinhadas.',
  };
  return desc[tipo] || desc['generator'];
}

function getEstrategiaDescricao(tipo) {
  const desc = {
    generator: 'Aguarde que algo na vida chame sua atenção e observe o que acontece no seu corpo. Quando seu Sacral responde com um "ahn-hã" interno — uma sensação de expansão e energia — esse é o sinal para avançar. Decisões tomadas sem essa resposta tendem a gerar frustração.',
    manifesting_generator: 'Responda ao que aparece na sua vida, mas lembre-se de informar as pessoas impactadas antes de agir. Sua velocidade é um dom — use-a com consciência. Múltiplos interesses ao mesmo tempo são naturais para você.',
    projector: 'Espere ser reconhecida e convidada antes de oferecer sua sabedoria. Quando o convite certo chega — seja para um trabalho, relacionamento ou projeto — você tem toda a permissão para brilhar com sua capacidade natural de guiar.',
    manifestor: 'Antes de agir, informe as pessoas que serão afetadas pelas suas ações. Isso não é pedir permissão — é reduzir a resistência que naturalmente surge ao seu redor. Sua independência é um poder; use-a com consciência.',
    reflector: 'Grandes decisões pedem tempo. Aguarde pelo menos 28 dias — um ciclo lunar completo — antes de decidir sobre mudanças significativas. Nesse período, converse com pessoas diferentes e observe como você se sente em ambientes distintos.',
  };
  return desc[tipo] || '';
}

function getAutoridadeDescricao(autoridade) {
  const desc = {
    sacral:    'Sua autoridade é Sacral — pré-verbal e corporal. O que seu corpo sente antes da mente falar? Uma sensação de expansão e energia é um "sim". Contração e peso é um "não". Pratique ouvir seu corpo antes de racionalizar.',
    emotional: 'Sua autoridade é Emocional — você precisa de tempo para processar antes de decidir. Nunca tome grandes decisões no pico da emoção (nem na alta, nem na baixa). Espere a clareza emocional. "Durma sobre isso" é sua sabedoria.',
    splenic:   'Sua autoridade é Esplênica — intuitiva e instantânea. É uma voz suave que fala uma vez e não repete. Aprenda a reconhecer e confiar nessa percepção corporal imediata, especialmente sobre segurança e saúde.',
    ego:       'Sua autoridade é do Ego — o que você realmente quer para si mesma? Suas promessas e compromissos pessoais guiam suas decisões. Pergunte: "Isso serve ao meu coração? Eu realmente quero isso?"',
    self:      'Sua autoridade é do Self/G — preste atenção no ambiente e nas pessoas ao seu redor. Quando você está no lugar certo com as pessoas certas, as decisões fluem naturalmente. Deixe a vida te levar ao lugar certo.',
    lunar:     'Sua autoridade é Lunar — você precisa de um ciclo completo de 28 dias para grandes decisões. Converse com pessoas diferentes, observe seus sentimentos em contextos variados e deixe a clareza emergir com o tempo.',
    none:      'Sua autoridade é Mental/Ambiental — você não foi projetada para decidir sozinha. Converse com pessoas de confiança, vá a lugares diferentes e observe o que surge quando você fala sobre a decisão em voz alta.',
  };
  return desc[autoridade] || desc['sacral'];
}

// ── Helper: quebrar texto em linhas ───────────────────────────────────────
function quebrarTexto(texto, maxCaracteres) {
  const palavras = texto.split(' ');
  const linhas = [];
  let atual = '';
  palavras.forEach(p => {
    if ((atual + ' ' + p).trim().length <= maxCaracteres) {
      atual = (atual + ' ' + p).trim();
    } else {
      if (atual) linhas.push(atual);
      atual = p;
    }
  });
  if (atual) linhas.push(atual);
  return linhas;
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { nome, email, data, hora, pais, cidade } = req.body;

    if (!nome || !email || !data || !hora || !cidade) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    // Parse data
    const [ano, mes, dia]   = data.split('-');
    const [horaH, horaM]    = hora.split(':');

    // Buscar coordenadas da cidade
    const geo = await buscarCidade(cidade, pais);
    if (!geo) {
      return res.status(400).json({ erro: 'Não foi possível encontrar a cidade informada. Tente ser mais específica.' });
    }

    // Calcular mapa
    const mapa = await calcularMapa({
      ano, mes, dia,
      hora: horaH, minuto: horaM,
      lat: geo.lat, lon: geo.lon,
    });

    // Gerar PDF
    const pdfBase64 = await gerarPDF(nome, mapa);

    // Enviar email
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from:    'Vida Autoral <mapa@vidaautoral.com.br>',
      to:      [email],
      subject: `${nome}, seu Mapa de Desenho Humano chegou ✦`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3a2e25;">
          <div style="background:#9B7D61;padding:32px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:3px;margin:0 0 8px;">VIDA AUTORAL</p>
            <h1 style="color:#fff;font-size:22px;font-weight:400;margin:0;letter-spacing:1px;">Seu Mapa Chegou ✦</h1>
          </div>
          <div style="padding:40px;background:#fdf8f3;">
            <p style="font-size:16px;margin:0 0 20px;">Olá, <strong>${nome}</strong>,</p>
            <p style="font-size:14px;line-height:1.8;color:#6b5744;margin:0 0 16px;">
              Seu mapa de Desenho Humano foi calculado e está em anexo neste email — em PDF, pronto para você ler com calma.
            </p>
            <p style="font-size:14px;line-height:1.8;color:#6b5744;margin:0 0 24px;">
              Cada elemento do seu mapa é um convite para o autoconhecimento. Não há nada "bom" ou "ruim" aqui — tudo é informação sobre como você foi projetada para viver com mais autenticidade e energia.
            </p>
            <div style="border-left:3px solid #DAA38F;padding:16px 20px;background:#FED8A6;margin:24px 0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:13px;font-style:italic;color:#7a5c40;">
                "Seu design não é uma caixa — é uma bússola."
              </p>
            </div>
            <p style="font-size:14px;line-height:1.8;color:#6b5744;margin:0 0 8px;">
              Com carinho,
            </p>
            <p style="font-size:14px;color:#9B7D61;font-weight:bold;margin:0;">Equipe Vida Autoral</p>
          </div>
          <div style="background:#e9d7c0;padding:20px 40px;text-align:center;">
            <p style="font-size:11px;color:#9B7D61;letter-spacing:1px;margin:0;">© Vida Autoral · Todos os direitos reservados</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: `mapa-desenho-humano-${nome.toLowerCase().replace(/\s+/g,'-')}.pdf`,
        content:  pdfBase64,
      }],
    });

    return res.status(200).json({ sucesso: true, mensagem: 'Mapa enviado com sucesso!' });

  } catch (erro) {
    console.error('Erro ao processar mapa:', erro);
    return res.status(500).json({ erro: 'Ocorreu um erro ao calcular seu mapa. Tente novamente em breve.' });
  }
};
