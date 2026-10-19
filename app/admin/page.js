'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.replace('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      router.push('/admin/dashboard');
    } else {
      setError(result.error || 'Credenciais inválidas');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Glow decorativo */}
      <div className="login-bg-glow" style={{ top: '-100px', left: '-100px' }} />
      <div className="login-bg-glow" style={{ bottom: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)' }} />

      <div className="login-card">
        <div className="login-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>🔥</div>
          <h1>SHALON GRILL</h1>
          <p>Painel Administrativo</p>
        </div>

        <form id="admin-login-form" className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" id="login-error-msg">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="admin@shalongrill.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  fontSize: '1.1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                }}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Entrando...
              </>
            ) : (
              <>🔐 Entrar no Painel</>
            )}
          </button>
        </form>

        <Link href="/" className="login-back" id="login-back-link">
          ← Voltar para o Cardápio
        </Link>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
