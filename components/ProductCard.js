'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

function getProductOptionsConfig(product) {
  const nameLower = (product.name || '').toLowerCase();
  if (nameLower.includes('jantinha')) {
    return {
      title: 'Escolha o espeto da sua Jantinha',
      subtitle: 'Obrigatório selecionar 1 espeto:',
      options: [
        'Espeto de Franbacon',
        'Espeto de Cupim',
        'Espeto de Capa de Filé',
        'Espeto de Fraldinha',
        'Espeto de Coração',
        'Espeto de Kafta com Queijo',
        'Espeto de Provolone',
        'Espeto de Queijo Coalho',
        'Espeto de Pão de Alho',
      ],
    };
  }
  if (nameLower.includes('red bull') || nameLower.includes('extra power') || nameLower.includes('comum ou zero')) {
    return {
      title: `Escolha a versão`,
      subtitle: 'Selecione uma opção:',
      options: ['Comum', 'Zero'],
    };
  }
  return null;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const catIcon = product.category?.icon || '🍽️';
  const optionsConfig = getProductOptionsConfig(product);

  useEffect(() => {
    if (!showOptionsModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowOptionsModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOptionsModal]);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (optionsConfig) {
      setSelectedOption('');
      setShowOptionsModal(true);
      return;
    }
    addItem(product);
  };

  const handleConfirmOption = () => {
    if (!selectedOption) return;
    addItem({
      ...product,
      cartKey: `${product.id}-${selectedOption}`,
      option: selectedOption,
    });
    setShowOptionsModal(false);
  };

  return (
    <>
      <div className="product-card" id={`product-card-${product.id}`}>
        <div className="product-card-image-wrapper">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 45vw, 280px"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <div className="product-card-no-image">{catIcon}</div>
          )}
          {product.featured && (
            <span className="product-badge">⭐ Destaque</span>
          )}
        </div>

        <div className="product-card-body">
          <p className="product-card-name">{product.name}</p>
          {product.description && (
            <p className="product-card-desc">{product.description}</p>
          )}

          <div className="product-card-footer">
            <span className="product-card-price">{formatPrice(product.price)}</span>
            <button
              id={`add-to-cart-${product.id}`}
              className="add-to-cart-btn"
              onClick={handleAdd}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {showOptionsModal && optionsConfig && (
        <div className="modal-overlay" onClick={() => setShowOptionsModal(false)} style={{ zIndex: 400 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{optionsConfig.title}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{optionsConfig.subtitle}</p>
              </div>
              <button
                className="drawer-close"
                onClick={() => setShowOptionsModal(false)}
                style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflowY: 'auto' }}>
              {optionsConfig.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className={`radio-option ${selectedOption === opt ? 'active' : ''}`}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{opt}</span>
                  <span style={{ fontSize: '0.9rem' }}>{selectedOption === opt ? '🔘' : '⚪'}</span>
                </button>
              ))}
            </div>

            <div className="modal-footer" style={{ gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowOptionsModal(false)}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!selectedOption}
                onClick={handleConfirmOption}
                style={{ flex: 2, opacity: selectedOption ? 1 : 0.6 }}
              >
                Adicionar {formatPrice(product.price)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
