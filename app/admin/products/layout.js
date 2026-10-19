'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

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

export default function ProductsLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-main">{children}</main>
    </div>
  );
}
