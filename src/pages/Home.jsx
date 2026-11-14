import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import PublicNav from '../components/PublicNav';
import { Shield, ArrowRight, Sparkles, Lock, Globe } from 'lucide-react';

const STATS = [
  { value: '6+',   label: 'User Roles' },
  { value: '100%', label: 'Digital Workflow' },
  { value: '24/7', label: 'Access' },
  { value: 'WSU',  label: 'School of Informatics' },
];

/* â”€â”€ Full-page animated canvas â”€â”€ */
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

    /* drifting orbs */
    const ORBS = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 1400, y: Math.random() * 800,
      r: 100 + Math.random() * 200,
      vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15,
      hue: accentHue + i * 22,
      alpha: .05 + Math.random() * .07,
    }));

    /* network nodes */
    const NODES = Array.from({ length: 70 }, () => ({
      x: Math.random() * 1400, y: Math.random() * 800,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.6 + .5,
    }));

    /* stars */
    const STARS = Array.from({ length: dark ? 80 : 0 }, () => ({
      x: Math.random() * 1400, y: Math.random() * 800,
      r: Math.random() * 1.1 + .2,
      alpha: Math.random() * .6 + .2,
      twinkle: Math.random() * Math.PI * 2,
    }));

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* twinkling stars */
      STARS.forEach((s) => {
        s.twinkle += .02;
        const a = s.alpha * (.6 + .4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      });

      /* orbs */
      ORBS.forEach((o) => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r; else if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r; else if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},85%,${dark?'58%':'42%'},${o.alpha})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
      });

      /* nodes + lines */
      NODES.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = mouse.current.x - n.x, dy = mouse.current.y - n.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) { n.x += dx * .007; n.y += dy * .007; }

        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${accentHue},78%,${dark?'72%':'42%'},.6)`;
        ctx.fill();

        for (let j = i + 1; j < NODES.length; j++) {
          const o  = NODES[j];
          const dd = Math.hypot(o.x - n.x, o.y - n.y);
          if (dd < 115) {
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `hsla(${accentHue},65%,${dark?'65%':'38%'},${(1 - dd / 115) * .25})`;
            ctx.lineWidth = .5; ctx.stroke();
          }
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); canvas.removeEventListener('mousemove', onMove); };
  }, [accentHue, dark]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }} />;
}

export default function Home() {
  const navigate            = useNavigate();
  const { accentHue, dark } = useTheme();

  const bg    = dark ? '#010a04' : 'linear-gradient(135deg,#e4f5eb 0%,#f2fbf5 50%,#e8f7ee 100%)';
  const text  = dark ? '#e2f0e8' : '#0d2e15';
  const muted = dark ? 'rgba(226,240,232,.48)' : 'rgba(13,46,21,.52)';
  const bdr   = dark ? 'rgba(255,255,255,.07)' : 'rgba(26,92,42,.1)';
  const acc   = `hsl(${accentHue},72%,${dark?'54%':'42%'})`;
  const accLt = `hsl(${accentHue},82%,${dark?'70%':'50%'})`;

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',system-ui,sans-serif", overflowX: 'hidden', transition: 'background .4s,color .4s' }}>
      <PublicNav />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” full viewport
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 62px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        <HeroCanvas accentHue={accentHue} dark={dark} />

        {/* Deep glow layers */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '-5%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '70vw', maxWidth: 900, maxHeight: 800, borderRadius: '50%', filter: 'blur(130px)', opacity: dark?.18:.08, background: `hsl(${accentHue},80%,55%)` }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', filter: 'blur(120px)', opacity: dark?.1:.05, background: `hsl(${accentHue+70},70%,52%)` }} />
          <div style={{ position: 'absolute', top: '30%', left: '-8%', width: '30vw', height: '30vw', borderRadius: '50%', filter: 'blur(110px)', opacity: dark?.08:.04, background: `hsl(${accentHue-40},70%,50%)` }} />
        </div>

        {/* Decorative rotating rings */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', width: '70vw', height: '70vw', maxWidth: 700, maxHeight: 700, borderRadius: '50%', border: `1px solid hsla(${accentHue},60%,55%,.08)`, animation: 'ringRotate 40s linear infinite' }} />
          <div style={{ position: 'absolute', width: '52vw', height: '52vw', maxWidth: 520, maxHeight: 520, borderRadius: '50%', border: `1px solid hsla(${accentHue},60%,55%,.06)`, animation: 'ringRotate 28s linear infinite reverse' }} />
          <div style={{ position: 'absolute', width: '36vw', height: '36vw', maxWidth: 360, maxHeight: 360, borderRadius: '50%', border: `1px dashed hsla(${accentHue},60%,55%,.05)`, animation: 'ringRotate 18s linear infinite' }} />
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '60px 24px', maxWidth: 860, width: '100%' }}>

          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 20px', borderRadius: 999, marginBottom: 32,
            fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
            background: dark ? 'rgba(255,255,255,.06)' : 'rgba(26,92,42,.07)',
            border: `1px solid hsla(${accentHue},65%,52%,.35)`,
            color: accLt, backdropFilter: 'blur(10px)',
            animation: 'heroFadeUp .9s ease both',
            boxShadow: `0 0 20px hsla(${accentHue},70%,50%,.15)`,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accLt, display: 'inline-block', animation: 'heroPing 1.6s infinite', flexShrink: 0 }} />
            Wolaita Sodo University Â· School of Informatics
          </div>

          {/* BIG WSU Logo â€” 180px with triple glow rings */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
            <div style={{ position: 'relative', display: 'inline-block', animation: 'logoEntry 1.4s cubic-bezier(.22,1,.36,1) both', animationDelay: '.1s' }}>
            {/* Outer pulse ring */}
            <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', border: `2px solid hsla(${accentHue},70%,55%,.18)`, animation: 'ringPulse 3s ease-in-out infinite' }} />
            {/* Mid ring */}
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `1.5px solid hsla(${accentHue},70%,55%,.28)`, animation: 'ringPulse 3s ease-in-out infinite', animationDelay: '.5s' }} />
            {/* Logo circle */}
            <div style={{
              width: 180, height: 180, borderRadius: '50%', overflow: 'hidden',
              border: `5px solid ${acc}`,
              boxShadow: `0 0 0 3px hsla(${accentHue},70%,55%,.35),
                          0 0 60px hsla(${accentHue},80%,55%,.35),
                          0 24px 80px rgba(0,0,0,.35)`,
              background: '#fff',
            }}>
              <img src="/wsu-logo.png" alt="WSU"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.parentElement.innerHTML = '<span style="font-weight:900;font-size:28px;color:#1a5c2a;display:flex;align-items:center;justify-content:center;height:100%">WSU</span>'; }} />
            </div>
          </div>
          </div>

          {/* Title â€” slow zoom forward */}
          <h1 style={{
            fontSize: 'clamp(28px,5.8vw,66px)', fontWeight: 900,
            lineHeight: 1.08, letterSpacing: -2, margin: '0 0 22px',
            animation: 'titleZoomIn 1.5s cubic-bezier(.22,1,.36,1) both',
            animationDelay: '.25s',
          }}>
            Online Thesis &amp; Project<br />
            <span style={{
              background: `linear-gradient(135deg, ${accLt} 0%, hsl(${accentHue+45},85%,${dark?'74%':'54%'}) 50%, hsl(${accentHue-20},75%,${dark?'65%':'48%'}) 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: `drop-shadow(0 0 32px hsla(${accentHue},80%,55%,.5))`,
              animation: 'gradientShift 5s ease-in-out infinite',
            }}>
              Management System
            </span>
          </h1>

          <p style={{
            fontSize: 17, color: muted, maxWidth: 580, margin: '0 auto 44px',
            lineHeight: 1.8,
            animation: 'heroFadeUp 1s ease both', animationDelay: '.45s',
          }}>
            A unified digital platform for Wolaita Sodo University â€” managing industrial projects and graduate theses from first submission to final publication.
          </p>

          {/* CTA buttons */}
          <div className="pub-hero-btns" style={{
            display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'heroFadeUp 1s ease both', animationDelay: '.6s',
          }}>
            <button onClick={() => navigate('/login')} style={{
              padding: '15px 40px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg,hsl(${accentHue},75%,52%),hsl(${accentHue},65%,36%))`,
              color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: `0 10px 36px hsla(${accentHue},70%,45%,.5)`,
              display: 'inline-flex', alignItems: 'center', gap: 10, transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 18px 44px hsla(${accentHue},70%,45%,.65)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 10px 36px hsla(${accentHue},70%,45%,.5)`; }}
            >
              <Sparkles size={18} /> Get Started <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/about')} style={{
              padding: '15px 40px', borderRadius: 14, fontFamily: 'inherit',
              background: dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.8)',
              backdropFilter: 'blur(14px)',
              border: `1.5px solid ${bdr}`, color: text,
              fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = acc; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,.12)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              Learn More
            </button>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap',
            marginTop: 60, paddingTop: 40,
            borderTop: `1px solid ${bdr}`,
            animation: 'heroFadeUp 1s ease both', animationDelay: '.75s',
          }}>
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(24px,3.2vw,36px)', fontWeight: 900,
                  color: dark ? '#fff' : text, lineHeight: 1,
                  background: `linear-gradient(135deg,${dark?'#fff':text},${accLt})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{value}</div>
                <div style={{ fontSize: 11, color: muted, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          color: muted, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
          animation: 'heroFadeUp 1s ease both', animationDelay: '1.1s',
        }}>
          <div style={{ width: 24, height: 36, borderRadius: 12, border: `1.5px solid ${muted}`, display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
            <div style={{ width: 3, height: 8, borderRadius: 2, background: acc, animation: 'mouseDot 1.8s ease-in-out infinite' }} />
          </div>
          <span style={{ marginTop: 4 }}>Scroll</span>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECURITY TRUST STRIP
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{
        padding: '52px 24px',
        background: dark ? 'rgba(3,14,7,.7)' : 'rgba(26,92,42,.04)',
        borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 52, flexWrap: 'wrap' }}>
          {[
            { icon: Shield, title: 'Role-Based Access',   desc: 'Each user sees only what they are authorised for.' },
            { icon: Lock,   title: 'Sanctum Auth Tokens', desc: 'Secure Laravel Sanctum bearer token authentication.' },
            { icon: Globe,  title: 'Public Repository',   desc: 'Completed approved works open to all visitors.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 260 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: `hsla(${accentHue},70%,55%,.13)`, border: `1px solid hsla(${accentHue},70%,55%,.22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 16px hsla(${accentHue},70%,50%,.12)` }}>
                <Icon size={20} style={{ color: acc }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: dark?'#fff':text, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: muted, lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${bdr}`, padding: '22px 24px', textAlign: 'center', fontSize: 12, color: muted, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Shield size={12} style={{ color: '#10b981' }} />
        <span>Â© {new Date().getFullYear()} Melkamu Sime Â· Wolaita Sodo University Â· School of Informatics</span>
      </footer>

      <style>{`
        @keyframes heroPing      { 0%,100%{transform:scale(1);opacity:1}  50%{transform:scale(1.9);opacity:.3} }
        @keyframes heroFadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes titleZoomIn   { from{opacity:0;transform:scale(.68) translateY(36px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes logoEntry     { 0%{opacity:0;transform:scale(.45) rotate(-18deg)} 60%{transform:scale(1.07) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes ringPulse     { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes ringRotate    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes scrollPulse   { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes mouseDot      { 0%{transform:translateY(0);opacity:1} 60%{transform:translateY(14px);opacity:.2} 100%{transform:translateY(0);opacity:1} }
        @keyframes gradientShift { 0%,100%{filter:drop-shadow(0 0 24px hsla(var(--ah,142),80%,55%,.4))} 50%{filter:drop-shadow(0 0 40px hsla(var(--ah,142),80%,65%,.7))} }
      `}</style>
    </div>
  );
}

