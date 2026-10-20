// ============================================================================
//  scripts/add-deleted-column.js — MIGRAÇÃO: coluna "deleted" em Product
// ----------------------------------------------------------------------------
//  Uso (uma vez só):  node scripts/add-deleted-column.js
//
//  Adiciona Product.deleted (padrão false) SEM apagar dados. Produtos que já
//  apareceram em pedidos não podem ser removidos do banco (o histórico aponta
//  para eles), então o botão 🗑️ marca deleted = true e eles somem de tudo.
//  Seguro rodar mais de uma vez (IF NOT EXISTS). Usa a porta 443 (Neon serverless).
// ============================================================================
const path = require('node:path');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* usa variáveis do sistema */ }

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não encontrada no .env');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(
      'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deleted" BOOLEAN NOT NULL DEFAULT false'
    );
    console.log('✅ Coluna Product.deleted pronta.');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
