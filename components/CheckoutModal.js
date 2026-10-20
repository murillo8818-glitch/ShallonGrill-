'use client';
import { useState, useEffect, useRef } from 'react';
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
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const nameInputRef = useRef(null);

  // Foco inicial, trava de rolagem no fundo e tecla Escape
  useEffect(() => {
    nameInputRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações rigorosas
    const nomeLimpo = form.customerName.trim();
    if (!nomeLimpo) {
      setError('Por favor, informe seu nome.');
      return;
    }

    const digitosTelefone = form.customerPhone.replace(/\D/g, '');
    if (digitosTelefone.length < 8) {
      setError('Por favor, informe um número de WhatsApp válido.');
      return;
    }

    const numMesa = parseInt(form.tableNumber, 10);
    if (!numMesa || numMesa <= 0) {
      setError('Por favor, informe um número de mesa válido (maior que 0).');
      return;
    }

    setLoading(true);

    const orderItems = items.map((i) => ({ productId: i.id, quantity: i.quantity }));

    // Registra opções escolhidas nas observações para a cozinha
    const itensComOpcao = items
      .filter((i) => i.option)
      .map((i) => `${i.quantity}x ${i.name} [Opção: ${i.option}]`)
      .join(', ');

    const observacoesFinais = [itensComOpcao, form.notes.trim()].filter(Boolean).join(' | ');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: nomeLimpo,
          customerPhone: form.customerPhone.trim(),
          type: 'mesa',
          tableNumber: String(numMesa),
          notes: observacoesFinais,
          items: orderItems,
        }),
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
              A cozinha já está preparando o seu pedido para a mesa!
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
              ref={nameInputRef}
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
              }}
              required
            />
          </div>

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
              <div key={item.cartKey || item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0' }}>
                <div>
                  <span>{item.quantity}x {item.name}</span>
                  {item.option && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                      • {item.option}
                    </span>
                  )}
                </div>
                <span style={{ color: 'var(--color-primary)' }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}

            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
              💳 Pagamento realizado diretamente na mesa (Cartão, Pix ou Dinheiro).
            </p>
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
