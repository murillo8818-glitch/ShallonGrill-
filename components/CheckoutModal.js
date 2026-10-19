'use client';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export default function CheckoutModal({ onClose }) {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    type: 'mesa',
    tableNumber: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const orderItems = items.map((i) => ({ productId: i.id, quantity: i.quantity }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: orderItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar pedido');

      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} id="checkout-success-modal">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
            <h2 className="font-heading" style={{ color: 'var(--color-success)', fontSize: '2rem', letterSpacing: '2px' }}>
              Pedido Enviado!
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '12px 0 24px' }}>
              A cozinha ja esta preparando o seu pedido!
            </p>
            <button id="checkout-close-btn" className="btn btn-primary btn-full" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} id="checkout-modal">
        <div className="modal-header">
          <h2>Finalizar Pedido</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Total: <strong style={{ color: 'var(--color-primary)' }}>{formatPrice(total)}</strong>
          </p>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" style={{ marginBottom: '12px' }}>⚠️ {error}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="checkout-name">Seu Nome</label>
            <input
              id="checkout-name"
              name="customerName"
              className="form-input"
              placeholder="Ex: João Silva"
              value={form.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="checkout-phone">WhatsApp</label>
            <input
              id="checkout-phone"
              name="customerPhone"
              className="form-input"
              placeholder="(34) 9 9999-9999"
              value={form.customerPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Pedido</label>
            <div className="radio-group">
              <button
                type="button"
                id="checkout-type-mesa"
                className={`radio-option ${form.type === 'mesa' ? 'active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, type: 'mesa' }))}
              >
                🪑 Mesa
              </button>
              <button
                type="button"
                id="checkout-type-entrega"
                className={`radio-option ${form.type === 'entrega' ? 'active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, type: 'entrega' }))}
              >
                🛵 Entrega
              </button>
            </div>
          </div>

          {form.type === 'mesa' && (
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-table">Número da Mesa</label>
              <input
                id="checkout-table"
                name="tableNumber"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="form-input"
                placeholder="Ex: 5"
                value={form.tableNumber}
                onChange={(e) => {
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  setForm((f) => ({ ...f, tableNumber: apenasNumeros }));
                }}required
              />
            </div>
          )}

          {form.type === 'entrega' && (
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-address">Endereço de Entrega</label>
              <input
                id="checkout-address"
                name="address"
                className="form-input"
                placeholder="Rua, número, bairro"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="checkout-notes">Observações (opcional)</label>
            <textarea
              id="checkout-notes"
              name="notes"
              className="form-input"
              placeholder="Ex: sem cebola, ponto da carne..."
              value={form.notes}
              onChange={handleChange}
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Resumo do pedido */}
          <div style={{ background: 'var(--color-bg-base)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Resumo
            </p>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
                <span>{item.quantity}x {item.name}</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="modal-footer" style={{ padding: '0', display: 'flex', gap: '10px' }}>
            <button
              type="button"
              id="checkout-cancel-btn"
              className="btn btn-outline"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="checkout-submit-btn"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? '⏳ Enviando...' : '✅ Confirmar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
