// ============================================================================
//  scripts/gerar-ilustracoes.js — GERA AS ILUSTRAÇÕES DOS PRODUTOS SEM FOTO
// ----------------------------------------------------------------------------
//  Uso:  npm run img:ilustracoes
//  Cria public/images/<slug-do-produto>.jpg (800x800) para todo produto do
//  cardápio que NÃO tem foto real em IMAGENS (prisma/cardapio-data.js).
//  São ilustrações vetoriais no tema escuro/laranja do site (garrafas, latas,
//  copos, porções...). Para usar uma FOTO REAL no lugar, salve o .jpg com o
//  mesmo nome em public/images e rode `npm run db:cardapio`.
// ============================================================================
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { PRODUTOS, IMAGENS, slugify } = require('../prisma/cardapio-data');

const OUT = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(OUT, { recursive: true });

// ─── utilidades ─────────────────────────────────────────────────────────────
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
function rng(seed) { // mulberry32
  let a = [...seed].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const grad = (id, c) => `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${shade(c, -0.4)}"/><stop offset=".3" stop-color="${shade(c, 0.28)}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.5)}"/></linearGradient>`;

function wrap(inner, glow = '#FF6B00', kind = 'item') {
  // O card mostra a imagem em 16:10 (recorta topo/base do quadrado) → reduz e centraliza o desenho.
  const [s, cy] = kind === 'food' ? [1.1, 560] : [0.78, 414];
  const g = `translate(400 400) scale(${s}) translate(-400 -${cy})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
<defs>
<radialGradient id="bg" cx=".5" cy=".55" r=".75"><stop offset="0" stop-color="#2a1d14"/><stop offset=".6" stop-color="#151210"/><stop offset="1" stop-color="#0b0b0b"/></radialGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${glow}" stop-opacity=".42"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
<radialGradient id="ember" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FF6B00" stop-opacity=".35"/><stop offset="1" stop-color="#FF6B00" stop-opacity="0"/></radialGradient>
<filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
</defs>
<rect width="800" height="800" fill="url(#bg)"/>
<ellipse cx="400" cy="400" rx="330" ry="330" fill="url(#glow)"/>
<ellipse cx="400" cy="770" rx="420" ry="120" fill="url(#ember)"/>
<g transform="${g}">
<ellipse cx="400" cy="672" rx="230" ry="26" fill="#000" opacity=".55" filter="url(#blur)"/>
${inner}
</g>
</svg>`;
}

// ─── desenhos ───────────────────────────────────────────────────────────────
function limeSlice(x, y, r = 46) {
  let seg = '';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; seg += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(a) * (r - 8)}" y2="${y + Math.sin(a) * (r - 8)}" stroke="#d9f27a" stroke-width="3"/>`; }
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#5aa02c"/><circle cx="${x}" cy="${y}" r="${r - 7}" fill="#b6e04f"/>${seg}`;
}
function orangeSlice(x, y, r = 50) {
  let seg = '';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; seg += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(a) * (r - 8)}" y2="${y + Math.sin(a) * (r - 8)}" stroke="#ffd08a" stroke-width="3"/>`; }
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#f08a1a"/><circle cx="${x}" cy="${y}" r="${r - 7}" fill="#ffb347"/>${seg}`;
}

