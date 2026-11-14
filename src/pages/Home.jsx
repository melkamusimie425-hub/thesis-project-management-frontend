import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import PublicNav from '../components/PublicNav';
import {
  Shield, ArrowRight, Sparkles, Lock, Globe,
} from 'lucide-react';

const STATS = [
  { value: '6+',   label: 'User Roles' },
  { value: '100%', label: 'Digital Workflow' },
  { value: '24/7', label: 'Access' },
  { value: 'WSU',  label: 'School of Informatics' },
];

/* Animated canvas background */
function HeroCanvas({ accentHue, dark }) {
  const canvasRef = useRef(null);
  const mouse     = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener('mousemove', onMove);

    /* floating orbs */
    const ORBS = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      r: 80 + Math.random() * 160,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      hue: accentHue + i * 28,
      alpha: .06 + Math.random() * .08,
    }));

    /* network nodes */
    const NODES = Array.from({ length: 60 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.8 + .6,
    }));

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* orbs */
      ORBS.forEach((o) => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        else if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        else if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},80%,${dark?'55%':'45%'},${o.alpha})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* nodes + lines */
      NODES.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        /* mouse attraction */
        const dx = mouse.current.x - n.x, dy = mouse.current.y - n.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 160) { n.x += dx * .006; n.y += dy * .006; }

        /* tiny dot */
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${accentHue},75%,${dark?'70%':'45%'},.55)`;
        ctx.fill();

        /* connecting lines */
        for (let j = i + 1; j < NODES.length; j++) {
          const o  = NODES[j];
          const dd = Math.hypot(o.x - n.x, o.y - n.y);
          if (dd < 110) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `hsla(${accentHue},65%,${dark?'65%':'40%'},${(1 - dd / 110) * .28})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
    };
  }, [accentHue, dark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
    />
  );
}

