'use client';
import Image from 'next/image';

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="info-card fade-in">
            <h3>📍 Endereço</h3>
            <p>Rua Abadia dos Dourados, nº 472</p>
            <p style={{ marginTop: '4px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Uberlândia - MG</p>
          </div>

          <div className="info-card fade-in fade-in-delay-1">
            <h3>🕒 Horário de Funcionamento</h3>
            <p>Segunda a Sexta-feira</p>
            <p style={{ marginTop: '4px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Aberto a partir das 18:00</p>
          </div>

          <div className="info-card fade-in fade-in-delay-2">
            <h3>📱 Contato</h3>
            <p>
              <a href="https://wa.me/5534997284575" target="_blank" rel="noopener noreferrer"
                 style={{ color: 'var(--color-success)' }}>
                📲 WhatsApp: (34) 99728-4575
              </a>
            </p>
            <p style={{ marginTop: '4px' }}>
              <a href="https://instagram.com/shalongrill" target="_blank" rel="noopener noreferrer"
                 style={{ color: '#E1306C' }}>
                📸 @shalongrill
              </a>
            </p>
          </div>
        </div>

        <div className="fade-in fade-in-delay-3" style={{ position: 'relative', height: '320px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <Image
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
            alt="Interior do Shalon Grill"
            fill
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
