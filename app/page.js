 'use client';
import { useState, useEffect } from 'react';
import { CartProvider } from '@/contexts/CartContext';
import Hero from '@/components/Hero';
import CategoryTabs from '@/components/CategoryTabs';
import ProductCard from '@/components/ProductCard';
import Carousel from '@/components/Carousel';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import FloatingFABs from '@/components/FloatingFABs';

function MenuContent() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  // 1. CARREGAMENTO DOS DADOS (Mantido igualzinho o seu)
  useEffect(() => {
    async function load() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch('/api/categories').then((r) => r.json()),
          fetch('/api/products').then((r) => r.json()),
        ]);
        setCategories(
          Array.isArray(catsRes) ? catsRes.filter((c) => (c._count?.products ?? 1) > 0) : []
        );
        setProducts(Array.isArray(prodsRes) ? prodsRes : []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 2. O RADAR (Espião de Rolagem)
  useEffect(() => {
    // Se ainda estiver carregando, não liga o radar
    if (loading || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Quando a seção da categoria cruzar o centro da tela...
          if (entry.isIntersecting) {
            // Pega o ID (ex: "cat-section-2") e extrai apenas o "2"
            const categoryId = entry.target.id.replace('cat-section-', '');
            setActiveCategory(categoryId); // Muda o botão laranja automaticamente!
          }
        });
      },
      {
        // Define o gatilho bem no centro da tela
        rootMargin: '-30% 0px -50% 0px',
      }
    );

    // Manda o radar vigiar todas as seções de categorias
    const sections = document.querySelectorAll('[id^="cat-section-"]');
    sections.forEach((sec) => observer.observe(sec));

    // Desliga o radar ao sair da página
    return () => sections.forEach((sec) => observer.unobserve(sec));
  }, [loading, categories]); // O radar liga assim que os dados terminam de carregar

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-base)', minHeight: '100vh' }}>
      <Hero />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <main className="container" style={{ minHeight: '50vh', paddingTop: '20px' }}>
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="shimmer" style={{ height: '320px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          
          // 3. AS ÂNCORAS: Agora separamos por seções ao invés de usar o ".filter()"
          <div className="menu-sections-wrapper">
            {categories.map((cat) => {
              // Separa os produtos desta categoria específica
              const catProducts = products.filter((p) => String(p.categoryId) === String(cat.id));
              
              // Se a categoria não tiver lanches, ignora ela
              if (catProducts.length === 0) return null;

              return (
                <section 
                  key={cat.id} 
                  id={`cat-section-${cat.id}`} 
                  style={{ marginBottom: '60px', scrollMarginTop: '100px' }}
                >
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
                    {cat.name}
                  </h2>
                  <div className="product-grid">
                    {catProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <p className="empty-state-text">Nenhum produto cadastrado ainda.</p>
          </div>
        )}
      </main>

      <Carousel />
      <AboutSection />
      <Footer />

      <CartDrawer onCheckout={handleCheckout} />
      <FloatingFABs />

      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}
