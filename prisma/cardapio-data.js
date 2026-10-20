// ============================================================================
//  prisma/cardapio-data.js — CARDÁPIO OFICIAL (categorias + produtos)
// ----------------------------------------------------------------------------
//  Fonte única do cardápio. É usado por:
//    • prisma/seed.js               (npm run db:seed)    → cria o que falta
//    • scripts/trocar-cardapio.js   (npm run db:cardapio) → SUBSTITUI o cardápio
//
//  Para mudar um preço/produto: edite aqui e rode `npm run db:cardapio`.
//  ⚠️ O nome de cada produto precisa ser ÚNICO (o seed compara pelo nome).
// ============================================================================

const CATEGORIAS = [
  { slug: 'jantinha',         name: 'Jantinha Shalon',        icon: '🍽️', order: 1 },
  { slug: 'espetos',          name: 'Espetos',                icon: '🔥', order: 2 },
  { slug: 'espetos-especiais',name: 'Espetos Especiais',      icon: '⭐', order: 3 },
  { slug: 'batata-frita',     name: 'Batata Frita',           icon: '🍟', order: 4 },
  { slug: 'porcoes',          name: 'Porções',                icon: '🍤', order: 5 },
  { slug: 'pratos',           name: 'Picanha e Chorizo',      icon: '🥩', order: 6 },
  { slug: 'cervejas-600',     name: 'Cervejas 600ml',         icon: '🍺', order: 7 },
  { slug: 'long-neck',        name: 'Shot Long Neck',         icon: '🍻', order: 8 },
  { slug: 'cervejas-lata',    name: 'Cervejas Lata',          icon: '🥫', order: 9 },
  { slug: 'refrigerantes',    name: 'Refrigerantes Lata',     icon: '🥤', order: 10 },
  { slug: 'refrigerantes-1l', name: 'Refrigerantes 1 Litro',  icon: '🧃', order: 11 },
  { slug: 'sucos',            name: 'Sucos e Águas',          icon: '🍹', order: 12 },
  { slug: 'doses',            name: 'Doses',                  icon: '🥃', order: 13 },
  { slug: 'adicionais',       name: 'Adicionais',             icon: '🧄', order: 14 },
];

