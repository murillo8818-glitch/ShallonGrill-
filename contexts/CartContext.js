'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restaura carrinho do localStorage ao iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shalon_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (e) {
      console.error('Erro ao ler carrinho do localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salva no localStorage sempre que houver alteração
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('shalon_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Erro ao salvar carrinho no localStorage:', e);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const key = product.cartKey || product.id;
      const existing = prev.find((i) => (i.cartKey || i.id) === key);
      if (existing) {
        return prev.map((i) => (i.cartKey || i.id) === key ? { ...i, quantity: i.quantity + (product.quantity || 1) } : i);
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => (i.cartKey || i.id) !== key));
  }, []);

  const updateQty = useCallback((key, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => (i.cartKey || i.id) !== key));
    } else {
      setItems((prev) => prev.map((i) => (i.cartKey || i.id) === key ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem('shalon_cart');
    } catch (e) {}
  }, []);

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
