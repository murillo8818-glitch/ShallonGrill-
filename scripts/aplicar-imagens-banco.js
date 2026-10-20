// ============================================================================
//  scripts/aplicar-imagens-banco.js — ATUALIZA AS IMAGENS NO BANCO NEON
// ----------------------------------------------------------------------------
//  Uso:
//    node scripts/aplicar-imagens-banco.js --simular  (só exibe o que fará)
//    node scripts/aplicar-imagens-banco.js            (aplica no banco de produção)
//
//  Preserva rigorosamente:
//    - IDs, nomes, preços (inclusive as correções), categorias
//    - Descrições existentes em todos os 86 produtos
//    - Status (ativo, inativo, destaque, deletado)
//    - Histórico de pedidos
// ============================================================================
const path = require('node:path');
const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* variaveis do sistema */ }

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaNeon(pool) });

const SIMULAR = process.argv.includes('--simular');

// Mapeamento confirmado: nome do produto -> caminho da imagem webp
const ATUALIZACOES = [
  // 15 Porções
  { nome: 'Bolinho de Arroz com Queijo',       img: '/images/produtos/bolinho-arroz-com-queijo.webp', idEsperado: 43 },
  { nome: 'Quibe com Queijo',                  img: '/images/produtos/quibe-com-queijo.webp', idEsperado: 44 },
  { nome: 'Mini-Maia com Queijo',              img: '/images/produtos/mini-maia-com-queijo.webp', idEsperado: 45 },
  { nome: 'Mini-Pastel Misto',                 img: '/images/produtos/mini-pastel-misto.webp', idEsperado: 46 },
  { nome: 'Provolone na Pedra',                img: '/images/produtos/provolone-na-pedra.webp', idEsperado: 47 },
  { nome: 'Moela da Casa',                     img: '/images/produtos/moela-da-casa.webp', idEsperado: 48 },
  { nome: 'Caldo - Vaca Atolada',              img: '/images/produtos/caldo-vaca-atolada.webp', idEsperado: 49 },
  { nome: 'Fígado de Galinha',                 img: '/images/produtos/figado-de-galinha.webp', idEsperado: 50 },
  { nome: 'Peixe à Gourjon',                   img: '/images/produtos/peixe-a-gourjon.webp', idEsperado: 51 },
  { nome: 'Bolinho de Bacalhau',               img: '/images/produtos/bolinho-de-bacalhau.webp', idEsperado: 52 },
  { nome: 'Frango à Passarinho',               img: '/images/produtos/frango-a-passarinho.webp', idEsperado: 53 },
  { nome: 'Jiló com Cebola',                   img: '/images/produtos/jilo-com-cebola.webp', idEsperado: 54 },
  { nome: 'Almôndega com Bacon e Mandioca',    img: '/images/produtos/almondega-com-bacon-e-mandioca.webp', idEsperado: 55 },
  { nome: 'Calabresa Acebolada',               img: '/images/produtos/calabresa-acebolada.webp', idEsperado: 56 },
  { nome: 'Porção do Botequeiro',              img: '/images/produtos/porcao-do-botequeiro.webp', idEsperado: 57 },

  // Prato e Espeto Especial
  { nome: 'Picanha Shalon',                    img: '/images/produtos/picanha-shalon.webp', idEsperado: 111 },
  { nome: 'Espeto de Pão de Alho de Camarão',  img: '/images/produtos/pao-de-alho-camarao.webp', idEsperado: 40 },

  // Cervejas 600ml
  { nome: 'Brahma 600ml',                      img: '/images/produtos/brahma-600ml.webp', idEsperado: 62 },
  { nome: 'Antártica 600ml',                   img: '/images/produtos/antartica-600ml.webp', idEsperado: 63 },
  { nome: 'Original 600ml',                    img: '/images/produtos/original-600ml.webp', idEsperado: 64 },
  { nome: 'Kaiser 600ml',                      img: '/images/produtos/kaiser-600ml.webp', idEsperado: 65 },
  { nome: 'Amstel 600ml',                      img: '/images/produtos/amstel-600ml.webp', idEsperado: 66 },

  // Long Neck
  { nome: 'Stella Pure Gold (Long Neck)',      img: '/images/produtos/stella-pure-gold-long-neck.webp', idEsperado: 70 },

  // Cervejas Lata
  { nome: 'Original Lata',                     img: '/images/produtos/original-lata.webp', idEsperado: 74 },
  { nome: 'Brahma Lata',                       img: '/images/produtos/brahma-lata.webp', idEsperado: 75 },
  { nome: 'Antártica Azul Lata',               img: '/images/produtos/antartica-azul-lata.webp', idEsperado: 76 },
  { nome: 'Amstel Lata',                       img: '/images/produtos/amstel-lata.webp', idEsperado: 77 },
  { nome: 'Kaiser Lata',                       img: '/images/produtos/kaiser-lata.webp', idEsperado: 78 },
];

async function main() {
  console.log(SIMULAR ? '🔎 MODO SIMULAÇÃO (nenhum dado será alterado)\n' : '🔄 Atualizando imagens no banco Neon...\n');

  // Verifica se todos os arquivos existem em public
  for (const item of ATUALIZACOES) {
    const caminhoFisico = path.join(__dirname, '..', 'public', item.img);
    if (!fs.existsSync(caminhoFisico)) {
      throw new Error(`Arquivo não encontrado em public: ${caminhoFisico}`);
    }
  }
  console.log(`✅ Todos os ${ATUALIZACOES.length} arquivos WebP existem fisicamente em public/images/produtos/\n`);

  let alterados = 0;
  for (const item of ATUALIZACOES) {
    const produto = await prisma.product.findFirst({
      where: { name: item.nome },
    });

    if (!produto) {
      console.warn(`⚠️ Produto não encontrado no banco: "${item.nome}"`);
      continue;
    }

    console.log(`Produto ID ${produto.id} [${produto.name}]:`);
    console.log(`   Foto antiga: ${produto.imageUrl}`);
    console.log(`   Foto nova:   ${item.img}`);

    if (!SIMULAR) {
      await prisma.product.update({
        where: { id: produto.id },
        data: { imageUrl: item.img },
      });
      alterados++;
    }
  }

  if (SIMULAR) {
    console.log(`\n🔎 Simulação finalizada: ${ATUALIZACOES.length} produtos seriam atualizados.`);
  } else {
    console.log(`\n🎉 Sucesso: ${alterados} produtos atualizados no banco Neon!`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
