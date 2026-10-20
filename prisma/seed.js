// ============================================================================
//  prisma/seed.js — DADOS INICIAIS DO BANCO ("semente")
// ----------------------------------------------------------------------------
//  Uso:  npm run db:seed
//  Cria: 1 login do Dono + as categorias e produtos de prisma/cardapio-data.js.
//  Pode rodar várias vezes: ele NÃO duplica (verifica antes de criar).
//
//  🍖 Quer mudar o cardápio inicial? Edite prisma/cardapio-data.js.
//     (Para SUBSTITUIR o cardápio de um banco que já está no ar: npm run db:cardapio)
//     (Depois que o site estiver no ar, use o Painel do Dono em /admin.)
// ============================================================================
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const bcrypt = require('bcryptjs');
const { CATEGORIAS, PRODUTOS } = require('./cardapio-data');

// Carrega o .env (DATABASE_URL, ADMIN_EMAIL...) — recurso nativo do Node 20.12+
try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* usa variáveis do sistema */ }

// Conexão pela porta 443 (mesma lógica de lib/prisma.js)
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaNeon(pool) });

// CATEGORIAS e PRODUTOS vêm de prisma/cardapio-data.js (importado no topo).

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1) LOGIN DO DONO — só cria se ainda não existir nenhum admin
  const email = process.env.ADMIN_EMAIL || 'admin@shalongrill.com';
  const senha = process.env.ADMIN_PASSWORD;
  if (!(await prisma.admin.findFirst())) {
    if (!senha) throw new Error('Defina ADMIN_PASSWORD no .env antes de rodar o seed.');
    await prisma.admin.create({
      data: {
        email,
        password: await bcrypt.hash(senha, 10), // salva só o hash, nunca a senha pura
        name: process.env.ADMIN_NAME || 'Dono do Shalon',
      },
    });
    console.log(`✅ Login do Dono criado: ${email} / ${senha}`);
  } else {
    console.log('ℹ️  Já existe um login de Dono — mantido.');
  }

  // 2) CATEGORIAS — upsert = "cria se não existe, senão deixa como está"
  const idPorSlug = {};
  for (const c of CATEGORIAS) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    idPorSlug[c.slug] = cat.id;
  }
  console.log(`✅ ${CATEGORIAS.length} categorias prontas`);

  // 3) PRODUTOS — cria novos e atualiza dados dos já existentes (preço, descrição, etc.)
  let criados = 0;
  let atualizados = 0;
  const nomesOficiais = new Set(PRODUTOS.map((p) => p.name));

  for (const { cat, img, ...p } of PRODUTOS) {
    const temFoto = img && require('node:fs').existsSync(path.join(__dirname, '..', 'public', 'images', `${img}.jpg`));
    const existente = await prisma.product.findFirst({ where: { name: p.name } });

    if (!existente) {
      await prisma.product.create({
        data: {
          ...p,
          categoryId: idPorSlug[cat],
          imageUrl: temFoto ? `/images/${img}.jpg` : null,
          active: true,
        },
      });
      criados++;
    } else {
      await prisma.product.update({
        where: { id: existente.id },
        data: {
          price: p.price,
          description: p.description ?? null,
          featured: !!p.featured,
          categoryId: idPorSlug[cat],
          active: true,
          ...(temFoto && !existente.imageUrl ? { imageUrl: `/images/${img}.jpg` } : {}),
        },
      });
      atualizados++;
    }
  }

  // Desativa produtos que não fazem parte do cardápio oficial
  const desativados = await prisma.product.updateMany({
    where: { name: { notIn: Array.from(nomesOficiais) }, active: true },
    data: { active: false },
  });

  console.log(`✅ ${criados} produtos criados, ${atualizados} atualizados, ${desativados.count} desativados`);
  console.log('🎉 Seed concluído com preços e dados atualizados!');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