export default function Home() {
  const navigate            = useNavigate();
  const { accentHue, dark } = useTheme();
  const bg    = dark
    ? 'linear-gradient(135deg,#010a04 0%,#021208 40%,#030e06 100%)'
    : 'linear-gradient(135deg,#e4f5eb 0%,#f2fbf5 50%,#e8f7ee 100%)';
  const text  = dark ? '#e2f0e8' : '#0d2e15';
  const muted = dark ? 'rgba(226,240,232,.48)' : 'rgba(13,46,21,.52)';
  const card  = dark ? 'rgba(4,16,8,.7)'  : 'rgba(255,255,255,.8)';
  const bdr   = dark ? 'rgba(255,255,255,.07)' : 'rgba(26,92,42,.1)';
  const acc   = `hsl(${accentHue},72%,${dark?'54%':'42%'})`;
  const accLt = `hsl(${accentHue},80%,${dark?'68%':'50%'})`;

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',system-ui,sans-serif", overflowX: 'hidden', transition: 'background .4s,color .4s' }}>
      <PublicNav />

      {/* ══════════════════════════════════════
          HERO — full viewport height
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 62px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Animated canvas */}
        <HeroCanvas accentHue={accentHue} dark={dark} />

        {/* Extra static glow behind content */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: '45vw', height: '45vw', borderRadius: '50%', filter: 'blur(110px)', opacity: dark?.15:.08, background: `hsl(${accentHue},80%,55%)` }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '35vw', height: '35vw', borderRadius: '50%', filter: 'blur(130px)', opacity: dark?.1:.06, background: `hsl(${accentHue + 60},70%,50%)` }} />
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '60px 24px', maxWidth: 820, width: '100%' }}>

          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 20px', borderRadius: 999, marginBottom: 28,
            fontSize: 12.5, fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase',
            background: dark ? 'rgba(255,255,255,.07)' : 'rgba(26,92,42,.08)',
            border: `1px solid hsla(${accentHue},65%,52%,.4)`,
            color: accLt,
            animation: 'heroFadeUp .9s ease both',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accLt, display: 'inline-block', animation: 'heroPing 1.6s infinite', flexShrink: 0 }} />
            Wolaita Sodo University · School of Informatics
          </div>

          {/* WSU Logo */}
          <div style={{
            width: 110, height: 110, borderRadius: '50%', overflow: 'hidden',
            margin: '0 auto 28px',
            border: `4px solid ${acc}`,
            boxShadow: `0 0 0 10px hsla(${accentHue},65%,50%,.1), 0 20px 60px rgba(0,0,0,.3), 0 0 80px hsla(${accentHue},70%,50%,.2)`,
            background: '#fff',
            animation: 'logoSpin 1.2s cubic-bezier(.22,1,.36,1) both',
            animationDelay: '.15s',
          }}>
            <img src="/wsu-logo.png" alt="WSU" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.parentElement.innerHTML = '<span style="font-weight:900;font-size:20px;color:#1a5c2a;display:flex;align-items:center;justify-content:center;height:100%">WSU</span>'; }} />
          </div>

          {/* Main heading — zoom forward */}
          <h1 style={{
            fontSize: 'clamp(26px,5.5vw,62px)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: -2, margin: '0 0 20px',
            animation: 'titleZoomIn 1.4s cubic-bezier(.22,1,.36,1) both',
            animationDelay: '.2s',
          }}>
            Online Thesis &amp; Project<br />
            <span style={{
              background: `linear-gradient(135deg, ${accLt} 0%, hsl(${accentHue+40},80%,${dark?'72%':'52%'}) 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: `drop-shadow(0 0 24px hsla(${accentHue},80%,55%,.4))`,
            }}>
              Management System
            </span>
          </h1>

          <p style={{
            fontSize: 17, color: muted, maxWidth: 560, margin: '0 auto 40px',
            lineHeight: 1.75,
            animation: 'heroFadeUp 1s ease both', animationDelay: '.4s',
          }}>
            A unified digital platform for Wolaita Sodo University — managing industrial projects and graduate theses from submission to publication.
          </p>

          {/* CTA buttons */}
          <div className="pub-hero-btns" style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'heroFadeUp 1s ease both', animationDelay: '.55s',
          }}>
            <button onClick={() => navigate('/login')} style={{
              padding: '14px 36px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg,hsl(${accentHue},75%,52%),hsl(${accentHue},65%,36%))`,
              color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: `0 10px 32px hsla(${accentHue},70%,45%,.5)`,
              display: 'inline-flex', alignItems: 'center', gap: 9, transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 40px hsla(${accentHue},70%,45%,.6)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 10px 32px hsla(${accentHue},70%,45%,.5)`; }}
            >
              <Sparkles size={17} /> Get Started <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/about')} style={{
              padding: '14px 36px', borderRadius: 14, fontFamily: 'inherit',
              background: dark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.75)',
              backdropFilter: 'blur(12px)',
              border: `1.5px solid ${bdr}`, color: text,
              fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `hsla(${accentHue},60%,52%,.5)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.transform = ''; }}
            >
              Learn More
            </button>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap',
            marginTop: 56,
            animation: 'heroFadeUp 1s ease both', animationDelay: '.7s',
          }}>
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900, color: dark?'#fff':text, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11.5, color: muted, fontWeight: 600, letterSpacing: .8, textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
          animation: 'heroFadeUp 1s ease both', animationDelay: '1s',
        }}>
          <span>Scroll</span>
          <div style={{ width: 1.5, height: 36, background: `linear-gradient(to bottom,${acc},transparent)`, animation: 'scrollPulse 1.8s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECURITY STRIP
      ══════════════════════════════════════ */}
      <section style={{ padding: '48px 24px', background: dark?'rgba(4,16,8,.6)':'rgba(26,92,42,.05)', borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', textAlign: 'center' }}>
          {[
            { icon: Shield,  title: 'Role-Based Access',    desc: 'Each user sees only what they need.' },
            { icon: Lock,    title: 'Sanctum Auth Tokens',  desc: 'Secure bearer token authentication.' },
            { icon: Globe,   title: 'Public Repository',    desc: 'Published works accessible to all.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: 240 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `hsla(${accentHue},70%,55%,.13)`, border: `1px solid hsla(${accentHue},70%,55%,.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} style={{ color: acc }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: dark?'#fff':text, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: muted }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60vw', height: '50vw', maxWidth: 600, maxHeight: 500, borderRadius: '50%', filter: 'blur(110px)', opacity: dark?.14:.07, background: `hsl(${accentHue},80%,55%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: accLt, marginBottom: 14 }}>Access Your Account</p>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: -1 }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: muted, fontSize: 16, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Log in with your university credentials and manage your academic work from anywhere.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              padding: '15px 44px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg,hsl(${accentHue},75%,52%),hsl(${accentHue},65%,36%))`,
              color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: `0 12px 36px hsla(${accentHue},70%,45%,.45)`,
              display: 'inline-flex', alignItems: 'center', gap: 10, transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              <Shield size={17} /> Login to OTPMS <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/contact')} style={{
              padding: '15px 36px', borderRadius: 14, fontFamily: 'inherit',
              background: dark?'rgba(255,255,255,.07)':'rgba(255,255,255,.75)',
              backdropFilter: 'blur(12px)',
              border: `1.5px solid ${bdr}`, color: text,
              fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `hsla(${accentHue},60%,52%,.5)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr; }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${bdr}`, padding: '22px 24px', textAlign: 'center', fontSize: 12, color: muted, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Shield size={12} style={{ color: '#10b981' }} />
        <span>© {new Date().getFullYear()} Melkamu Sime · Wolaita Sodo University · School of Informatics</span>
      </footer>

      <style>{`
        @keyframes heroPing     { 0%,100%{transform:scale(1);opacity:1}  50%{transform:scale(1.8);opacity:.35} }
        @keyframes heroFadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes titleZoomIn  { from{opacity:0;transform:scale(.7) translateY(32px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes logoSpin     { 0%{opacity:0;transform:scale(.5) rotate(-15deg)} 60%{transform:scale(1.08) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes scrollPulse  { 0%,100%{opacity:1;transform:scaleY(1)} 50%{opacity:.4;transform:scaleY(.6)} }
        @keyframes ringRotate   { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
      `}</style>
    </div>
  );
}