// cat = slug da categoria acima | featured = selo "⭐ Destaque"
const PRODUTOS = [
  // ── JANTINHA ──────────────────────────────────────────────────────────────
  { cat: 'jantinha', name: 'Jantinha Shalon', price: 25, featured: true,
    description: '1 espeto à sua escolha + guarnições: arroz, feijão tropeiro, vinagrete, mandioca e banana frita.' },

  // ── ESPETOS ───────────────────────────────────────────────────────────────
  { cat: 'espetos', name: 'Espeto de Franbacon', price: 12 },
  { cat: 'espetos', name: 'Espeto de Cupim', price: 12 },
  { cat: 'espetos', name: 'Espeto de Capa de Filé', price: 12 },
  { cat: 'espetos', name: 'Espeto de Fraldinha', price: 12 },
  { cat: 'espetos', name: 'Espeto de Coração', price: 12 },
  { cat: 'espetos', name: 'Espeto de Kafta com Queijo', price: 12 },
  { cat: 'espetos', name: 'Espeto de Provolone', price: 12 },
  { cat: 'espetos', name: 'Espeto de Queijo Coalho', price: 12 },
  { cat: 'espetos', name: 'Espeto de Pão de Alho', price: 10 },

  // ── ESPETOS ESPECIAIS ─────────────────────────────────────────────────────
  { cat: 'espetos-especiais', name: 'Espeto de Picanha Grill', price: 35, featured: true },
  { cat: 'espetos-especiais', name: 'Espeto de Contra Filé Grill', price: 25 },
  { cat: 'espetos-especiais', name: 'Espeto de Camarão com Queijo', price: 25 },
  { cat: 'espetos-especiais', name: 'Espeto de Cupim Grill', price: 25 },
  { cat: 'espetos-especiais', name: 'Espeto de Pão de Alho de Camarão', price: 25 },

  // ── BATATA FRITA ──────────────────────────────────────────────────────────
  { cat: 'batata-frita', name: 'Batata Frita Simples', price: 30, description: '400g in natura.' },
  { cat: 'batata-frita', name: 'Batata Frita com Queijo e Bacon', price: 35, description: '400g in natura.' },

  // ── PORÇÕES ───────────────────────────────────────────────────────────────
  { cat: 'porcoes', name: 'Bolinho de Arroz com Queijo', price: 32 },
  { cat: 'porcoes', name: 'Quibe com Queijo', price: 32 },
  { cat: 'porcoes', name: 'Mini-Maia com Queijo', price: 38 },
  { cat: 'porcoes', name: 'Mini-Pastel Misto', price: 35 },
  { cat: 'porcoes', name: 'Provolone na Pedra', price: 35 },
  { cat: 'porcoes', name: 'Moela da Casa', price: 30 },
  { cat: 'porcoes', name: 'Caldo - Vaca Atolada', price: 16 },
  { cat: 'porcoes', name: 'Fígado de Galinha', price: 28 },
  { cat: 'porcoes', name: 'Peixe à Gourjon', price: 50 },
  { cat: 'porcoes', name: 'Bolinho de Bacalhau', price: 40 },
  { cat: 'porcoes', name: 'Frango à Passarinho', price: 30 },
  { cat: 'porcoes', name: 'Jiló com Cebola', price: 10 },
  { cat: 'porcoes', name: 'Almôndega com Bacon e Mandioca', price: 25 },
  { cat: 'porcoes', name: 'Calabresa Acebolada', price: 28 },
  { cat: 'porcoes', name: 'Porção do Botequeiro', price: 30,
    description: 'Salsicha, azeitona, queijo, tomate e cebola.' },

  // ── PICANHA / CHORIZO ─────────────────────────────────────────────────────
  { cat: 'pratos', name: 'Picanha Shalon', price: 119.9, featured: true,
    description: 'Serve 2 pessoas. 400g de picanha in natura. Guarnições: arroz, feijão tropeiro, vinagrete, mandioca, batata frita e banana frita.' },
  { cat: 'pratos', name: 'Chorizo', price: 109.9, featured: true,
    description: 'Serve 2 pessoas. 400g de contra filé in natura. Guarnições: arroz, feijão tropeiro, vinagrete, mandioca, batata frita e banana frita.' },

  // ── CERVEJAS 600ml ────────────────────────────────────────────────────────
  { cat: 'cervejas-600', name: 'Heineken 600ml', price: 14.5 },
  { cat: 'cervejas-600', name: 'Brahma 600ml', price: 9.5 },
  { cat: 'cervejas-600', name: 'Antártica 600ml', price: 8.5 },
  { cat: 'cervejas-600', name: 'Original 600ml', price: 11 },
  { cat: 'cervejas-600', name: 'Kaiser 600ml', price: 7.5 },
  { cat: 'cervejas-600', name: 'Amstel 600ml', price: 9.5 },

  // ── SHOT LONG NECK ────────────────────────────────────────────────────────
  { cat: 'long-neck', name: 'Heineken Shot (Long Neck)', price: 7.5 },
  { cat: 'long-neck', name: 'Stella Pure Gold (Long Neck)', price: 8.5 },
  { cat: 'long-neck', name: 'Ice Smirnoff', price: 12 },
  { cat: 'long-neck', name: 'Ice Brutal Fruit', price: 15 },
  { cat: 'long-neck', name: 'Império Ultra Long Neck', price: 7.5 },

  // ── CERVEJAS LATA ─────────────────────────────────────────────────────────
  { cat: 'cervejas-lata', name: 'Original Lata', price: 5 },
  { cat: 'cervejas-lata', name: 'Brahma Lata', price: 4.5 },
  { cat: 'cervejas-lata', name: 'Antártica Azul Lata', price: 4.5 },
  { cat: 'cervejas-lata', name: 'Amstel Lata', price: 4.5 },
  { cat: 'cervejas-lata', name: 'Kaiser Lata', price: 4 },
  { cat: 'cervejas-lata', name: 'Brahma Zero Lata', price: 5 },
  { cat: 'cervejas-lata', name: 'Heineken Zero Lata', price: 8 },

  // ── REFRIGERANTES LATA ────────────────────────────────────────────────────
  { cat: 'refrigerantes', name: 'Coca-Cola Lata', price: 6 },
  { cat: 'refrigerantes', name: 'Fanta Laranja Lata', price: 6 },
  { cat: 'refrigerantes', name: 'Guaraná Mineiro Zero Lata', price: 4.5 },
  { cat: 'refrigerantes', name: 'Limoneto Lata', price: 6 },
  { cat: 'refrigerantes', name: 'Suco Del Valle Lata', price: 6 },
  { cat: 'refrigerantes', name: 'Água Tônica Lata', price: 6 },
  { cat: 'refrigerantes', name: 'Red Bull (Comum ou Zero)', price: 15 },
  { cat: 'refrigerantes', name: 'Extra Power (Comum ou Zero)', price: 12 },

  // ── REFRIGERANTES 1 LITRO ─────────────────────────────────────────────────
  { cat: 'refrigerantes-1l', name: 'Coca-Cola 1 Litro', price: 10 },
  { cat: 'refrigerantes-1l', name: 'Fanta 1 Litro', price: 10 },

  // ── SUCOS E ÁGUAS ─────────────────────────────────────────────────────────
  { cat: 'sucos', name: 'Suco Natural de Laranja 500ml', price: 8 },
  { cat: 'sucos', name: 'Suco Kapo Del Valle', price: 3 },
  { cat: 'sucos', name: 'Suco Del Valle Uva', price: 5 },
  { cat: 'sucos', name: 'Água com Gás 500ml', price: 4.5 },
  { cat: 'sucos', name: 'Água sem Gás 500ml', price: 4 },

  // ── DOSES ─────────────────────────────────────────────────────────────────
  { cat: 'doses', name: 'Dose de Campari', price: 15 },
  { cat: 'doses', name: 'Dose de Vodka', price: 10 },
  { cat: 'doses', name: 'Dose de Whisky', price: 15 },
  { cat: 'doses', name: 'Dose de Gin', price: 10 },
  { cat: 'doses', name: 'Dose de Cachaça', price: 5 },
  { cat: 'doses', name: 'Caipirinha', price: 15 },
  { cat: 'doses', name: 'Caipivodka', price: 15 },

  // ── ADICIONAIS ────────────────────────────────────────────────────────────
  { cat: 'adicionais', name: 'Arroz', price: 6 },
  { cat: 'adicionais', name: 'Feijão Tropeiro', price: 10 },
  { cat: 'adicionais', name: 'Mandioca', price: 5 },
  { cat: 'adicionais', name: 'Banana Frita', price: 4 },
  { cat: 'adicionais', name: 'Ovo Frito', price: 4 },
  { cat: 'adicionais', name: 'Vinagrete', price: 6 },
  { cat: 'adicionais', name: 'CDB', price: 5 },
  { cat: 'adicionais', name: 'Copo Especial', price: 3 },
  { cat: 'adicionais', name: 'Tomate com Cebola', price: 12 },
];

