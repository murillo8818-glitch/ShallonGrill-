'use client';
import { useEffect, useRef } from 'react';

export default function CategoryTabs({ categories, activeCategory, onSelect }) {
  const containerRef = useRef(null);

  // Mantém a aba ativa centralizada horizontalmente na barra ao rolar a página
  useEffect(() => {
    if (!containerRef.current) return;
    const activeTab = containerRef.current.querySelector('.cat-tab.active');
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategory]);

  const handleTabClick = (categoryId) => {
    onSelect(categoryId);

    if (categoryId === '') {
      const menuSec = document.getElementById('menu-section');
      if (menuSec) {
        menuSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const targetSec = document.getElementById(`cat-section-${categoryId}`);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="category-tabs" id="menu-section">
      <div className="category-tabs-inner" ref={containerRef}>
        <button
          id="cat-tab-all"
          className={`cat-tab ${activeCategory === '' ? 'active' : ''}`}
          onClick={() => handleTabClick('')}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            id={`cat-tab-${cat.slug}`}
            key={cat.id}
            className={`cat-tab ${activeCategory === String(cat.id) ? 'active' : ''}`}
            onClick={() => handleTabClick(String(cat.id))}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

