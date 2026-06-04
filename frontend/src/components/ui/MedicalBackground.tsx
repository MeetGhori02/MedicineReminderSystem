import { useEffect, useRef } from 'react';

// Animated background: floating molecules and orbiting particles
export const MedicalBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // Particles
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? 'var(--teal)' : 'var(--emerald)',
    }));

    // Molecule nodes
    const molecules = Array.from({ length: 5 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      baseX: 0, baseY: 0,
      r: Math.random() * 14 + 6,
      orbitR: Math.random() * 40 + 20,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.006,
      color: 'var(--teal)',
    })).map(m => ({ ...m, baseX: m.x, baseY: m.y }));

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Connect nearby particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16,185,129,${0.12 * (1 - dist/120)})`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw orbiting molecules
      molecules.forEach(m => {
        m.angle += m.speed;
        // Slow drift
        m.baseX += Math.sin(m.angle * 0.3) * 0.15;
        m.baseY += Math.cos(m.angle * 0.2) * 0.1;
        if (m.baseX < 0 || m.baseX > W) m.baseX = Math.random() * W;
        if (m.baseY < 0 || m.baseY > H) m.baseY = Math.random() * H;

        const cx = m.baseX;
        const cy = m.baseY;

        // Orbit electron
        const ex = cx + Math.cos(m.angle) * m.orbitR;
        const ey = cy + Math.sin(m.angle) * m.orbitR;

        // Nucleus
        ctx.beginPath();
        ctx.arc(cx, cy, m.r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, m.r);
        grad.addColorStop(0, 'rgba(16,185,129,0.25)');
        grad.addColorStop(1, 'rgba(16,185,129,0.03)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(16,185,129,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Orbit ring
        ctx.beginPath();
        ctx.arc(cx, cy, m.orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(52,211,153,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Electron
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'var(--emerald)';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
};