// garrafa 600ml / 1L
function bottle(o, scale = 1) {
  const body = 'M 378 175 L 422 175 L 422 275 C 422 305 478 322 478 375 L 478 640 Q 478 656 462 656 L 338 656 Q 322 656 322 640 L 322 375 C 322 322 378 305 378 275 Z';
  const base = o.glass || '#7b3a0e';
  const liquid = o.liquid || (o.clear ? '#f0b323' : shade(base, 0.25));
  const label = o.label || '#eee', acc = o.accent || '#c8102e';
  return `<g transform="translate(400 656) scale(${scale}) translate(-400 -656)">
<defs>${grad('gb', o.clear ? liquid : base)}<clipPath id="cb"><path d="${body}"/></clipPath></defs>
<path d="${body}" fill="${o.clear ? '#cfe6ea' : 'url(#gb)'}" opacity="${o.clear ? 0.35 : 1}"/>
<g clip-path="url(#cb)">
${o.clear ? `<rect x="300" y="300" width="200" height="380" fill="url(#gb)" opacity=".95"/><rect x="300" y="296" width="200" height="12" fill="#fff" opacity=".8"/>` : ''}
<rect x="300" y="430" width="200" height="130" fill="${label}"/>
<rect x="300" y="430" width="200" height="16" fill="${acc}"/>
<rect x="300" y="544" width="200" height="16" fill="${acc}"/>
<circle cx="400" cy="495" r="26" fill="${acc}"/><circle cx="400" cy="495" r="15" fill="${label}"/>
<rect x="340" y="330" width="16" height="310" rx="8" fill="#fff" opacity=".2"/>
</g>
<path d="${body}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
<rect x="372" y="150" width="56" height="30" rx="8" fill="${o.cap || '#c8102e'}"/>
<rect x="372" y="150" width="56" height="9" rx="4" fill="#fff" opacity=".25"/>
${o.lime ? limeSlice(430, 160, 40) : ''}
</g>`;
}
function longneck(o) {
  const body = 'M 387 135 L 413 135 L 413 340 C 413 372 456 392 456 440 L 456 640 Q 456 654 442 654 L 358 654 Q 344 654 344 640 L 344 440 C 344 392 387 372 387 340 Z';
  const base = o.glass || '#1f7a3a';
  const liquid = o.liquid || '#f0b323';
  const label = o.label || '#eee', acc = o.accent || '#c8102e';
  return `<defs>${grad('gl', o.clear ? liquid : base)}<clipPath id="cl"><path d="${body}"/></clipPath></defs>
<path d="${body}" fill="${o.clear ? '#cfe6ea' : 'url(#gl)'}" opacity="${o.clear ? 0.35 : 1}"/>
<g clip-path="url(#cl)">
${o.clear ? `<rect x="330" y="350" width="140" height="320" fill="url(#gl)" opacity=".95"/>` : ''}
<rect x="330" y="470" width="140" height="110" fill="${label}"/>
<rect x="330" y="470" width="140" height="14" fill="${acc}"/>
<rect x="330" y="566" width="140" height="14" fill="${acc}"/>
<circle cx="400" cy="525" r="22" fill="${acc}"/><circle cx="400" cy="525" r="12" fill="${label}"/>
<rect x="360" y="360" width="13" height="270" rx="6" fill="#fff" opacity=".22"/>
</g>
<path d="${body}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
<rect x="382" y="112" width="36" height="26" rx="7" fill="${o.cap || '#c8102e'}"/>
${o.lime ? limeSlice(425, 120, 34) : ''}`;
}
function can(o) {
  const w = o.slim ? 150 : 200, x = 400 - w / 2;
  const body = o.body || '#c8102e', stripe = o.stripe || '#fff';
  return `<defs>${grad('gc', body)}${grad('gm', '#cfd4d8')}</defs>
<rect x="${x + 6}" y="205" width="${w - 12}" height="36" rx="10" fill="url(#gm)"/>
<rect x="${x}" y="228" width="${w}" height="424" rx="22" fill="url(#gc)"/>
<rect x="${x}" y="360" width="${w}" height="26" fill="${stripe}" opacity=".95"/>
<rect x="${x}" y="500" width="${w}" height="16" fill="${stripe}" opacity=".95"/>
<ellipse cx="400" cy="443" rx="${o.slim ? 40 : 56}" ry="${o.slim ? 40 : 56}" fill="${shade(body, -0.3)}" stroke="${stripe}" stroke-width="5"/>
<circle cx="400" cy="443" r="${o.slim ? 18 : 26}" fill="${stripe}"/>
<rect x="${x + 22}" y="250" width="14" height="380" rx="7" fill="#fff" opacity=".28"/>
<rect x="${x + 6}" y="636" width="${w - 12}" height="22" rx="9" fill="url(#gm)"/>
<ellipse cx="400" cy="214" rx="${w / 2 - 22}" ry="9" fill="#9aa1a6"/><rect x="${400 - 22}" y="209" width="44" height="9" rx="4" fill="#6c7378"/>`;
}
function glass(o) {
  const liquid = o.liquid || '#d98a1c';
  const top = 300 + (o.fill ?? 40);
  return `<defs><clipPath id="cg"><path d="M 305 300 L 495 300 L 468 650 L 332 650 Z"/></clipPath></defs>
<path d="M 305 300 L 495 300 L 468 650 L 332 650 Z" fill="#cfe6ea" opacity=".16"/>
<g clip-path="url(#cg)">
<rect x="300" y="${top}" width="200" height="${660 - top}" fill="${liquid}" opacity="${o.opacity ?? 0.88}"/>
${o.ice ? `<rect x="338" y="${top + 14}" width="62" height="62" rx="12" fill="#fff" opacity=".4" transform="rotate(-12 369 ${top + 45})"/><rect x="400" y="${top + 60}" width="64" height="64" rx="12" fill="#fff" opacity=".34" transform="rotate(10 432 ${top + 92})"/><rect x="352" y="${top + 130}" width="58" height="58" rx="12" fill="#fff" opacity=".3" transform="rotate(8 381 ${top + 159})"/>` : ''}
${o.lime ? `<circle cx="420" cy="${top + 80}" r="34" fill="#9cd04a" opacity=".85"/><circle cx="360" cy="${top + 170}" r="30" fill="#b6e04f" opacity=".8"/>` : ''}
<rect x="326" y="310" width="16" height="320" rx="8" fill="#fff" opacity=".22"/>
</g>
<path d="M 305 300 L 495 300 L 468 650 L 332 650 Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>
<rect x="334" y="630" width="132" height="22" rx="6" fill="#fff" opacity=".18"/>
${o.straw ? `<rect x="430" y="170" width="14" height="300" rx="6" fill="${o.straw}" transform="rotate(10 437 320)"/>` : ''}
${o.garnish === 'lime' ? limeSlice(488, 306, 44) : ''}${o.garnish === 'orange' ? orangeSlice(488, 306, 48) : ''}`;
}
function shot(o) {
  const liquid = o.liquid || '#e8a31c';
  const topY = 470 + (o.fill ?? 30);
  return `<defs><clipPath id="cs"><path d="M 335 440 L 465 440 L 445 650 L 355 650 Z"/></clipPath></defs>
<path d="M 335 440 L 465 440 L 445 650 L 355 650 Z" fill="#cfe6ea" opacity=".2"/>
<g clip-path="url(#cs)"><rect x="330" y="${topY}" width="140" height="${660 - topY}" fill="${liquid}" opacity=".92"/>
<rect x="352" y="450" width="12" height="190" rx="6" fill="#fff" opacity=".28"/></g>
<path d="M 335 440 L 465 440 L 445 650 L 355 650 Z" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4"/>
<rect x="356" y="620" width="88" height="30" rx="6" fill="#fff" opacity=".25"/>
${o.garnish === 'lime' ? limeSlice(462, 446, 30) : ''}`;
}
function carton(o) {
  const c = o.color;
  return `<defs>${grad('gk', c)}</defs>
<polygon points="330,270 400,205 470,270" fill="${shade(c, 0.2)}"/>
<rect x="330" y="270" width="140" height="380" rx="8" fill="url(#gk)"/>
<rect x="330" y="450" width="140" height="70" fill="#fff" opacity=".9"/>
${o.fruit === 'grape' ? [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${372 + (i % 3) * 28 - (i > 2 ? 14 : 0)}" cy="${470 + Math.floor(i / 3) * 28}" r="14" fill="#6a2c91"/>`).join('') : orangeSlice(400, 484, 30)}
<rect x="348" y="285" width="12" height="350" rx="6" fill="#fff" opacity=".25"/>`;
}
function pouch(o) {
  return `<defs>${grad('gp', o.color)}</defs>
