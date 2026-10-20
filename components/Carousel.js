'use client';
import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

import { IMAGENS } from '@/config/site';

const IMAGES = IMAGENS.carrossel || [];

const SLIDES_VISIBLE = 3;

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const maxIndex = IMAGES.length - SLIDES_VISIBLE;

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(0, c - 1));
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => Math.min(maxIndex, c + 1));
  }, [maxIndex]);

  const slideWidth = 100 / SLIDES_VISIBLE;
  const offset = current * slideWidth;

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">📸 Conheça o Shalon Grill</h2>

      <div className="carousel-wrapper">
        <button
          id="carousel-btn-prev"
          className="carousel-btn carousel-btn-prev"
          onClick={prev}
          disabled={current === 0}
          aria-label="Imagem anterior"
          style={{ opacity: current === 0 ? 0.3 : 1 }}
        >
          ‹
        </button>

        <div className="carousel-track-container">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${offset}%)` }}
          >
            {IMAGES.map((img, i) => (
              <div
                key={i}
                className="carousel-slide"
                style={{ width: `calc(${slideWidth}% - 8px)` }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 80vw, 400px"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          id="carousel-btn-next"
          className="carousel-btn carousel-btn-next"
          onClick={next}
          disabled={current === maxIndex}
          aria-label="Próxima imagem"
          style={{ opacity: current === maxIndex ? 0.3 : 1 }}
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            id={`carousel-dot-${i}`}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              borderRadius: '9999px',
              background: i === current ? 'var(--color-primary)' : 'var(--color-border)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
