// ============================================================================
//  config/site.js — 🎛️ PAINEL DE CONTROLE DO SITE (EDITE AQUI!)
// ----------------------------------------------------------------------------
//  Quase tudo que é "texto fixo" ou "imagem fixa" do site está neste arquivo.
//  Troque o valor, salve, e o site atualiza sozinho (com `npm run dev` rodando).
//
//  📸 COMO TROCAR UMA IMAGEM — 2 jeitos:
//    A) Imagem da internet: cole o link completo (https://...).
//       ⚠️ Se o site for diferente de unsplash.com / cloudinary.com, adicione o
//          domínio em `next.config.mjs` → images.remotePatterns.
//    B) Imagem sua (recomendado): coloque o arquivo em  public/images/
//       e use o caminho começando com barra:  '/images/minha-foto.jpg'
//
//  🍖 Fotos dos PRODUTOS não ficam aqui: elas são cadastradas no Painel do Dono
//     (/admin → Produtos → Editar → "Foto do produto").
// ============================================================================

// ─── DADOS DO RESTAURANTE ───────────────────────────────────────────────────
export const SITE = {
  nome: 'Shalon Grill',
  nomeTopo: 'SHALON',          // 1ª linha grande do título da página inicial
  nomeBaixo: 'GRILL',          // 2ª linha (laranja) do título
  slogan: 'O Espetinho que você nunca viu',
  cidade: 'Araguari - MG',
  endereco: 'R. Abadia dos Dourados, 472',
  bairro: 'Jóquei Clube',
  cep: '38444-290',
  // Link "Como chegar" (abre o Google Maps no endereço acima)
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('R. Abadia dos Dourados, 472 - Jóquei Clube, Araguari - MG, 38444-290'),

  horarioDias: 'Segunda a Sexta-feira',
  horarioHoras: 'Aberto a partir das 18:00',

  // WhatsApp só com números: 55 (Brasil) + DDD + número. Pode vir do .env.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '5534997284575',
  whatsappFormatado: '(34) 99728-4575', // como aparece escrito para o cliente
  whatsappMensagem: 'Olá, vim pelo cardápio digital!',

  instagram: 'shalongrill', // sem o @
};

// ─── IMAGENS FIXAS DO SITE ──────────────────────────────────────────────────
export const IMAGENS = {
  // Fundo da primeira tela (atrás do título "SHALON GRILL"). Fica bem escuro/transparente.
  heroFundo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=70',

  // Foto ao lado do endereço/horário (seção "Sobre")
  sobre: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',

  // Carrossel "📸 Conheça o Shalon Grill". Pode ter quantas quiser (mínimo 3).
  // `alt` = descrição da foto (acessibilidade e Google).
  carrossel: [
    { src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80', alt: 'Espetinho na Brasa' },
    { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', alt: 'Carne Grelhada' },
    { src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80', alt: 'Ambiente Shalon' },
    { src: 'https://images.unsplash.com/photo-1556656736-4c8d5dc7e8cb?w=600&q=80', alt: 'Churrasco Especial' },
    { src: 'https://images.unsplash.com/photo-1577785565578-1a9805d2c207?w=600&q=80', alt: 'Caipirinha' },
    { src: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80', alt: 'Churrasqueira' },
  ],
};

// ─── IMPRESSÃO DA NOTINHA (Painel do Dono) ──────────────────────────────────
export const IMPRESSORA = {
  // Largura do papel da sua impressora:
  //   '80mm' → impressora térmica padrão (Elgin i9, Epson TM-T20, Bematech MP-4200)
  //   '58mm' → impressora térmica pequena/portátil
  //   'A4'   → impressora comum de escritório
  larguraPapel: '80mm',

  // Texto no final da notinha
  mensagemRodape: 'Obrigado pela preferência! 🔥',

  // Linha opcional com CNPJ/telefone no topo da nota ('' = não mostra)
  linhaExtraCabecalho: 'WhatsApp (34) 99728-4575',
};

// ─── PAINEL DO DONO ─────────────────────────────────────────────────────────
export const PAINEL = {
  // De quantos em quantos segundos o painel busca pedidos novos
  atualizarACadaSegundos: 8,
};