<rect x="415" y="150" width="12" height="150" rx="6" fill="#e8e8e8" transform="rotate(8 421 225)"/>
<path d="M 330 300 Q 400 280 470 300 L 480 620 Q 400 650 320 620 Z" fill="url(#gp)"/>
<rect x="330" y="420" width="140" height="90" fill="#fff" opacity=".9"/>${orangeSlice(400, 465, 32)}
<rect x="344" y="320" width="12" height="290" rx="6" fill="#fff" opacity=".25"/>`;
}
function waterBottle(o) {
  const body = 'M 380 190 L 420 190 L 420 260 C 420 290 470 305 470 350 L 470 640 Q 470 656 454 656 L 346 656 Q 330 656 330 640 L 330 350 C 330 305 380 290 380 260 Z';
  const bubbles = o.gas ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${350 + ((i * 37) % 100)}" cy="${380 + ((i * 53) % 230)}" r="${4 + (i % 3) * 2}" fill="#fff" opacity=".65"/>`).join('') : '';
  return `<defs><clipPath id="cw"><path d="${body}"/></clipPath></defs>
<path d="${body}" fill="#bfe3f2" opacity=".35"/>
<g clip-path="url(#cw)"><rect x="320" y="300" width="160" height="370" fill="#7ec8e6" opacity=".35"/>
<rect x="320" y="440" width="160" height="96" fill="#1e6fb3"/><rect x="320" y="440" width="160" height="12" fill="#fff" opacity=".6"/>
<circle cx="400" cy="488" r="22" fill="#fff" opacity=".9"/>${bubbles}
<rect x="348" y="320" width="14" height="300" rx="7" fill="#fff" opacity=".3"/></g>
<path d="${body}" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>
<rect x="378" y="168" width="44" height="26" rx="7" fill="${o.cap || '#1e6fb3'}"/>`;
}

