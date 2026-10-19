'use client';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const catIcon = product.category?.icon || '🍽️';

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  return (
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
  );
}
