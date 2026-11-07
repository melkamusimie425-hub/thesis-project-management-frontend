import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import {
  Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, Shield,
  Sparkles, Sun, Moon, Check, AlertCircle,
  GraduationCap, BookOpen, Users, BarChart3, Calendar, FileText,
} from 'lucide-react';

/* ── Role options ── */
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
  { icon: FileText,     text: 'Title Submission & Approval' },
  { icon: Users,        text: 'Automatic Advisor Assignment' },
  { icon: Calendar,     text: 'Defense Scheduling' },
  { icon: BookOpen,     text: 'Document Upload & Review' },
  { icon: BarChart3,    text: 'Grade Management & Reports' },
  { icon: GraduationCap, text: 'Thesis & Project Repository' },
];

export default function Login() {
  const { login, logout } = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();
  const { accentHue: globalHue, setAccentHue: setGlobalHue, dark: globalDark, setDark: setGlobalDark } = useTheme();

  /* Auth state */
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [role,        setRole]        = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  /* UI state — synced with global theme */
  const [dark,        setDarkLocal]   = useState(globalDark);
  const [accentHue,   setAccentLocal] = useState(globalHue);
  const [notification, setNotif]      = useState(null);
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 });

  function setDark(v)      { setDarkLocal(v); setGlobalDark(v); }
  function setAccentHue(v) { setAccentLocal(v); setGlobalHue(v); }

  /* Canvas ref */
  const canvasRef = useRef(null);

  /* Notification helper */
  function notify(msg, type = 'info') {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  }

  /* Login submit */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email)    { notify('Please enter your email address.', 'error'); return; }
    if (!password) { notify('Please enter your password.', 'error'); return; }
    if (!role)     { notify('Please select your role to continue.', 'error'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);

      // ── Role verification ──────────────────────────────────────────
      // The selected role must match the actual role stored in the database.
      // This prevents a student from entering admin credentials and selecting
      // "Administrator" to gain elevated access.
      if (user.role !== role) {
        // Immediately revoke the issued token so it can't be reused.
        logout();
        const selectedLabel = ROLES.find((r) => r.value === role)?.label.replace(/^[^\s]+\s+/, '') || role;
        const actualLabel   = ROLES.find((r) => r.value === user.role)?.label.replace(/^[^\s]+\s+/, '') || user.role;
        const msg = `Role mismatch. Your account is registered as "${actualLabel}", not "${selectedLabel}". Please select the correct role.`;
        setError(msg);
        notify(msg, 'error');
        setLoading(false);
        return;
      }
      // ──────────────────────────────────────────────────────────────

      toast.success(`Welcome back, ${user.first_name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.email?.[0]
        || 'Login failed. Please check your credentials.';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  /* ── Interactive canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    let raf;

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      canvas.width  = p.offsetWidth;
      canvas.height = p.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const N     = 40;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      r:  Math.random() * 2.5 + 1,
    }));

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      /* grid */
      ctx.strokeStyle = dark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

      /* nodes */
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = mousePos.x - n.x, dy = mousePos.y - n.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 150) { n.x += dx * 0.012; n.y += dy * 0.012; }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${accentHue},80%,${dark?'65%':'45%'})`;
        ctx.fill();

        for (let j = i+1; j < nodes.length; j++) {
          const o = nodes[j];
          const dd = Math.hypot(o.x-n.x, o.y-n.y);
          if (dd < 120) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `hsla(${accentHue},70%,60%,${(1-dd/120)*.8})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [accentHue, dark, mousePos]);

  /* CSS custom properties */
  const cssVars = {
    '--ah':     accentHue,
    '--acc':    `hsl(${accentHue},80%,58%)`,
    '--acc-dk': `hsl(${accentHue},70%,40%)`,
    '--acc-lt': `hsl(${accentHue},80%,65%)`,
  };

  return (
    <div
      style={{
        ...cssVars,
        minHeight: '100vh', width: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '12px',
        background: dark
          ? 'linear-gradient(135deg,#020c06 0%,#041a0b 40%,#071f0e 70%,#030e06 100%)'
          : 'linear-gradient(135deg,#e8f4ec 0%,#f0f9f2 50%,#e2f0e8 100%)',
        fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif",
        transition: 'background .5s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow blobs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'50vw', height:'50vw', borderRadius:'50%', filter:'blur(140px)', opacity:.3, background:`radial-gradient(circle,hsl(${accentHue},80%,55%),transparent 70%)` }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'55vw', height:'55vw', borderRadius:'50%', filter:'blur(160px)', opacity:.2, background:`radial-gradient(circle,hsl(${accentHue+60},75%,50%),transparent 70%)` }} />
      </div>

      {/* Floating controls top-right */}
      <div style={{
        position:'fixed', top:16, right:16, zIndex:50,
        display:'flex', alignItems:'center', gap:10,
        padding:'8px 14px',
        background: dark ? 'rgba(15,30,20,.6)' : 'rgba(255,255,255,.6)',
        backdropFilter:'blur(16px)', borderRadius:16,
        border: dark ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(0,0,0,.08)',
        boxShadow:'0 8px 32px rgba(0,0,0,.2)',
      }}>
        <Sparkles size={14} style={{ color:`hsl(${accentHue},80%,60%)`, animation:'pulse 2s infinite' }} />
        <input
          type="range" min="0" max="360" value={accentHue}
          onChange={(e) => setAccentHue(Number(e.target.value))}
          title="Change accent color"
          style={{ width:90, height:5, cursor:'pointer', borderRadius:4, accentColor:`hsl(${accentHue},80%,58%)` }}
        />
        <div style={{ width:1, height:18, background: dark?'rgba(255,255,255,.2)':'rgba(0,0,0,.15)' }} />
        <button
          onClick={() => setDark(!dark)}
          style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center', color: dark?'#fbbf24':'#4f46e5' }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Toast notification */}
      {notification && (
        <div style={{
          position:'fixed', top:16, left:'50%', transform:'translateX(-50%)',
          zIndex:100, display:'flex', alignItems:'center', gap:10,
          padding:'12px 20px', borderRadius:16,
          background: dark?'rgba(10,25,15,.92)':'rgba(255,255,255,.95)',
          border: dark?'1px solid rgba(255,255,255,.1)':'1px solid rgba(0,0,0,.08)',
          backdropFilter:'blur(20px)', boxShadow:'0 20px 60px rgba(0,0,0,.3)',
          fontSize:13, fontWeight:600, color: dark?'#f1f5f9':'#1e293b',
          animation:'slideDown .3s ease',
        }}>
          {notification.type === 'error'
            ? <AlertCircle size={16} style={{ color:'#f43f5e', flexShrink:0 }} />
            : <CheckCircle2 size={16} style={{ color:`hsl(${accentHue},70%,52%)`, flexShrink:0 }} />}
          {notification.msg}
        </div>
      )}

      {/* Main card */}
      <div style={{
        position:'relative', zIndex:10,
        width:'100%', maxWidth:1100,
        minHeight:680, borderRadius:28, overflow:'hidden',
        display:'grid', gridTemplateColumns:'1fr 1fr',
        background: dark ? 'rgba(5,15,8,.7)' : 'rgba(255,255,255,.75)',
        backdropFilter:'blur(24px)',
        border: dark?'1px solid rgba(255,255,255,.08)':'1px solid rgba(26,92,42,.12)',
        boxShadow: dark
          ? `0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05), 0 0 120px -20px hsl(${accentHue},60%,30%)`
          : '0 24px 60px rgba(26,92,42,.15)',
      }}>

        {/* ── LEFT: Canvas + WSU Branding ── */}
        <div
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          style={{
            position:'relative', overflow:'hidden',
            display:'flex', flexDirection:'column', justifyContent:'space-between',
            padding:'40px 36px',
            borderRight: dark?'1px solid rgba(255,255,255,.06)':'1px solid rgba(26,92,42,.1)',
            background: dark
              ? `linear-gradient(150deg,rgba(5,20,10,.95),rgba(10,35,18,.9),rgba(8,28,14,.95))`
              : `linear-gradient(150deg,rgba(240,249,244,.97),rgba(232,244,238,.95))`,
          }}
        >
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:.9 }} />

          {/* Hexagon mesh overlay */}
          <div style={{
            position:'absolute', inset:0, opacity:.05,
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='%23c8a800' stroke-width='0.8'/%3E%3C/svg%3E")`,
            pointerEvents:'none',
          }} />

          {/* Rotating orbs */}
          <div style={{ position:'absolute', top:'-15%', right:'-15%', width:320, height:320, borderRadius:'50%', background:`radial-gradient(circle,hsla(${accentHue},70%,55%,.22),transparent 70%)`, animation:'rotateSlow 25s linear infinite', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-15%', left:'-15%', width:280, height:280, borderRadius:'50%', background:`radial-gradient(circle,hsla(${accentHue+60},65%,50%,.15),transparent 65%)`, animation:'rotateSlow 20s linear infinite reverse', pointerEvents:'none' }} />

          {/* Top: Logo + seal */}
          <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              width:58, height:58, borderRadius:'50%', overflow:'hidden', flexShrink:0,
              border:`3px solid hsl(${accentHue},70%,55%)`,
              boxShadow:`0 0 0 4px hsla(${accentHue},70%,55%,.2), 0 8px 24px rgba(0,0,0,.3)`,
              background:'#fff',
            }}>
              <img src="/wsu-logo.png" alt="WSU" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={(e) => { e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;background:hsl(${accentHue},60%,40%);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:15px">WSU</div>`; }} />
            </div>
            <div>
              <h2 style={{ color:dark?'#fff':'#0d2e15', fontWeight:800, fontSize:15, margin:0, letterSpacing:.3 }}>
                Wolaita Sodo University
              </h2>
              <p style={{ color:`hsl(${accentHue},70%,${dark?'65%':'45%'})`, fontSize:11, margin:'2px 0 0', fontWeight:600, letterSpacing:1.5, textTransform:'uppercase' }}>
                EST. 2018 E.C
              </p>
            </div>
          </div>

          {/* Middle: System title + features */}
          <div style={{ position:'relative', zIndex:2, margin:'auto 0' }}>
            {/* Live badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:7,
              padding:'5px 14px', borderRadius:999, marginBottom:18, fontSize:11,
              fontWeight:700, letterSpacing:1, textTransform:'uppercase',
              background: dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.08)',
              border:`1px solid hsla(${accentHue},60%,55%,.3)`,
              backdropFilter:'blur(8px)', color:dark?'rgba(255,255,255,.8)':dark?'rgba(0,0,0,.7)':'#1a5c2a',
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:`hsl(${accentHue},80%,60%)`, animation:'ping 1.5s infinite', display:'inline-block' }} />
              <span style={{ width:7, height:7, borderRadius:'50%', background:`hsl(${accentHue},80%,60%)`, marginLeft:-16, display:'inline-block' }} />
              Online Thesis &amp; Project Management System
            </div>

            <h1 style={{
              fontSize:30, fontWeight:900, lineHeight:1.2, margin:'0 0 10px',
              background:`linear-gradient(135deg,${dark?'#fff':'#0d2e15'} 30%,hsl(${accentHue},75%,${dark?'65%':'45%'}) 100%)`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>
              School of<br />Information<br />Science
            </h1>
            <p style={{ color:dark?'rgba(255,255,255,.55)':'rgba(13,46,21,.6)', fontSize:13, lineHeight:1.6, margin:'0 0 24px' }}>
              ወላይታ ሶዶ ዩኒቨርሲቲ — Manage theses, industrial projects, advisors, defenses and grades all in one place.
            </p>

            {/* Feature list */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:10, fontSize:12.5, color:dark?'rgba(255,255,255,.75)':'rgba(13,46,21,.75)', fontWeight:500 }}>
                  <div style={{ width:24, height:24, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`hsla(${accentHue},70%,55%,.15)` }}>
                    <Icon size={13} style={{ color:`hsl(${accentHue},70%,${dark?'65%':'48%'})` }} />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ position:'relative', zIndex:2, display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:18, borderTop:`1px solid ${dark?'rgba(255,255,255,.06)':'rgba(26,92,42,.1)'}`, fontSize:11, color:dark?'rgba(255,255,255,.35)':'rgba(13,46,21,.4)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <Shield size={13} style={{ color:'#10b981' }} />
              <span>Secured Portal</span>
            </div>
            <span>© {new Date().getFullYear()} WSU · SIS</span>
          </div>
        </div>

        {/* ── RIGHT: Auth Form ── */}
        <div style={{
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          padding:'36px 40px',
          background: dark?'rgba(5,15,8,.5)':'rgba(255,255,255,.5)',
          backdropFilter:'blur(20px)',
        }}>
          {/* Top section */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', marginBottom:24 }}>
              <div style={{
                display:'flex', padding:4, borderRadius:14,
                background: dark?'rgba(255,255,255,.06)':'rgba(26,92,42,.07)',
                border: dark?'1px solid rgba(255,255,255,.08)':'1px solid rgba(26,92,42,.1)',
                gap:2,
              }}>
                <span style={{ padding:'7px 16px', borderRadius:11, fontSize:12, fontWeight:700, background:`hsl(${accentHue},65%,${dark?'35%':'45%'})`, color:'#fff' }}>Sign In</span>
                <span style={{ padding:'7px 16px', borderRadius:11, fontSize:12, fontWeight:600, color:dark?'rgba(255,255,255,.45)':'rgba(13,46,21,.45)' }}>OTPMS v2.0</span>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:28, fontWeight:900, margin:'0 0 6px', color:dark?'#fff':'#0d2e15', letterSpacing:-.5 }}>
                Welcome Back 👋
              </h2>
              <p style={{ fontSize:13, color:dark?'rgba(255,255,255,.45)':'rgba(13,46,21,.5)', margin:0 }}>
                Enter your university email and password to access your account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, marginBottom:18, fontSize:13, fontWeight:500, background:'rgba(244,63,94,.1)', border:'1px solid rgba(244,63,94,.25)', color:'#f43f5e', borderLeft:'4px solid #f43f5e' }}>
                <AlertCircle size={15} style={{ flexShrink:0 }} /> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Email */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:700, color:dark?'rgba(255,255,255,.7)':'rgba(13,46,21,.7)', textTransform:'uppercase', letterSpacing:.8 }}>
                  Email Address
                </label>
                <div style={{ position:'relative' }}>
                  <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(148,163,184,.7)', pointerEvents:'none' }} />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@wsu.edu.et" required autoFocus
                    style={{ width:'100%', padding:'12px 14px 12px 40px', border:`1.5px solid ${dark?'rgba(255,255,255,.1)':'rgba(26,92,42,.15)'}`, borderRadius:12, fontSize:14, fontFamily:'inherit', color:dark?'#fff':'#0d2e15', background:dark?'rgba(255,255,255,.05)':'rgba(255,255,255,.6)', outline:'none', boxSizing:'border-box', transition:'all .2s' }}
                    onFocus={(e) => { e.target.style.borderColor = `hsl(${accentHue},70%,55%)`; e.target.style.boxShadow = `0 0 0 4px hsla(${accentHue},70%,55%,.15)`; }}
                    onBlur={(e) => { e.target.style.borderColor = dark?'rgba(255,255,255,.1)':'rgba(26,92,42,.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:700, color:dark?'rgba(255,255,255,.7)':'rgba(13,46,21,.7)', textTransform:'uppercase', letterSpacing:.8 }}>
                  Password
                </label>
                <div style={{ position:'relative' }}>
                  <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(148,163,184,.7)', pointerEvents:'none' }} />
                  <input
                    type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={{ width:'100%', padding:'12px 42px 12px 40px', border:`1.5px solid ${dark?'rgba(255,255,255,.1)':'rgba(26,92,42,.15)'}`, borderRadius:12, fontSize:14, fontFamily:'inherit', color:dark?'#fff':'#0d2e15', background:dark?'rgba(255,255,255,.05)':'rgba(255,255,255,.6)', outline:'none', boxSizing:'border-box', transition:'all .2s' }}
                    onFocus={(e) => { e.target.style.borderColor = `hsl(${accentHue},70%,55%)`; e.target.style.boxShadow = `0 0 0 4px hsla(${accentHue},70%,55%,.15)`; }}
                    onBlur={(e) => { e.target.style.borderColor = dark?'rgba(255,255,255,.1)':'rgba(26,92,42,.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.7)', padding:0, display:'flex' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sign-in button */}
              <button
                type="submit" disabled={loading || !role}
                style={{
                  width:'100%', padding:'13px', border:'none', borderRadius:12,
                  background: !role
                    ? 'rgba(255,255,255,.12)'
                    : `linear-gradient(135deg,hsl(${accentHue},75%,48%),hsl(${accentHue},65%,35%))`,
                  color: !role ? 'rgba(255,255,255,.3)' : '#fff',
                  fontWeight:800, fontSize:15, fontFamily:'inherit',
                  cursor: loading || !role ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                  boxShadow: !role ? 'none' : `0 8px 24px -4px hsla(${accentHue},70%,45%,.45)`,
                  opacity: loading ? .75 : 1, marginTop:4,
                  transition:'all .2s', position:'relative', overflow:'hidden',
                }}
                onMouseEnter={(e) => { if (!loading && role) { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 12px 32px -4px hsla(${accentHue},70%,45%,.55)`; }}}
                onMouseLeave={(e) => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow = role ? `0 8px 24px -4px hsla(${accentHue},70%,45%,.45)` : 'none'; }}
              >
                {loading ? (
                  <div style={{ width:20, height:20, border:'3px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
                ) : (
                  <> <span>Sign In to OTPMS</span> <ArrowRight size={17} /> </>
                )}
              </button>
            </form>
          </div>

          {/* ── Role selector + footer ── */}
          <div style={{ marginTop: 20 }}>
            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ flex:1, height:1, background:dark?'rgba(255,255,255,.08)':'rgba(26,92,42,.1)' }} />
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:dark?'rgba(255,255,255,.3)':'rgba(13,46,21,.35)' }}>Your Role</span>
              <div style={{ flex:1, height:1, background:dark?'rgba(255,255,255,.08)':'rgba(26,92,42,.1)' }} />
            </div>

            {/* Role dropdown */}
            <div style={{ position:'relative' }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width:'100%',
                  padding:'12px 42px 12px 16px',
                  border:`1.5px solid ${dark?'rgba(255,255,255,.1)':'rgba(26,92,42,.15)'}`,
                  borderRadius:12,
                  fontSize:13.5,
                  fontFamily:'inherit',
                  fontWeight:600,
                  color: role
                    ? (dark?'#fff':'#0d2e15')
                    : (dark?'rgba(255,255,255,.35)':'rgba(13,46,21,.35)'),
                  background:dark
                    ? 'rgba(255,255,255,.05)'
                    : 'rgba(255,255,255,.6)',
                  outline:'none',
                  cursor:'pointer',
                  appearance:'none',
                  WebkitAppearance:'none',
                  transition:'all .2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = `hsl(${accentHue},70%,55%)`;
                  e.target.style.boxShadow   = `0 0 0 4px hsla(${accentHue},70%,55%,.15)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = dark?'rgba(255,255,255,.1)':'rgba(26,92,42,.15)';
                  e.target.style.boxShadow   = 'none';
                }}
              >
                {ROLES.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                    style={{ background:'#041a0b', color:'#e2f0e8', fontWeight:600 }}
                  >
                    {r.label}
                  </option>
                ))}
              </select>
              {/* Chevron icon */}
              <div style={{
                position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                pointerEvents:'none',
                color:dark?'rgba(255,255,255,.4)':'rgba(13,46,21,.4)',
                fontSize:12,
              }}>▼</div>
            </div>

            {role && (
              <p style={{ marginTop:8, fontSize:11.5, color:`hsl(${accentHue},65%,${dark?'60%':'48%'})`, fontWeight:600, textAlign:'center' }}>
                ✓ Signing in as <strong>{ROLES.find(r => r.value === role)?.label.replace(/^[^\s]+\s+/,'')}</strong>
              </p>
            )}

            {/* Footer */}
            <div style={{ textAlign:'center', fontSize:11, color:dark?'rgba(255,255,255,.2)':'rgba(13,46,21,.3)', marginTop:18, display:'flex', justifyContent:'center', gap:12 }}>
              <span style={{ cursor:'pointer' }}>Privacy Policy</span>
              <span>•</span>
              <span style={{ cursor:'pointer' }}>Terms of Service</span>
              <span>•</span>
              <span style={{ cursor:'pointer' }}>System Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations injected */}
      <style>{`
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes ping       { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.4} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slideDown  { from{transform:translate(-50%,-20px);opacity:0} to{transform:translate(-50%,0);opacity:1} }
      `}</style>
    </div>
  );
}