// travessa/tigela com comida (itens espalhados em um monte)
function itemSvg(shape, x, y, a, b, color, rot) {
  const hi = shade(color, 0.3), lo = shade(color, -0.3);
  switch (shape) {
    case 'circle': return `<circle cx="${x}" cy="${y}" r="${a}" fill="${color}" stroke="${lo}" stroke-width="2"/><circle cx="${x - a * 0.3}" cy="${y - a * 0.3}" r="${a * 0.35}" fill="${hi}" opacity=".7"/>`;
    case 'oval': return `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="${color}" stroke="${lo}" stroke-width="2" transform="rotate(${rot} ${x} ${y})"/><ellipse cx="${x - a * 0.25}" cy="${y - b * 0.3}" rx="${a * 0.4}" ry="${b * 0.28}" fill="${hi}" opacity=".6" transform="rotate(${rot} ${x} ${y})"/>`;
    case 'stick': return `<rect x="${x - a}" y="${y - b / 2}" width="${a * 2}" height="${b}" rx="${b / 2.5}" fill="${color}" stroke="${lo}" stroke-width="2" transform="rotate(${rot} ${x} ${y})"/>`;
    case 'ring': return `<circle cx="${x}" cy="${y}" r="${a}" fill="none" stroke="${color}" stroke-width="${b}" opacity=".95"/>`;
    case 'slice': return `<circle cx="${x}" cy="${y}" r="${a}" fill="${color}" stroke="${lo}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${a * 0.55}" fill="${hi}" opacity=".55"/>`;
    case 'half': return `<path d="M ${x - a} ${y} A ${a} ${a} 0 0 1 ${x + a} ${y} Z" fill="${color}" stroke="${lo}" stroke-width="2" transform="rotate(${rot} ${x} ${y})"/>`;
    case 'leaf': return `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="${color}" transform="rotate(${rot} ${x} ${y})"/>`;
    default: return '';
  }
}
function food(seed, o) {
  const r = rng(seed);
  const bowlC = o.bowl || '#4a3428';
  let out = `<defs>${grad('gbw', bowlC)}</defs>`;
  if (o.plate) {
    out += `<ellipse cx="400" cy="560" rx="290" ry="100" fill="#d9d4cc"/><ellipse cx="400" cy="548" rx="250" ry="78" fill="#efeae2"/>`;
  } else {
    out += `<path d="M 160 520 Q 185 705 400 712 Q 615 705 640 520 Z" fill="url(#gbw)"/>
<ellipse cx="400" cy="520" rx="240" ry="62" fill="${shade(bowlC, -0.5)}"/>
<ellipse cx="400" cy="520" rx="240" ry="62" fill="none" stroke="${shade(bowlC, 0.35)}" stroke-width="5"/>`;
  }
  const cy = o.plate ? 540 : 470, rx = o.plate ? 215 : 195, ry = o.plate ? 62 : 80;
  const pts = [];
  for (const layer of o.layers) {
    for (let i = 0; i < layer.n; i++) {
      const t = r() * Math.PI * 2, d = Math.sqrt(r());
      const x = 400 + Math.cos(t) * rx * d, y = cy + Math.sin(t) * ry * d - (1 - d) * (o.plate ? 8 : 40);
      const a = layer.size[0] + r() * (layer.size[1] - layer.size[0]);
      const b = layer.b ? layer.b[0] + r() * (layer.b[1] - layer.b[0]) : a * 0.62;
      const c = layer.colors[Math.floor(r() * layer.colors.length)];
      pts.push({ y, svg: itemSvg(layer.shape, Math.round(x), Math.round(y), +a.toFixed(1), +b.toFixed(1), c, Math.round(r() * 180)) });
    }
  }
  pts.sort((p, q) => p.y - q.y);
  out += pts.map((p) => p.svg).join('');
  if (o.garnish === 'lemon') out += `<g>${limeSlice(560, 470, 44).replace(/#5aa02c/g, '#d9b92a').replace(/#b6e04f/g, '#f6e27a').replace(/#d9f27a/g, '#fff3b0')}</g>`;
  return out;
}
const L = (shape, n, size, colors, b) => ({ shape, n, size, colors, ...(b ? { b } : {}) });

