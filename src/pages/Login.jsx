import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import PublicNav from '../components/PublicNav';
import {
  Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, Shield,
  Sparkles, Sun, Moon, AlertCircle,
  GraduationCap, BookOpen, Users, BarChart3, Calendar, FileText,
} from 'lucide-react';

const ROLES = [
  { value: '',              label: '— Select your role —' },
  { value: 'Administrator', label: '⚙️  Administrator' },
  { value: 'DepartmentHead',label: '🏛️  Department Head' },
  { value: 'UGPC',          label: '🎓  UG Program Coordinator' },
  { value: 'GPC',           label: '📋  Graduate Program Coordinator' },
  { value: 'IPC',           label: '🗂️  Industrial Project Committee' },
  { value: 'SGC',           label: '🏫  School Graduate Committee' },
  { value: 'Student',       label: '👨‍🎓  Undergraduate Student' },
  { value: 'GradStudent',   label: '📚  Graduate Student' },
  { value: 'Advisor',       label: '🧑‍🏫  Advisor' },
  { value: 'Examiner',      label: '📝  Examiner' },
];

const FEATURES = [
  { icon: FileText,      text: 'Title Submission & Approval' },
  { icon: Users,         text: 'Automatic Advisor Assignment' },
  { icon: Calendar,      text: 'Defense Scheduling' },
  { icon: BookOpen,      text: 'Document Upload & Review' },
  { icon: BarChart3,     text: 'Grade Management & Reports' },
  { icon: GraduationCap, text: 'Thesis & Project Repository' },
];

