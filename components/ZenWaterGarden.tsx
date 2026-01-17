
import React, { useEffect, useState, useCallback } from 'react';

interface Ripple {
  id: string;
  x: number;
  y: number;
}

interface Petal {
  id: string;
  left: number;
  top: number;
  scale: number;
  duration: number;
  delay: number;
  rotate: number;
}

const ZenWaterGarden: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: `petal-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      scale: 0.5 + Math.random() * 0.8,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * -20,
      rotate: Math.random() * 360,
    }));
    setPetals(newPetals);
  }, []);

  const spawnRipple = useCallback((x: number, y: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea, a')) return;
      const x = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const y = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      spawnRipple(x, y);
    };
    window.addEventListener('mousedown', handleGlobalClick);
    window.addEventListener('touchstart', handleGlobalClick);
    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
      window.removeEventListener('touchstart', handleGlobalClick);
    };
  }, [spawnRipple]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <style>{`
        @keyframes ripple-out {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
        }
        @keyframes drift {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(150px, 150px) rotate(360deg); }
        }
        .water-ripple {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 1px solid rgba(184, 134, 11, 0.3);
          border-radius: 50%;
          animation: ripple-out 2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
        .petal {
          position: absolute;
          animation: drift linear infinite;
          opacity: 0.15;
          filter: blur(1px);
        }
      `}</style>

      {petals.map(p => (
        <div key={p.id} className="petal" style={{
          left: `${p.left}%`,
          top: `${p.top}%`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: `scale(${p.scale}) rotate(${p.rotate}deg)` }}>
            <path d="M10 0 C15 5 20 10 10 20 C0 10 5 5 10 0" fill="#B8860B" />
          </svg>
        </div>
      ))}

      {ripples.map((r) => (
        <div key={r.id} className="water-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </div>
  );
};

export default ZenWaterGarden;
