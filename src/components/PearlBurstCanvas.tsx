import React, { useEffect, useRef } from 'react';

interface PearlBurstProps {
  triggerKey: number;
  count?: number;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  alpha: number;
  bounceCount: number;
}

export const PearlBurstCanvas: React.FC<PearlBurstProps> = ({
  triggerKey,
  count = 24,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!triggerKey || triggerKey <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Spawn pearls from lower center of screen
    const originX = width / 2;
    const originY = height * 0.65;

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 1.5) + (Math.random() - 0.5) * 1.4;
      const speed = 7 + Math.random() * 11;
      particles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 8 + Math.random() * 8, // 8px to 16px pearl radius
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        alpha: 1,
        bounceCount: 0,
      });
    }

    let animationFrameId: number;
    let startTime = performance.now();

    const drawPearl = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.alpha);

      // Pearl drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Pearl sphere gradient
      const grad = ctx.createRadialGradient(
        -p.radius * 0.3,
        -p.radius * 0.3,
        p.radius * 0.1,
        0,
        0,
        p.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#f2f4f8');
      grad.addColorStop(0.8, '#d4dbe8');
      grad.addColorStop(1, '#9ba8be');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Clear shadow for highlight
      ctx.shadowColor = 'transparent';

      // Pin-point glossy highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-p.radius * 0.35, -p.radius * 0.35, p.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      const gravity = 0.35;

      particles.forEach((p) => {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Fade after 1.2 seconds
        if (elapsed > 1.2) {
          p.alpha -= 0.04;
        }

        if (p.alpha > 0.01) {
          alive = true;
          drawPearl(p);
        }
      });

      if (alive && elapsed < 2.5) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [triggerKey, count, onComplete]);

  if (!triggerKey) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ touchAction: 'none' }}
    />
  );
};
