// ============================================================================
//  scripts/trocar-cardapio.js — SUBSTITUI O CARDÁPIO DO BANCO PELO NOVO
// ----------------------------------------------------------------------------
//  Uso:
//    npm run db:cardapio              → aplica a troca
//    npm run db:cardapio -- --simular → só MOSTRA o que faria (não altera nada)
//
//  O que faz (dados em prisma/cardapio-data.js):
//    1) Cria/atualiza as categorias novas (por slug).
//    2) Produtos ANTIGOS que não estão no cardápio novo:
//         • sem pedidos no histórico → são APAGADOS
//         • com pedidos no histórico → ficam INATIVOS (preserva o histórico)
//    3) Categorias antigas que ficaram vazias são apagadas.
//    4) Cria/atualiza os produtos novos (preço, descrição, categoria, ativo).
//  Os PEDIDOS já feitos nunca são apagados.
// ============================================================================
const path = require('node:path');
const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const { CATEGORIAS, PRODUTOS } = require('../prisma/cardapio-data');

try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* usa variáveis do sistema */ }

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaNeon(pool) });

const SIMULAR = process.argv.includes('--simular');

async function main() {
  console.log(SIMULAR ? '🔎 MODO SIMULAÇÃO (nada será alterado)\n' : '🔄 Trocando o cardápio...\n');

  const nomesNovos = new Set(PRODUTOS.map((p) => p.name));
  const slugsNovos = new Set(CATEGORIAS.map((c) => c.slug));

  // Antes
  const antigos = await prisma.product.findMany({
    include: { _count: { select: { orderItems: true } } },
  });
  const sobrando = antigos.filter((p) => !nomesNovos.has(p.name));
  const apagar = sobrando.filter((p) => p._count.orderItems === 0);
  const desativar = sobrando.filter((p) => p._count.orderItems > 0 && p.active);

  console.log(`📦 Produtos hoje no banco: ${antigos.length}`);
  console.log(`   🗑️  a apagar (sem pedidos): ${apagar.length}`);
  console.log(`   🚫 a desativar (têm pedidos): ${desativar.length}`);
  console.log(`   ✨ no cardápio novo: ${PRODUTOS.length} produtos em ${CATEGORIAS.length} categorias\n`);

  if (SIMULAR) return;

  // 1) Categorias novas
  const idPorSlug = {};
  for (const c of CATEGORIAS) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, order: c.order },
      create: c,
    });
    idPorSlug[c.slug] = cat.id;
  }
  console.log(`✅ ${CATEGORIAS.length} categorias prontas`);

  // 2) Produtos antigos
  if (apagar.length) {
    await prisma.product.deleteMany({ where: { id: { in: apagar.map((p) => p.id) } } });
  }
  if (desativar.length) {
    await prisma.product.updateMany({ where: { id: { in: desativar.map((p) => p.id) } }, data: { active: false } });
  }
  console.log(`✅ ${apagar.length} produtos antigos apagados, ${desativar.length} desativados`);

  // 3) Categorias antigas vazias
  const catsAntigas = await prisma.category.findMany({
    where: { slug: { notIn: [...slugsNovos] } },
    include: { _count: { select: { products: true } } },
  });
  const vazias = catsAntigas.filter((c) => c._count.products === 0);
  if (vazias.length) {
    await prisma.category.deleteMany({ where: { id: { in: vazias.map((c) => c.id) } } });
  }
  console.log(`✅ ${vazias.length} categorias antigas vazias apagadas` +
    (catsAntigas.length - vazias.length ? ` (${catsAntigas.length - vazias.length} mantidas por terem histórico)` : ''));

  // 4) Produtos novos (cria ou atualiza pelo nome)
  //    Foto: usa /images/<img>.jpg SE o arquivo existir em public/images
  //    (se não existir, mantém a foto que já estiver cadastrada, ou fica sem foto).
  const pastaImagens = path.join(__dirname, '..', 'public', 'images');
  let criados = 0, atualizados = 0, comFoto = 0;
  for (const { cat, img, ...p } of PRODUTOS) {
    const temArquivo = img && fs.existsSync(path.join(pastaImagens, `${img}.jpg`));
    const imageUrl = temArquivo ? `/images/${img}.jpg` : undefined;
    if (imageUrl) comFoto++;
    const data = {
      name: p.name,
      price: p.price,
      description: p.description ?? null,
      featured: !!p.featured,
      active: true,
      categoryId: idPorSlug[cat],
      ...(imageUrl ? { imageUrl } : {}),
    };
    const existente = await prisma.product.findFirst({ where: { name: p.name } });
    if (existente) {
      await prisma.product.update({ where: { id: existente.id }, data });
      atualizados++;
    } else {
      await prisma.product.create({ data: { ...data, imageUrl: imageUrl ?? null } });
      criados++;
    }
  }
  console.log(`✅ Produtos novos: ${criados} criados, ${atualizados} atualizados`);
  console.log(`📸 ${comFoto} produtos com foto, ${PRODUTOS.length - comFoto} sem foto (mostram o emoji da categoria)`);
  console.log('🎉 Cardápio trocado com sucesso!');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