/* Draggable + self-floating OTPMS headline */
function DraggableTitle({ accentHue }) {
  const ref      = useRef(null);
  const drag     = useRef({ active: false, ox: 0, oy: 0 });
  const anim     = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const manualPos = useRef({ x: 0, y: 0 });

  /* Autonomous float — slow sine/cosine drift */
  useEffect(() => {
    let t = 0;
    let frameId;
    function tick() {
      if (!drag.current.active) {
        t += 0.008;
        const fx = Math.sin(t * 0.9) * 10 + Math.sin(t * 1.4) * 5;
        const fy = Math.cos(t * 0.7) * 8  + Math.cos(t * 1.2) * 4;
        setPos({ x: manualPos.current.x + fx, y: manualPos.current.y + fy });
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    anim.current = frameId;
    return () => cancelAnimationFrame(frameId);
  }, []);

  /* Drag handlers */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onDown(e) {
      const src = e.touches ? e.touches[0] : e;
      drag.current = { active: true, ox: src.clientX - manualPos.current.x, oy: src.clientY - manualPos.current.y };
      el.style.cursor = 'grabbing';
    }
    function onMove(e) {
      if (!drag.current.active) return;
      const src = e.touches ? e.touches[0] : e;
      manualPos.current = { x: src.clientX - drag.current.ox, y: src.clientY - drag.current.oy };
    }
    function onUp() {
      drag.current.active = false;
      el.style.cursor = 'grab';
    }
    el.addEventListener('mousedown',  onDown);
    el.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('touchmove',  onMove, { passive: true });
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('touchend',   onUp);
    return () => {
      el.removeEventListener('mousedown',  onDown);
      el.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('touchmove',  onMove);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('touchend',   onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        cursor: 'grab',
        userSelect: 'none',
        display: 'inline-block',
        marginBottom: 6,
        touchAction: 'none',
        willChange: 'transform',
      }}
      title="Drag me!"
    >
      {'Welcome to OTPMS'.split('').map((ch, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            fontSize: ch === ' ' ? 18 : 36,
            fontWeight: 900,
            letterSpacing: ch === ' ' ? 6 : -1,
            lineHeight: 1.15,
            animation: `otpmsLetter .7s cubic-bezier(.22,1,.36,1) both`,
            animationDelay: `${i * 0.055}s`,
            background: `linear-gradient(135deg,
              #fff 0%,
              hsl(${accentHue},85%,75%) 40%,
              hsl(${accentHue + 40},80%,65%) 70%,
              hsl(45,90%,70%) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: `drop-shadow(0 2px 14px hsla(${accentHue},80%,60%,.6))`,
            transition: 'transform .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </div>
  );
}

export default function Login() {
  const { login, logout } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();
  const { accentHue: globalHue, setAccentHue: setGlobalHue, dark: globalDark, setDark: setGlobalDark } = useTheme();

  const [email,        setEmail]       = useState('');
  const [password,     setPassword]    = useState('');
  const [role,         setRole]        = useState('');
  const [showPwd,      setShowPwd]     = useState(false);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState('');
  const [dark,         setDarkLocal]   = useState(globalDark);
  const [accentHue,    setAccentLocal] = useState(globalHue);
  const [notification, setNotif]       = useState(null);
  const [mousePos,     setMousePos]    = useState({ x: 0, y: 0 });

  function setDark(v)      { setDarkLocal(v);  setGlobalDark(v); }
  function setAccentHue(v) { setAccentLocal(v); setGlobalHue(v); }

  const canvasRef = useRef(null);

  function notify(msg, type = 'info') {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email)    { notify('Please enter your email address.', 'error'); return; }
    if (!password) { notify('Please enter your password.', 'error'); return; }
    if (!role)     { notify('Please select your role to continue.', 'error'); return; }
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== role) {
        logout();
        const selLabel = ROLES.find((r) => r.value === role)?.label.replace(/^[^\s]+\s+/, '') || role;
        const actLabel = ROLES.find((r) => r.value === user.role)?.label.replace(/^[^\s]+\s+/, '') || user.role;
        const msg = `Role mismatch. Your account is registered as "${actLabel}", not "${selLabel}". Please select the correct role.`;
        setError(msg); notify(msg, 'error'); setLoading(false); return;
      }
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login failed. Please check your credentials.';
      setError(msg); notify(msg, 'error');
    } finally { setLoading(false); }
  }

  /* Particle canvas — lines only, no visible dot circles */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const N = 55;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
    }));
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        const dx = mousePos.x - n.x, dy = mousePos.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) { n.x += dx * .008; n.y += dy * .008; }
        /* draw only connection lines — no dot circles */
        for (let j = i + 1; j < nodes.length; j++) {
          const o = nodes[j];
          const dd = Math.hypot(o.x - n.x, o.y - n.y);
          if (dd < 130) {
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `hsla(${accentHue},70%,65%,${(1 - dd / 130) * .35})`;
            ctx.lineWidth = .5; ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [accentHue, dark, mousePos]);

  const labelStyle = { fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8,
    color: dark ? 'rgba(255,255,255,.6)' : 'rgba(13,46,21,.65)' };

  const inp = {
    width: '100%', padding: '12px 14px 12px 42px',
    border: `1.5px solid ${dark ? 'rgba(255,255,255,.15)' : 'rgba(26,92,42,.2)'}`,
    borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
    color: dark ? '#fff' : '#0d2e15',
    background: dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.65)',
    outline: 'none', boxSizing: 'border-box', transition: 'all .2s',
  };

  return (
    <div
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      style={{
        minHeight: '100vh', width: '100%', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* PublicNav — Home / About / Contact / Login links */}
      <PublicNav />
      {/* Background — dark/light */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        transition: 'background .5s',
        background: dark
          ? 'linear-gradient(135deg,#020c06 0%,#041a0b 40%,#071f0e 70%,#030e06 100%)'
          : 'linear-gradient(135deg,#e8f5ec 0%,#f4fbf6 40%,#eaf6ef 70%,#e8f5ec 100%)',
      }} />

      {/* Aurora blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', filter: 'blur(140px)', opacity: dark ? .28 : .18, background: `radial-gradient(circle,hsl(${accentHue},80%,55%),transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', filter: 'blur(160px)', opacity: dark ? .2 : .14, background: `radial-gradient(circle,hsl(${accentHue + 50},70%,50%),transparent 70%)` }} />
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: dark ? .7 : .4 }} />

      {/* Theme controls are in PublicNav above */}

      {/* ── Toast ── */}
      {notification && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 16,
          background: 'rgba(8,20,12,.92)', border: '1px solid rgba(255,255,255,.12)',
          backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,.4)',
          fontSize: 13, fontWeight: 600, color: '#f1f5f9',
          animation: 'slideDown .3s ease', whiteSpace: 'nowrap',
        }}>
          {notification.type === 'error'
            ? <AlertCircle size={16} style={{ color: '#f43f5e', flexShrink: 0 }} />
            : <CheckCircle2 size={16} style={{ color: `hsl(${accentHue},70%,55%)`, flexShrink: 0 }} />}
          {notification.msg}
        </div>
      )}

      {/* ── Main two-column card ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 1120,
        margin: '16px 16px 24px',
        borderRadius: 28, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        background: dark ? 'rgba(4,14,8,.62)' : 'rgba(255,255,255,.72)',
        backdropFilter: 'blur(28px)',
        border: dark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(26,92,42,.15)',
        boxShadow: dark
          ? `0 40px 100px rgba(0,0,0,.55), 0 0 160px -30px hsl(${accentHue},60%,30%)`
          : `0 24px 60px rgba(26,92,42,.18)`,
        transition: 'all .4s',
      }}>

        {/* LEFT — Branding panel */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 36px',
          borderRight: dark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(26,92,42,.12)',
          background: dark
            ? 'rgba(2,10,5,.45)'
            : 'linear-gradient(160deg,rgba(232,248,238,.95),rgba(248,255,251,.9))',
          minHeight: 680,
          textAlign: 'center',
          transition: 'background .4s',
        }}>
          {/* Rotating accent ring behind logo */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 320, height: 320, borderRadius: '50%',
            border: `2px solid hsla(${accentHue},70%,55%,.15)`,
            animation: 'rotateSlow 20s linear infinite',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 380, height: 380, borderRadius: '50%',
            border: `1px solid hsla(${accentHue + 60},60%,55%,.08)`,
            animation: 'rotateSlow 30s linear infinite reverse',
            pointerEvents: 'none',
          }} />

          {/* ── BIG WSU Logo ── */}
          <div style={{
            width: 180, height: 180, borderRadius: '50%', overflow: 'hidden',
            border: `4px solid hsl(${accentHue},65%,55%)`,
            boxShadow: `0 0 0 8px hsla(${accentHue},65%,50%,.15), 0 16px 48px rgba(0,0,0,.5), 0 0 60px hsla(${accentHue},70%,50%,.2)`,
            background: '#fff',
            flexShrink: 0,
            animation: 'logoIn 1s cubic-bezier(.22,1,.36,1) both',
            animationDelay: '.1s',
            marginBottom: 28,
          }}>
            <img
              src="/wsu-logo.png"
              alt="Wolaita Sodo University"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span style="font-weight:900;font-size:28px;color:#1a5c2a;display:flex;align-items:center;justify-content:center;height:100%">WSU</span>';
              }}
            />
          </div>

          {/* University name */}
          <h2 style={{
            color: dark ? '#fff' : '#0d2e15', fontWeight: 900, fontSize: 20, margin: '0 0 4px',
            letterSpacing: .3, textShadow: dark ? '0 2px 12px rgba(0,0,0,.5)' : 'none',
            animation: 'fadeUp .8s ease both', animationDelay: '.3s',
          }}>
            Wolaita Sodo University
          </h2>
          <p style={{
            color: `hsl(${accentHue},75%,${dark?'70%':'42%'})`, fontSize: 12.5, margin: '0 0 28px',
            fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            animation: 'fadeUp .8s ease both', animationDelay: '.4s',
          }}>
            School of Informatics
          </p>

          {/* ── Draggable animated OTPMS title ── */}
          <div style={{ animation: 'fadeUp .8s ease both', animationDelay: '.55s', marginBottom: 10 }}>
            <DraggableTitle accentHue={accentHue} dark={dark} />
          </div>

          <p style={{
            fontSize: 11.5, color: dark ? 'rgba(255,255,255,.45)' : 'rgba(13,46,21,.55)', maxWidth: 260,
            lineHeight: 1.65, margin: '0 0 28px',
            animation: 'fadeUp .8s ease both', animationDelay: '.65s',
          }}>
            ወላይታ ሶዶ ዩኒቨርሲቲ — Manage theses, industrial projects, advisors, defenses and grades all in one place.
          </p>

          {/* Feature pills */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 9, width: '100%', maxWidth: 280,
            animation: 'fadeUp .8s ease both', animationDelay: '.75s',
          }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 10,
                background: dark ? 'rgba(255,255,255,.05)' : 'rgba(26,92,42,.07)',
                border: dark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(26,92,42,.12)',
                fontSize: 12.5, color: dark ? 'rgba(255,255,255,.75)' : 'rgba(13,46,21,.75)', fontWeight: 500,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `hsla(${accentHue},70%,55%,.18)`,
                }}>
                  <Icon size={13} style={{ color: `hsl(${accentHue},75%,${dark?'68%':'45%'})` }} />
                </div>
                {text}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute', bottom: 18, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            fontSize: 10.5, color: dark ? 'rgba(255,255,255,.25)' : 'rgba(13,46,21,.35)',
          }}>
            <Shield size={11} style={{ color: '#10b981' }} />
            <span>Secured Portal</span>
            <span style={{ opacity: .4 }}>·</span>
            <span>© {new Date().getFullYear()} Melkamu Sime · WSU · SIS</span>
          </div>
        </div>

        {/* RIGHT — Login form (centered) */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 44px',
          background: dark ? 'rgba(4,14,8,.35)' : 'rgba(255,255,255,.45)',
          transition: 'background .4s',
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 8px', letterSpacing: -.5 }}>
                {'Login'.split('').map((ch, i) => (
                  <span key={i} style={{
                    display: 'inline-block',
                    animation: 'otpmsLetter .6s cubic-bezier(.22,1,.36,1) both',
                    animationDelay: `${i * 0.08}s`,
                    color: dark ? '#fff' : '#0d2e15',
                    textShadow: dark
                      ? `0 0 20px hsla(${accentHue},80%,65%,.6)`
                      : `0 0 16px hsla(${accentHue},70%,40%,.3)`,
                  }}>{ch}</span>
                ))}
              </h2>
              <p style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,.4)' : 'rgba(13,46,21,.5)', margin: 0 }}>
                Enter your university credentials to access your account.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '11px 14px', borderRadius: 12, marginBottom: 20,
                fontSize: 13, fontWeight: 500,
                background: 'rgba(244,63,94,.12)', border: '1px solid rgba(244,63,94,.3)',
                color: '#f43f5e', borderLeft: '4px solid #f43f5e',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: dark?'rgba(255,255,255,.3)':'rgba(13,46,21,.35)', pointerEvents: 'none' }} />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@wsu.edu.et" required autoFocus
                    style={inp}
                    onFocus={(e) => { e.target.style.borderColor=`hsl(${accentHue},70%,55%)`; e.target.style.boxShadow=`0 0 0 4px hsla(${accentHue},70%,55%,.15)`; e.target.style.background=dark?'rgba(255,255,255,.1)':'rgba(255,255,255,.9)'; }}
                    onBlur={(e)  => { e.target.style.borderColor=dark?'rgba(255,255,255,.15)':'rgba(26,92,42,.2)'; e.target.style.boxShadow='none'; e.target.style.background=dark?'rgba(255,255,255,.07)':'rgba(255,255,255,.65)'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: dark?'rgba(255,255,255,.3)':'rgba(13,46,21,.35)', pointerEvents: 'none' }} />
                  <input
                    type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={{ ...inp, padding: '12px 42px 12px 42px' }}
                    onFocus={(e) => { e.target.style.borderColor=`hsl(${accentHue},70%,55%)`; e.target.style.boxShadow=`0 0 0 4px hsla(${accentHue},70%,55%,.15)`; e.target.style.background=dark?'rgba(255,255,255,.1)':'rgba(255,255,255,.9)'; }}
                    onBlur={(e)  => { e.target.style.borderColor=dark?'rgba(255,255,255,.15)':'rgba(26,92,42,.2)'; e.target.style.boxShadow='none'; e.target.style.background=dark?'rgba(255,255,255,.07)':'rgba(255,255,255,.65)'; }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: dark?'rgba(255,255,255,.35)':'rgba(13,46,21,.4)', padding: 0, display: 'flex' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Your Role</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={role} onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 42px 12px 16px',
                      border: `1.5px solid ${dark?'rgba(255,255,255,.15)':'rgba(26,92,42,.2)'}`, borderRadius: 12,
                      fontSize: 13.5, fontFamily: 'inherit', fontWeight: 600,
                      color: role ? (dark?'#fff':'#0d2e15') : (dark?'rgba(255,255,255,.35)':'rgba(13,46,21,.4)'),
                      background: dark?'rgba(255,255,255,.07)':'rgba(255,255,255,.65)',
                      outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', transition: 'all .2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor=`hsl(${accentHue},70%,55%)`; e.target.style.boxShadow=`0 0 0 4px hsla(${accentHue},70%,55%,.15)`; }}
                    onBlur={(e)  => { e.target.style.borderColor=dark?'rgba(255,255,255,.15)':'rgba(26,92,42,.2)'; e.target.style.boxShadow='none'; }}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} style={{ background: dark?'#041a0b':'#fff', color: dark?'#e2f0e8':'#0d2e15', fontWeight: 600 }}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: dark?'rgba(255,255,255,.4)':'rgba(13,46,21,.4)', fontSize: 12 }}>▼</div>
                </div>
                {role && (
                  <p style={{ margin: 0, fontSize: 11.5, color: `hsl(${accentHue},70%,${dark?'65%':'42%'})`, fontWeight: 600, textAlign: 'center' }}>
                    ✓ Logging in as <strong>{ROLES.find((r) => r.value === role)?.label.replace(/^[^\s]+\s+/, '')}</strong>
                  </p>
                )}
              </div>

              {/* Login button */}
              <button
                type="submit" disabled={loading || !role}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: 12,
                  background: !role
                    ? 'rgba(255,255,255,.1)'
                    : `linear-gradient(135deg,hsl(${accentHue},75%,50%),hsl(${accentHue},65%,36%))`,
                  color: !role ? 'rgba(255,255,255,.25)' : '#fff',
                  fontWeight: 800, fontSize: 15.5, fontFamily: 'inherit',
                  cursor: loading || !role ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: !role ? 'none' : `0 10px 28px -4px hsla(${accentHue},70%,45%,.5)`,
                  opacity: loading ? .75 : 1, marginTop: 6,
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => { if (!loading && role) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 14px 36px -4px hsla(${accentHue},70%,45%,.6)`; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = role ? `0 10px 28px -4px hsla(${accentHue},70%,45%,.5)` : 'none'; }}
              >
                {loading
                  ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  : <><span>Login to OTPMS</span><ArrowRight size={17} /></>}
              </button>
            </form>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: 11, color: dark?'rgba(255,255,255,.18)':'rgba(13,46,21,.35)', marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                <span>•</span>
                <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              </div>
              <div style={{ fontSize: 10.5 }}>
                © {new Date().getFullYear()} <strong style={{ color: dark?'rgba(200,168,0,.7)':'rgba(26,92,42,.7)' }}>Melkamu Sime</strong> · All Rights Reserved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Responsive: on small screens, stack vertically ── */}
      <style>{`
        @keyframes spin          { to { transform: rotate(360deg); } }
        @keyframes ping          { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.4} }
        @keyframes rotateSlow    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse         { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slideDown     { from{transform:translate(-50%,-20px);opacity:0} to{transform:translate(-50%,0);opacity:1} }
        @keyframes logoIn        { 0%{opacity:0;transform:scale(.6) rotate(-8deg)} 60%{transform:scale(1.06) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes fadeUp        { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes otpmsLetter   { 0%{opacity:0;transform:translateY(22px) scale(.8)} 60%{opacity:1;transform:translateY(-5px) scale(1.06)} 100%{opacity:1;transform:translateY(0) scale(1)} }

        @media (max-width: 860px) {
          /* Stack left panel above form on mobile */
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="border-right"] { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.07) !important; min-height: auto !important; padding: 36px 24px !important; }
        }
        @media (max-width: 480px) {
          div[style*="maxWidth: 1120px"] { margin: 12px 8px !important; border-radius: 20px !important; }
        }
      `}</style>
    </div>
  );
}
