'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AdminHeader() {
  const { admin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin');
  };

  const navLinks = [
    { href: '/admin/dashboard', label: '📋 Pedidos' },
    { href: '/admin/products', label: '🍖 Produtos' },
  ];

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="admin-logo">
          SHALON GRILL
          <span>Painel do Dono · {admin?.name || 'Admin'}</span>
        </div>
        <button id="admin-logout-btn" className="btn btn-outline btn-sm" onClick={handleLogout}>
          Sair
        </button>
      </div>
      <nav className="admin-nav">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            id={`admin-nav-${link.href.split('/').pop()}`}
            className={`admin-nav-link ${pathname === link.href ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default function AdminProtectedLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔥</div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-main">{children}</main>
    </div>
  );
}
