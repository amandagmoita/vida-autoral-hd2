// Edge Function - V8 Isolate runtime (nao e o Fluid/Node runtime)
// WASM funciona corretamente aqui.
// Recebe SVG via POST, retorna PNG via resvg-wasm.

export const config = { runtime: 'edge' };

// URL base do WASM - servido como asset estatico pelo Vercel
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.0/index_bg.wasm';

let initialized = false;
let ResvgClass = null;

async function ensureResvg() {
  if (initialized) return;
  const { Resvg, initWasm } = await import('@resvg/resvg-wasm');
  ResvgClass = Resvg;
  const wasmResp = await fetch(WASM_URL);
  await initWasm(wasmResp);
  initialized = true;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verifica secret interno para evitar chamadas externas
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.INTERNAL_SECRET || 'vida-autoral-render';
  if (secret !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await ensureResvg();

    const svg = await req.text();
    if (!svg || !svg.includes('<svg')) {
      return new Response('Invalid SVG', { status: 400 });
    }

    // Garante que o SVG tem dimensoes explicitas
    let svgFixed = svg;
    if (!svg.includes(' width=') || !svg.includes(' height=')) {
      const vb = svg.match(/viewBox=["']([^"']+)["']/);
      if (vb) {
        const parts = vb[1].trim().split(/[\s,]+/);
        const w = parseFloat(parts[2]) || 500;
        const h = parseFloat(parts[3]) || 600;
        svgFixed = svg.replace('<svg', `<svg width="${w}" height="${h}"`);
      }
    }

    const resvg = new ResvgClass(svgFixed, {
      fitTo: { mode: 'width', value: 700 },
      background: '#ffffff',
    });
    const png = resvg.render().asPng();

    return new Response(png, {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (e) {
    console.error('[render] Erro:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
