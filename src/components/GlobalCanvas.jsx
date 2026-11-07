import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Full-page canvas animation — rendered behind all content.
 * The nodes subtly react to mouse/scroll position.
 */
export default function GlobalCanvas() {
  const { accentHue, dark } = useTheme();
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });

  /* Track mouse globally */
  useEffect(() => {
    function onMove(e) { setMousePos({ x: e.clientX, y: e.clientY }); }
    function onScroll()  { /* trigger repaint on scroll */ setMousePos((p) => ({ ...p })); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll',   onScroll, true);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll',   onScroll, true);
    };
  }, []);

  /* Canvas animation */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const N = 55;
    const nodes = Array.from({ length: N }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r:  Math.random() * 2.2 + 0.8,
    }));

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      /* subtle grid */
      ctx.strokeStyle = dark
        ? 'rgba(200,168,0,.018)'
        : 'rgba(26,92,42,.025)';
      ctx.lineWidth = 1;
      const gs = 50;
      for (let x = 0; x < w; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      /* nodes */
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        /* mouse attraction */
        const mx = mousePos.x, my = mousePos.y;
        const dx = mx - n.x, dy = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          n.x += dx * 0.008;
          n.y += dy * 0.008;
        }

        /* draw node dot */
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${accentHue},75%,${dark ? '60%' : '40%'})`;
        ctx.fill();

        /* draw edges */
        for (let j = i + 1; j < nodes.length; j++) {
          const o   = nodes[j];
          const dd  = Math.hypot(o.x - n.x, o.y - n.y);
          const MAX = 130;
          if (dd < MAX) {
            const alpha = (1 - dd / MAX) * (dark ? 0.55 : 0.35);
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `hsla(${accentHue},65%,55%,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [accentHue, dark, mousePos]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: dark ? 1 : 0.6,
      }}
    />
  );
}
