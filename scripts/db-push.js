// ============================================================================
//  scripts/db-push.js — CRIA AS TABELAS NO NEON PELA PORTA 443
// ----------------------------------------------------------------------------
//  Uso:
//    npm run db:push          → cria as tabelas (se ainda não existirem)
//    npm run db:reset         → APAGA TUDO e recria do zero (perde os dados!)
//
//  Por que não usar só "prisma db push"?
//  O comando oficial do Prisma conecta pela porta 5432, que está BLOQUEADA na
//  rede do restaurante (erro P1001). Este script faz o mesmo trabalho em 2 passos:
//    1) Pede ao Prisma o SQL das tabelas (isso funciona offline, sem conectar).
//    2) Envia esse SQL ao Neon pelo driver serverless (porta 443, sempre liberada).
//
//  Se um dia a porta 5432 estiver liberada (ex.: outra internet), também pode usar:
//    npm run db:push:prisma
// ============================================================================
const { execSync } = require('node:child_process');
const path = require('node:path');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws; // conexão via WebSocket (porta 443)

// Carrega as variáveis do arquivo .env (DATABASE_URL etc.) — recurso nativo do Node 20.12+
try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* sem .env: usa variáveis do sistema */ }

const TABELAS = ['OrderItem', 'Order', 'Product', 'Category', 'Admin']; // ordem segura para apagar
const RESET = process.argv.includes('--reset');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não encontrada. Crie o arquivo .env (veja .env.example).');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 0) Teste de conexão — se falhar aqui, o problema é URL/senha/projeto Neon
    console.log('🔌 Conectando ao Neon pela porta 443...');
    await pool.query('select 1');
    console.log('✅ Conectado!');

    // 1) --reset: apaga todas as tabelas (CUIDADO: perde pedidos e produtos)
    if (RESET) {
      console.log('🧨 --reset: apagando tabelas existentes...');
      for (const t of TABELAS) await pool.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
    }

    // 2) Verifica se as tabelas já existem
    const { rows } = await pool.query(
      `select table_name from information_schema.tables where table_schema = 'public'`
    );
    const existentes = rows.map((r) => r.table_name);
    const faltando = TABELAS.filter((t) => !existentes.includes(t));

    if (faltando.length === 0) {
      console.log('👍 Todas as tabelas já existem. Nada a fazer.');
      console.log('   (Mudou o schema.prisma? Rode "npm run db:reset" — apaga os dados!)');
      return;
    }
    if (faltando.length !== TABELAS.length) {
      throw new Error(
        `Banco parcialmente criado (faltam: ${faltando.join(', ')}). Rode "npm run db:reset".`
      );
    }

    // 3) Pede ao Prisma o SQL completo das tabelas, a partir do schema.prisma (offline)
    console.log('📐 Gerando SQL a partir de prisma/schema.prisma...');
    const sql = execSync(
      'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    );

    // 4) Executa o SQL no Neon
    console.log('🏗️  Criando tabelas...');
    await pool.query(sql);
    console.log(`🎉 Tabelas criadas: ${TABELAS.join(', ')}`);
    console.log('👉 Próximo passo: npm run db:seed');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