function steakPlate() {
  return food('chorizo', {
    plate: true,
    layers: [
      L('oval', 6, [58, 74], ['#6b3a22', '#7a4528', '#5c3018'], [26, 34]),
      L('stick', 14, [26, 40], ['#f4d66a', '#e8c24a'], [10, 14]),
      L('circle', 10, [14, 20], ['#f4f0e6', '#fff']),
      L('oval', 8, [16, 24], ['#7a4a2a', '#5c3a1f']),
    ],
  });
}

// ─── escolha do desenho por produto ─────────────────────────────────────────
const BR = {
  heineken: { glass: '#1f7a3a', cap: '#d11f2a', label: '#eef5ee', accent: '#1f7a3a' },
  corona: { clear: true, liquid: '#f0b323', cap: '#e3c25a', label: '#f4e6b0', accent: '#2a5aa8', lime: true },
  brahma: { glass: '#7b3a0e', cap: '#c8102e', label: '#c8102e', accent: '#f4c542' },
  antartica: { glass: '#7b3a0e', cap: '#1456a8', label: '#1456a8', accent: '#e8eef7' },
  original: { glass: '#6b3410', cap: '#111111', label: '#14110e', accent: '#d4a017' },
  kaiser: { glass: '#7b3a0e', cap: '#d4a017', label: '#e8c04a', accent: '#a31621' },
  amstel: { glass: '#6b3410', cap: '#c8102e', label: '#f0f0f0', accent: '#c8102e' },
  'stella pure gold': { glass: '#c9972b', cap: '#d4af37', label: '#f6e7a8', accent: '#8a6a12' },
  stella: { glass: '#8a5a14', cap: '#e8e0c8', label: '#f2ead0', accent: '#1d3a6b' },
  imperio: { glass: '#b8860b', cap: '#1456a8', label: '#f3e1a0', accent: '#1456a8' },
  smirnoff: { clear: true, liquid: '#e6f2ea', cap: '#c8102e', label: '#c8102e', accent: '#ffffff', lime: true },
  brutal: { clear: true, liquid: '#e0457b', cap: '#e0457b', label: '#f7c6d6', accent: '#e0457b' },
};
const CN = {
  original: { body: '#1b1b1b', stripe: '#d4a017' }, 'brahma zero': { body: '#8f0d22', stripe: '#cfd4d8' },
  'heineken zero': { body: '#2b8a3e', stripe: '#cfd4d8' }, brahma: { body: '#c8102e', stripe: '#f4f4f4' },
  antartica: { body: '#1456a8', stripe: '#e9eef7' }, amstel: { body: '#b3111f', stripe: '#f0f0f0' },
  kaiser: { body: '#e0b020', stripe: '#a31621' }, coca: { body: '#e41e2b', stripe: '#ffffff' },
  fanta: { body: '#f5821f', stripe: '#ffffff' }, 'guarana': { body: '#2e9e4a', stripe: '#f6d743' },
  limoneto: { body: '#8dc63f', stripe: '#ffffff' }, 'del valle': { body: '#e8731a', stripe: '#2a8a3a' },
  tonica: { body: '#c9d2d9', stripe: '#1456a8' }, 'red bull': { body: '#1c3f8f', stripe: '#c8102e', slim: true },
  'extra power': { body: '#161616', stripe: '#e41e2b', slim: true },
};
function pick(table, nome) {
  const n = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const keys = Object.keys(table).sort((a, b) => b.length - a.length);
  const k = keys.find((k) => n.includes(k));
  return k ? table[k] : Object.values(table)[0];
}

