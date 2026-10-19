// lib/auth.js
import jwt from 'jsonwebtoken';

// Em produção o JWT_SECRET é OBRIGATÓRIO (o repositório é público, então
// qualquer chave padrão escrita aqui seria conhecida por todos).
// Lido sob demanda para não quebrar o "next build".
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET não definido. Configure nas variáveis de ambiente.');
  }
  return 'dev-only-secret-nao-use-em-producao';
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Also check cookies
  const cookie = request.cookies?.get?.('admin_token');
  if (cookie) return cookie.value;
  return null;
}

export function requireAuth(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
