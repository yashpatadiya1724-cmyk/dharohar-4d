"use client";

import React, { useEffect, useState } from "react";

export const ConfettiBurst: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      const colors = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];
      const newParticles = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 360,
        y: -(Math.random() * 280 + 80),
        r: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.15,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-out fade-out duration-1000"
          style={{
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`,
            transition: "all 1.8s cubic-bezier(0.25, 1, 0.5, 1)",
            transitionDelay: `${p.delay}s`,
            opacity: 1,
          }}
        />
      ))}
    </div>
  );
};