function draw(p) {
  const nome = p.name, n = nome.toLowerCase();
  const cat = p.cat;
  if (cat === 'cervejas-600') { const o = pick(BR, nome); return [bottle(o), o.accent === '#2a5aa8' ? '#f0b323' : o.cap]; }
  if (cat === 'long-neck') {
    const o = n.includes('ice') ? pick(BR, 'smirnoff') : n.includes('brutal') ? BR.brutal : n.includes('heineken') ? BR.heineken : n.includes('stella') ? BR['stella pure gold'] : BR.imperio;
    const oo = n.includes('brutal') ? BR.brutal : n.includes('smirnoff') ? BR.smirnoff : o;
    return [longneck(oo), oo.cap];
  }
  if (cat === 'cervejas-lata' || cat === 'refrigerantes') {
    const o = pick(CN, nome); return [can(o), o.body];
  }
  if (cat === 'refrigerantes-1l') {
    const fanta = n.includes('fanta');
    return [bottle({ glass: fanta ? '#f5821f' : '#3a1a10', cap: fanta ? '#f5821f' : '#e41e2b', label: fanta ? '#f5821f' : '#e41e2b', accent: '#ffffff', liquid: fanta ? '#f5821f' : '#2b120a' }, 1.12), fanta ? '#f5821f' : '#e41e2b'];
  }
  if (cat === 'sucos') {
    if (n.includes('laranja')) return [glass({ liquid: '#f39a1e', ice: true, garnish: 'orange', straw: '#f4f4f4', fill: 30, opacity: 0.95 }), '#f39a1e'];
    if (n.includes('kapo')) return [pouch({ color: '#e8731a' }), '#e8731a'];
    if (n.includes('uva')) return [carton({ color: '#7b2fa8', fruit: 'grape' }), '#7b2fa8'];
    return [waterBottle({ gas: n.includes('com g') }), '#1e6fb3'];
  }
  if (cat === 'doses') {
    if (n.includes('campari')) return [shot({ liquid: '#c4122a', garnish: 'orange' }), '#c4122a'];
    if (n.includes('vodka') && n.includes('caipi')) return [glass({ liquid: '#eaf4f0', ice: true, lime: true, garnish: 'lime', straw: '#f4f4f4', fill: 50, opacity: 0.8 }), '#8cc63f'];
    if (n.includes('caipirinha')) return [glass({ liquid: '#d6e86a', ice: true, lime: true, garnish: 'lime', straw: '#7bc043', fill: 50, opacity: 0.85 }), '#8cc63f'];
    if (n.includes('whisky')) return [glass({ liquid: '#b8691a', ice: true, fill: 150, opacity: 0.9 }), '#b8691a'];
    if (n.includes('gin')) return [glass({ liquid: '#dff1f0', ice: true, lime: true, garnish: 'lime', fill: 70, opacity: 0.75 }), '#6fb7b0'];
    if (n.includes('vodka')) return [shot({ liquid: '#e9f3f2', garnish: 'lime' }), '#9ad0cb'];
    return [shot({ liquid: '#e6c15a' }), '#e6c15a']; // cachaça
  }
  if (cat === 'pratos') return [steakPlate(), '#a0522d'];
  if (cat === 'porcoes') return [porcao(p), '#FF6B00'];
  if (cat === 'adicionais') return [adicional(p), '#FF6B00'];
  return [food(p.name, { layers: [L('circle', 18, [20, 30], ['#d9a441', '#c98a2b'])] }), '#FF6B00'];
}

