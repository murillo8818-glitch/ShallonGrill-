'use client';
import { useEffect, useRef } from 'react';

const FLAME_COUNT = 30;

export default function FlameBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < FLAME_COUNT; i++) {
      const flame = document.createElement('div');
      flame.className = 'flame-particle';
      const left = Math.random() * 100;
      const duration = 2 + Math.random() * 4;
      const delay = Math.random() * 5;
      const height = 40 + Math.random() * 120;
      const drift = (Math.random() - 0.5) * 60;
      const width = 2 + Math.random() * 5;

      flame.style.cssText = `
        left: ${left}%;
        --duration: ${duration}s;
        --delay: ${delay}s;
        --height: ${height}px;
        --drift: ${drift}px;
        width: ${width}px;
      `;
      container.appendChild(flame);
    }
  }, []);

  return <div ref={containerRef} className="flames-container" aria-hidden="true" />;
}
