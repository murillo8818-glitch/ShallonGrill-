'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

function formatPrice(p) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  categoryId: '',
  featured: false,
  active: true,
};

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [prodsRes, catsRes] = await Promise.all([
        fetch('/api/products?all=1', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      setProducts(Array.isArray(prodsRes) ? prodsRes : []);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNewForm = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      imageUrl: product.imageUrl || '',
      categoryId: String(product.categoryId),
      featured: product.featured,
      active: product.active,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
    const method = editProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setShowForm(false);
      fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (product) => {
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...product, active: !product.active, categoryId: String(product.categoryId), price: String(product.price) }),
    });
    fetchData();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Remover "${product.name}"?`)) return;
    await fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory ? String(p.categoryId) === filterCategory : true;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Cabeçalho + botão adicionar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="font-heading" style={{ fontSize: '1.8rem', color: 'var(--color-primary)', letterSpacing: '2px' }}>
          🍖 Produtos
        </h2>
        <button id="add-product-btn" className="btn btn-primary" onClick={openNewForm}>
          + Adicionar Produto
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          id="product-search"
          type="text"
          className="form-input"
          placeholder="🔍 Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
        <select
          id="product-category-filter"
          className="form-input"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">Todas as Categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Tabela de Produtos */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1,2,3,4].map((i) => <div key={i} className="shimmer" style={{ height: '160px', borderRadius: '12px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state admin-card">
          <div className="empty-state-icon">🍽️</div>
          <p className="empty-state-text">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((product) => (
            <div
              key={product.id}
              className="admin-card"
              id={`admin-product-${product.id}`}
              style={{ opacity: product.active ? 1 : 0.5, display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {product.imageUrl ? (
                  <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="72px" />
                  </div>
                ) : (
                  <div style={{ width: '72px', height: '72px', background: 'var(--color-bg-base)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                    {product.category?.icon || '🍽️'}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="font-heading" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>{product.name}</span>
                    {product.featured && <span className="badge badge-orange" style={{ fontSize: '0.6rem' }}>⭐</span>}
                    {!product.active && <span className="badge badge-gray" style={{ fontSize: '0.6rem' }}>Inativo</span>}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '2px 0' }}>{product.category?.name}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary)' }}>{formatPrice(product.price)}</p>
                </div>
              </div>

              {product.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{product.description}</p>
              )}

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  id={`edit-product-${product.id}`}
                  className="btn btn-outline btn-sm"
                  onClick={() => openEditForm(product)}
                >
                  ✏️ Editar
                </button>
                <button
                  id={`toggle-product-${product.id}`}
                  className="btn btn-sm"
                  style={{ background: product.active ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: product.active ? 'var(--color-danger)' : 'var(--color-success)', border: '1px solid currentColor' }}
                  onClick={() => handleToggleActive(product)}
                >
                  {product.active ? '🚫 Desativar' : '✅ Ativar'}
                </button>
                <button
                  id={`delete-product-${product.id}`}
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(product)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulário */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()} id="product-form-modal">
            <div className="modal-header">
              <h2>{editProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              {formError && <div className="login-error" style={{ marginBottom: '12px' }}>⚠️ {formError}</div>}

              <div className="product-form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="pf-name">Nome do Produto *</label>
                  <input id="pf-name" name="name" className="form-input" placeholder="Ex: Espetinho de Picanha" value={form.name} onChange={handleFormChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pf-price">Preço (R$) *</label>
                  <input id="pf-price" name="price" type="number" step="0.01" min="0.01" className="form-input" placeholder="0,00" value={form.price} onChange={handleFormChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pf-category">Categoria *</label>
                  <select id="pf-category" name="categoryId" className="form-input" value={form.categoryId} onChange={handleFormChange} required>
                    <option value="">Selecione...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="pf-description">Descrição</label>
                  <textarea id="pf-description" name="description" className="form-input" placeholder="Descreva o produto..." value={form.description} onChange={handleFormChange} rows={2} style={{ resize: 'vertical' }} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="pf-image">URL da Imagem</label>
                  <input id="pf-image" name="imageUrl" className="form-input" placeholder="https://..." value={form.imageUrl} onChange={handleFormChange} />
                  {form.imageUrl && (
                    <div style={{ marginTop: '8px', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                      <Image src={form.imageUrl} alt="Preview" fill style={{ objectFit: 'cover' }} sizes="80px" onError={() => {}} />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input id="pf-featured" name="featured" type="checkbox" checked={form.featured} onChange={handleFormChange} style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.85rem' }}>⭐ Destaque</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input id="pf-active" name="active" type="checkbox" checked={form.active} onChange={handleFormChange} style={{ width: '16px', height: '16px', accentColor: 'var(--color-success)' }} />
                    <span style={{ fontSize: '0.85rem' }}>✅ Ativo</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" id="product-form-cancel" className="btn btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" id="product-form-submit" className="btn btn-primary" disabled={formLoading} style={{ flex: 2 }}>
                  {formLoading ? '⏳ Salvando...' : (editProduct ? '✅ Salvar Alterações' : '✅ Criar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
