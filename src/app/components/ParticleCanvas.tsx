import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  crimson: boolean;
}

export function ParticleCanvas({ count = 90, crimsonOnly = false }: { count?: number; crimsonOnly?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let pool: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = (randomLife = false): Particle => {
      const maxLife = 300 + Math.random() * 350;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.4 + 0.08),
        r: Math.random() * 1.4 + 0.3,
        life: randomLife ? Math.floor(Math.random() * maxLife) : 0,
        maxLife,
        crimson: crimsonOnly ? true : Math.random() < 0.35,
      };
    };

    resize();
    for (let i = 0; i < count; i++) pool.push(spawn(true));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      while (pool.length < count) pool.push(spawn());
      pool = pool.filter((p) => p.life < p.maxLife);

      for (const p of pool) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const t = p.life / p.maxLife;
        const alpha = Math.sin(t * Math.PI) * (p.crimson ? 0.5 : 0.25);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.crimson
          ? `rgba(196,18,48,${alpha})`
          : `rgba(210,210,218,${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, crimsonOnly]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
