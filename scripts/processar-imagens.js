// ============================================================================
//  scripts/processar-imagens.js — PROCESSA AS 51 FOTOS PARA FORMATO WEB (WEBP)
// ----------------------------------------------------------------------------
//  Gera versões de alta fidelidade em WebP dentro de public/images/produtos/.
//  Preserva 100% dos originais em "fotos - shallon - grill/".
//  Preserva proporção, nitidez e cores sem esticar nem cortar rótulos/pratos.
// ============================================================================
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const SRC_DIR = path.join(__dirname, '..', 'fotos - shallon - grill');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'produtos');

fs.mkdirSync(OUT_DIR, { recursive: true });

// Mapa dos 51 arquivos para nomes padronizados em webp
const MAPA_ARQUIVOS = {
  // 15 Porções
  '01-bolinho-arroz.png': 'bolinho-arroz-com-queijo.webp',
  '02-quibe-queijo.png': 'quibe-com-queijo.webp',
  '03-mini-maia-queijo.png': 'mini-maia-com-queijo.webp',
  '04-mini-pastel-misto.png': 'mini-pastel-misto.webp',
  '05-provolone-na-pedra.png': 'provolone-na-pedra.webp',
  '06-moela-casa.png': 'moela-da-casa.webp',
  '07-caldo-vaca-atolada.png': 'caldo-vaca-atolada.webp',
  '08-figado-galinha.png': 'figado-de-galinha.webp',
  '09-peixe-goujon.png': 'peixe-a-gourjon.webp',
  '10-bolinho-bacalhau.png': 'bolinho-de-bacalhau.webp',
  '11-frango-passarinho.png': 'frango-a-passarinho.webp',
  '12-jilo-cebola.png': 'jilo-com-cebola.webp',
  '13-almondega-bacon-mandioca.png': 'almondega-com-bacon-e-mandioca.webp',
  '14-calabresa-acebolada.png': 'calabresa-acebolada.webp',
  '15-porcao-botequeiro.png': 'porcao-do-botequeiro.webp',

  // Prato e Espeto
  '21-picanha-shalon-referencia.png': 'picanha-shalon.webp',
  '47-pao-alho-camarao.png': 'pao-de-alho-camarao.webp',

  // Cervejas 600ml
  '24-brahma-600ml.png': 'brahma-600ml.webp',
  '25-antarctica-600ml.png': 'antartica-600ml.webp',
  '26-original-600ml.png': 'original-600ml.webp',
  '31-amstel-600ml-opcao.png': 'amstel-600ml.webp',
  '32-kaiser-600ml.png': 'kaiser-600ml.webp',

  // Long Neck
  '28-stella-pure-gold-long-neck-330ml.png': 'stella-pure-gold-long-neck.webp',

  // Cervejas Lata
  '30-antarctica-original-lata-350ml.png': 'original-lata.webp',
  'extra-amstel-lata-350ml.png': 'amstel-lata.webp',
  'extra-antarctica-lata-350ml.png': 'antartica-azul-lata.webp',
  'extra-brahma-lata-350ml.png': 'brahma-lata.webp',
  'extra-kaiser-lata-350ml.png': 'kaiser-lata.webp',

  // Itens organizados (sem cadastro no catálogo ou referências)
  '16-tilapia-postas.png': 'tilapia-postas.webp',
  '17-tilapia-postas-com-acompanhamentos.png': 'tilapia-postas-com-acompanhamentos.webp',
  '18-figado-jilo.png': 'figado-com-jilo.webp',
  '19-panceta-torresmo.png': 'panceta-torresmo.webp',
  '20-tilapia-postas-800g-referencia.png': 'tilapia-postas-800g-referencia.webp',
  '22-bolinho-costela.png': 'bolinho-de-costela.webp',
  '23-jantinha-referencia.png': 'jantinha-referencia.webp',
  '27-spaten-600ml.png': 'spaten-600ml.webp',
  '29-stella-artois-long-neck-330ml.png': 'stella-artois-long-neck-330ml.webp',
  '33-corona-extra-long-neck-330ml.png': 'corona-extra-long-neck-330ml.webp',
  '34-copao-whisky-gelo-sabor-referencia.png': 'copao-whisky-gelo-sabor.webp',
  '35-copao-vodka-gelo-sabor-referencia.png': 'copao-vodka-gelo-sabor.webp',
  '36-aperol-spritz.png': 'aperol-spritz.webp',
  '37-campari.png': 'campari-garrafa.webp',
  '38-old-parr-12-anos.png': 'old-parr-12-anos.webp',
  '39-licor-43-original.png': 'licor-43-original.webp',
  '40-cachaca-51.png': 'cachaca-51.webp',
  '41-vodka-orloff.png': 'vodka-orloff.webp',
  '42-paratudo.png': 'paratudo.webp',
  '43-presidente.png': 'presidente.webp',
  '44-domus-opcao-para-dominus.png': 'domus-cachaca-gengibre.webp',
  '45-pinga-doses-referencia.png': 'pinga-doses.webp',
  '46-pao-alho.png': 'pao-de-alho-tabua.webp',
};

async function processar() {
  const arquivos = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.png')).sort();
  console.log(`📁 Processando ${arquivos.length} arquivos de "${SRC_DIR}"...`);

  let totalBytesOriginal = 0;
  let totalBytesWebp = 0;

  for (const arq of arquivos) {
    const nomeDestino = MAPA_ARQUIVOS[arq] || arq.replace(/\.png$/i, '.webp');
    const caminhoOrigem = path.join(SRC_DIR, arq);
    const caminhoDestino = path.join(OUT_DIR, nomeDestino);

    const statOrig = fs.statSync(caminhoOrigem);
    totalBytesOriginal += statOrig.size;

    // Redimensiona proporcionalmente mantendo 1:1 original (máx 800x800)
    // Converte para WebP de alta qualidade (q85)
    await sharp(caminhoOrigem)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(caminhoDestino);

    const statDest = fs.statSync(caminhoDestino);
    totalBytesWebp += statDest.size;

    console.log(`  ✓ ${arq} -> ${nomeDestino} (${Math.round(statOrig.size / 1024)}KB -> ${Math.round(statDest.size / 1024)}KB)`);
  }

  console.log('\n======================================================');
  console.log(`✅ ${arquivos.length} imagens processadas com sucesso!`);
  console.log(`📦 Tamanho original total: ${(totalBytesOriginal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`⚡ Tamanho otimizado WebP: ${(totalBytesWebp / 1024 / 1024).toFixed(1)} MB`);
  console.log(`📉 Redução de peso: ${((1 - totalBytesWebp / totalBytesOriginal) * 100).toFixed(1)}%`);
  console.log(`📂 Destino: ${OUT_DIR}`);
  console.log('======================================================\n');
}

processar().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