// ─── FOTOS ──────────────────────────────────────────────────────────────────
//  nome do produto → nome do arquivo em public/images/ (SEM a extensão .jpg)
//  O script `npm run db:cardapio` só usa a foto se o arquivo EXISTIR na pasta.
//  Para adicionar uma foto: salve em public/images/<nome>.jpg, coloque a linha
//  abaixo (ou ajuste) e rode `npm run db:cardapio`.
const IMAGENS = {
  // Pratos e Jantinha
  'Jantinha Shalon': '/images/jantinha.jpg',
  'Picanha Shalon': '/images/produtos/picanha-shalon.webp',

  // Espetos
  'Espeto de Franbacon': 'espeto-franbacon',
  'Espeto de Cupim': 'espeto-cupim',
  'Espeto de Capa de Filé': 'espeto-carne',
  'Espeto de Fraldinha': 'espeto-carne',
  'Espeto de Coração': 'espeto-coracao',
  'Espeto de Kafta com Queijo': 'espeto-kafta',
  'Espeto de Provolone': 'espeto-queijo',
  'Espeto de Queijo Coalho': 'espeto-queijo',
  'Espeto de Pão de Alho': 'espeto-pao-alho',

  // Espetos Especiais
  'Espeto de Picanha Grill': 'espeto-picanha',
  'Espeto de Contra Filé Grill': 'espeto-carne',
  'Espeto de Camarão com Queijo': 'espeto-camarao',
  'Espeto de Cupim Grill': 'espeto-cupim',
  'Espeto de Pão de Alho de Camarão': '/images/produtos/pao-de-alho-camarao.webp',

  // Batatas
  'Batata Frita Simples': 'batata-simples',
  'Batata Frita com Queijo e Bacon': 'batata-queijo-bacon',

  // Porções (todas as 15 com fotos reais)
  'Bolinho de Arroz com Queijo': '/images/produtos/bolinho-arroz-com-queijo.webp',
  'Quibe com Queijo': '/images/produtos/quibe-com-queijo.webp',
  'Mini-Maia com Queijo': '/images/produtos/mini-maia-com-queijo.webp',
  'Mini-Pastel Misto': '/images/produtos/mini-pastel-misto.webp',
  'Provolone na Pedra': '/images/produtos/provolone-na-pedra.webp',
  'Moela da Casa': '/images/produtos/moela-da-casa.webp',
  'Caldo - Vaca Atolada': '/images/produtos/caldo-vaca-atolada.webp',
  'Fígado de Galinha': '/images/produtos/figado-de-galinha.webp',
  'Peixe à Gourjon': '/images/produtos/peixe-a-gourjon.webp',
  'Bolinho de Bacalhau': '/images/produtos/bolinho-de-bacalhau.webp',
  'Frango à Passarinho': '/images/produtos/frango-a-passarinho.webp',
  'Jiló com Cebola': '/images/produtos/jilo-com-cebola.webp',
  'Almôndega com Bacon e Mandioca': '/images/produtos/almondega-com-bacon-e-mandioca.webp',
  'Calabresa Acebolada': '/images/produtos/calabresa-acebolada.webp',
  'Porção do Botequeiro': '/images/produtos/porcao-do-botequeiro.webp',

  // Cervejas 600ml
  'Brahma 600ml': '/images/produtos/brahma-600ml.webp',
  'Antártica 600ml': '/images/produtos/antartica-600ml.webp',
  'Original 600ml': '/images/produtos/original-600ml.webp',
  'Kaiser 600ml': '/images/produtos/kaiser-600ml.webp',
  'Amstel 600ml': '/images/produtos/amstel-600ml.webp',

  // Long Neck
  'Stella Pure Gold (Long Neck)': '/images/produtos/stella-pure-gold-long-neck.webp',

  // Cervejas Lata
  'Original Lata': '/images/produtos/original-lata.webp',
  'Brahma Lata': '/images/produtos/brahma-lata.webp',
  'Antártica Azul Lata': '/images/produtos/antartica-azul-lata.webp',
  'Amstel Lata': '/images/produtos/amstel-lata.webp',
  'Kaiser Lata': '/images/produtos/kaiser-lata.webp',
};

// Nome do produto -> nome de arquivo seguro (ex.: "Heineken 600ml" -> "heineken-600ml")
function slugify(nome) {
  return nome
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Foto real (IMAGENS) tem prioridade. Sem ela, usa a ilustração <slug>.jpg
// (gerada por `npm run img:ilustracoes`). O script só usa se o arquivo existir.
for (const p of PRODUTOS) p.img = IMAGENS[p.name] || slugify(p.name);

module.exports = { CATEGORIAS, PRODUTOS, IMAGENS, slugify };
