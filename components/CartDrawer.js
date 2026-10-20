'use client';
import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export default function CartDrawer({ onCheckout }) {
  const { items, isOpen, setIsOpen, updateQty, removeItem, total, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setIsOpen(false)} />
      <aside className="drawer" id="cart-drawer">
        <div className="drawer-header">
          <h2>🛒 Carrinho</h2>
          <button
            id="cart-close-btn"
            className="drawer-close"
            onClick={() => setIsOpen(false)}
            aria-label="Fechar carrinho"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <p className="empty-state-text">Seu carrinho está vazio</p>
              <p style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--color-text-muted)' }}>
                Adicione itens do cardápio para começar
              </p>
            </div>
          ) : (
            items.map((item) => {
              const itemKey = item.cartKey || item.id;
              return (
                <div key={itemKey} className="cart-item">
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    {item.option && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '2px' }}>
                        Opção: {item.option}
                      </p>
                    )}
                    <p className="cart-item-price">{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  <div className="cart-qty-controls">
                    <button
                      id={`cart-minus-${itemKey}`}
                      className="qty-btn"
                      onClick={() => updateQty(itemKey, item.quantity - 1)}
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      id={`cart-plus-${itemKey}`}
                      className="qty-btn"
                      onClick={() => updateQty(itemKey, item.quantity + 1)}
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>

                  <button
                    id={`cart-remove-${itemKey}`}
                    onClick={() => removeItem(itemKey)}
                    style={{ color: 'var(--color-danger)', fontSize: '1.1rem', padding: '4px', marginLeft: '4px' }}
                    aria-label="Remover item"
                  >
                    🗑
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-total">
              <span style={{ color: 'var(--color-text-muted)' }}>Total ({count} {count === 1 ? 'item' : 'itens'})</span>
              <span className="cart-total-value">{formatPrice(total)}</span>
            </div>
            <button
              id="cart-checkout-btn"
              className="btn btn-primary btn-full btn-lg"
              onClick={onCheckout}
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
