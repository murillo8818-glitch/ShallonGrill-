// ============================================================================
//  scripts/backup-produtos.js — CÓPIA DE SEGURANÇA DOS PRODUTOS (SÓ LEITURA)
// ----------------------------------------------------------------------------
//  Uso:  node scripts/backup-produtos.js [rotulo]
//  Salva backups/produtos-<data>-<rotulo>.json com TODOS os produtos
//  (inclusive inativos e apagados) e categorias. Não altera nada no banco.
//  Para restaurar imagem/descrição: node scripts/restaurar-produtos.js <arquivo>
// ============================================================================
const path = require('node:path');
const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* variáveis do sistema */ }

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaNeon(pool) });

async function main() {
  const rotulo = (process.argv[2] || 'manual').replace(/[^a-z0-9-]/gi, '');
  const [categorias, produtos] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.product.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { orderItems: true } } },
    }),
  ]);
  const pasta = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(pasta, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const arquivo = path.join(pasta, `produtos-${stamp}-${rotulo}.json`);
  fs.writeFileSync(arquivo, JSON.stringify({ geradoEm: new Date().toISOString(), categorias, produtos }, null, 2));
  console.log(`✅ Backup salvo: ${arquivo}`);
  console.log(`   ${categorias.length} categorias, ${produtos.length} produtos`);
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