function porcao(p) {
  const n = p.name.toLowerCase();
  const ouro = ['#e0a33a', '#d99a2b', '#c98a1f', '#eab55a'];
  if (n.includes('mini-maia')) return food(p.name, { layers: [L('oval', 18, [30, 42], ouro, [18, 24]), L('circle', 6, [8, 12], ['#fbe27a'])], garnish: 'lemon' });
  if (n.includes('pastel')) return food(p.name, { layers: [L('half', 15, [34, 46], ouro), L('leaf', 6, [6, 9], ['#4caf50'], [3, 5])] });
  if (n.includes('provolone')) return `<defs>${grad('gsl', '#2a2a2a')}</defs><path d="M 170 520 L 630 520 L 600 640 L 200 640 Z" fill="url(#gsl)"/><ellipse cx="400" cy="520" rx="230" ry="60" fill="#3a3a3a"/><ellipse cx="400" cy="512" rx="170" ry="42" fill="#f5c542"/><ellipse cx="380" cy="504" rx="90" ry="20" fill="#ffe27a" opacity=".8"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${300 + i * 50}" cy="${506 + (i % 2) * 14}" r="6" fill="#c8102e"/>`).join('')}${[0, 1, 2, 3].map((i) => `<ellipse cx="${330 + i * 45}" cy="${520 + (i % 2) * 10}" rx="9" ry="4" fill="#4caf50"/>`).join('')}`;
  if (n.includes('moela')) return food(p.name, { bowl: '#6b3a22', layers: [L('oval', 18, [28, 38], ['#6b3a1f', '#7d4724', '#5a2f18'], [18, 24]), L('ring', 8, [16, 24], ['#f3efe0'], [5, 7]), L('leaf', 12, [6, 9], ['#4caf50'], [3, 5])] });
  if (n.includes('caldo')) return food(p.name, { bowl: '#7a4a2a', layers: [L('circle', 1, [200, 200], ['#b8651e']), L('oval', 9, [34, 46], ['#8a4a22', '#6b3a1f'], [22, 30]), L('stick', 10, [26, 36], ['#f0d98a', '#e6c868'], [14, 18]), L('leaf', 10, [7, 10], ['#3f9d3f'], [3, 5])] });
  if (n.includes('fígado') || n.includes('figado')) return food(p.name, { bowl: '#2f2f2f', layers: [L('oval', 12, [30, 40], ['#5a2c1e', '#6a3524', '#4a2216'], [20, 26]), L('ring', 10, [18, 26], ['#e8c97a', '#f1dfae'], [5, 7]), L('leaf', 8, [6, 9], ['#4caf50'], [3, 5])] });
  if (n.includes('peixe')) return food(p.name, { layers: [L('stick', 14, [40, 56], ouro, [18, 24]), L('leaf', 8, [6, 9], ['#4caf50'], [3, 5])], garnish: 'lemon' });
  if (n.includes('frango')) return food(p.name, { layers: [L('oval', 12, [36, 48], ['#c47a2c', '#b86a20', '#d68c38'], [20, 28]), L('stick', 8, [20, 28], ['#f3ead0'], [8, 10]), L('leaf', 8, [6, 9], ['#4caf50'], [3, 5])] });
  if (n.includes('jil')) return food(p.name, { layers: [L('oval', 14, [30, 40], ['#6aa33a', '#5a9230', '#7bb446'], [14, 20]), L('ring', 10, [18, 26], ['#f3efe0', '#e8dcc0'], [5, 7])] });
  if (n.includes('almond') || n.includes('almônd')) return food(p.name, { layers: [L('circle', 10, [28, 36], ['#7a4a2a', '#6a3d20', '#8a5632']), L('stick', 12, [26, 38], ['#f2d77a', '#e6c458'], [12, 16]), L('stick', 6, [20, 28], ['#b5452a'], [6, 9])] });
  if (n.includes('calabresa')) return food(p.name, { layers: [L('slice', 14, [26, 34], ['#a63a22', '#b94526', '#8f3220']), L('ring', 12, [18, 26], ['#f6efd0', '#efe3b4'], [5, 7]), L('leaf', 6, [6, 9], ['#4caf50'], [3, 5])] });
  // boteco: mistura
  return food(p.name, { layers: [L('slice', 6, [24, 30], ['#a63a22']), L('oval', 6, [28, 36], ['#c47a2c'], [18, 24]), L('stick', 8, [26, 36], ['#f2d77a'], [12, 16]), L('circle', 6, [14, 18], ['#3f7a2a']), L('ring', 6, [16, 22], ['#f6efd0'], [5, 6])] });
}
function adicional(p) {
  const n = p.name.toLowerCase();
  if (n.includes('arroz')) return food(p.name, { bowl: '#e8e2d6', layers: [L('oval', 50, [10, 14], ['#fbfaf5', '#f2efe4', '#ffffff'], [5, 7]), L('leaf', 6, [6, 9], ['#4caf50'], [3, 5])] });
  if (n.includes('feij')) return food(p.name, { layers: [L('oval', 34, [11, 15], ['#8a5a32', '#7a4a28', '#9a6a3a'], [7, 10]), L('stick', 8, [14, 20], ['#c9a46a'], [6, 8]), L('circle', 8, [8, 11], ['#b94526']), L('leaf', 8, [6, 9], ['#4caf50'], [3, 5])] });
  if (n.includes('mandioca')) return food(p.name, { layers: [L('stick', 18, [38, 52], ['#f3da8a', '#efcf6e', '#e8c45a'], [20, 26])] });
  if (n.includes('banana')) return food(p.name, { layers: [L('slice', 20, [28, 36], ['#e8b030', '#dca226', '#f0c04a'])] });
  if (n.includes('ovo')) return `<ellipse cx="400" cy="560" rx="270" ry="90" fill="#e6e0d6"/><ellipse cx="400" cy="552" rx="230" ry="72" fill="#f4efe6"/><path d="M 260 540 C 250 470 330 440 400 450 C 480 440 560 470 540 540 C 530 590 470 610 400 606 C 330 610 270 590 260 540 Z" fill="#fff" stroke="#e6e0d6" stroke-width="3"/><circle cx="395" cy="530" r="54" fill="#f6b61a"/><circle cx="378" cy="512" r="16" fill="#ffd96b" opacity=".85"/>`;
  if (n.includes('vinagrete')) return food(p.name, { layers: [L('stick', 24, [10, 14], ['#d6382a', '#c4301f'], [10, 14]), L('stick', 14, [8, 12], ['#f3efe0'], [8, 10]), L('stick', 14, [8, 12], ['#3f9d3f'], [8, 10])] });
  if (n.includes('tomate')) return food(p.name, { layers: [L('slice', 9, [34, 44], ['#d6382a', '#c4301f']), L('ring', 10, [22, 30], ['#f6efd0', '#efe3b4'], [6, 8]), L('leaf', 6, [6, 9], ['#4caf50'], [3, 5])] });
  if (n.includes('copo')) return glass({ liquid: '#bfe3f2', ice: true, fill: 90, opacity: 0.3 });
  return food(p.name, { layers: [L('ring', 14, [22, 30], ['#e8c97a'], [6, 8]), L('circle', 10, [12, 16], ['#b94526', '#3f7a2a'])] });
}

// ─── execução ───────────────────────────────────────────────────────────────
(async () => {
  let feitas = 0, puladas = 0;
  for (const p of PRODUTOS) {
    if (IMAGENS[p.name]) { puladas++; continue; } // tem foto real
    const [inner, glow] = draw(p);
    const kind = ['porcoes', 'adicionais', 'pratos'].includes(p.cat) ? 'food' : 'item';
    const svg = wrap(inner, glow, kind);
    const file = path.join(OUT, `${slugify(p.name)}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(file);
    feitas++;
  }
  console.log(`🎨 ${feitas} ilustrações geradas em public/images (${puladas} produtos já têm foto real).`);
})().catch((e) => { console.error('❌', e); process.exit(1); });
