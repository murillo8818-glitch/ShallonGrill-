// ============================================================================
//  lib/prisma.js — CONEXÃO ÚNICA COM O BANCO DE DADOS
// ----------------------------------------------------------------------------
//  Todo arquivo que precisa ler/gravar no banco faz:
//      import { prisma } from '@/lib/prisma';
//
//  POR QUE O "ADAPTER NEON"?
//  O Postgres normalmente usa a porta 5432. Algumas redes (provedor de internet,
//  roteador, empresa) BLOQUEIAM essa porta — foi o erro P1001 que aconteceu.
//  O driver @neondatabase/serverless conecta pela porta 443 (a mesma do HTTPS),
//  que nunca é bloqueada. Funciona igual no seu PC e na Vercel.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// O driver do Neon fala com o banco via WebSocket. O pacote "ws" fornece isso no Node.
neonConfig.webSocketConstructor = ws;

function criarPrisma() {
  // Lê a URL do banco do arquivo .env (local) ou das variáveis da Vercel (produção)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Em desenvolvimento o Next.js recarrega os arquivos a cada alteração.
// Sem este truque, cada recarga abriria UMA NOVA conexão e o banco ficaria lotado.
// Guardamos a instância em `globalThis` (variável que sobrevive às recargas).
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? criarPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
