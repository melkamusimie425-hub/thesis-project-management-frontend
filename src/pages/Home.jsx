import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import PublicNav from '../components/PublicNav';
import {
  FileText, Users, Calendar, BookOpen, BarChart3, GraduationCap,
  Shield, ArrowRight, CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  { icon: FileText,      title: 'Title Submission',       desc: 'Students submit up to 3 alternative project/thesis titles for committee review.' },
  { icon: Users,         title: 'Advisor Assignment',     desc: 'Coordinators assign advisors to groups and graduate students seamlessly.' },
  { icon: Calendar,      title: 'Defense Scheduling',     desc: 'Schedule oral defenses with examiners, time, place and automatic notifications.' },
  { icon: BookOpen,      title: 'Document Management',    desc: 'Upload, review, and publish thesis and project documents securely.' },
  { icon: BarChart3,     title: 'Grade & Reports',        desc: 'Record assessment scores and compile final grades with one click.' },
  { icon: GraduationCap, title: 'Public Repository',      desc: 'Completed works are published for public access and future reference.' },
];

const ROLES = [
  { emoji: '👨‍🎓', label: 'Students',          desc: 'Form groups, submit titles, track progress.' },
  { emoji: '🧑‍🏫', label: 'Advisors',          desc: 'Guide students, review documents, record scores.' },
  { emoji: '🎓',  label: 'Coordinators',      desc: 'Manage the full workflow end-to-end.' },
  { emoji: '🏛️', label: 'Department Head',    desc: 'View reports and monitor overall progress.' },
  { emoji: '📋',  label: 'Committees',         desc: 'Review proposals, titles and examination results.' },
  { emoji: '📝',  label: 'Examiners',          desc: 'Evaluate defenses and submit scores.' },
];

export default function Home() {
  const navigate           = useNavigate();
  const { accentHue, dark } = useTheme();

  const bg    = dark ? 'linear-gradient(135deg,#020c06 0%,#041a0b 50%,#030e06 100%)' : 'linear-gradient(135deg,#e8f5ec 0%,#f4fbf6 50%,#eaf6ef 100%)';
  const text  = dark ? '#e2f0e8' : '#0d2e15';
  const muted = dark ? 'rgba(226,240,232,.5)' : 'rgba(13,46,21,.55)';
  const card  = dark ? 'rgba(5,20,10,.65)' : 'rgba(255,255,255,.75)';
  const bdr   = dark ? 'rgba(255,255,255,.07)' : 'rgba(26,92,42,.1)';
  const acc   = `hsl(${accentHue},72%,${dark?'52%':'42%'})`;

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',system-ui,sans-serif", transition: 'all .4s' }}>
      <PublicNav />

      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '50vw', borderRadius: '50%', filter: 'blur(120px)', opacity: dark?.22:.12, background: `radial-gradient(circle,hsl(${accentHue},80%,55%),transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Straight badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 20px', borderRadius: 999, marginBottom: 24,
            fontSize: 13.5, fontWeight: 800, letterSpacing: 2,
            textTransform: 'uppercase',
            background: dark ? 'rgba(255,255,255,.07)' : 'rgba(26,92,42,.08)',
            border: `1px solid hsla(${accentHue},60%,52%,.35)`,
            color: `hsl(${accentHue},72%,${dark?'65%':'42%'})`,
            animation: 'arcFadeIn 1s ease both',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: `hsl(${accentHue},80%,55%)`, display: 'inline-block', animation: 'heroPing 1.5s infinite', flexShrink: 0 }} />
            Wolaita Sodo University &nbsp;·&nbsp; School of Informatics
          </div>

          {/* Logo */}
          <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 28px', border: `4px solid ${acc}`, boxShadow: `0 0 0 8px hsla(${accentHue},65%,50%,.12), 0 16px 48px rgba(0,0,0,.25)`, background: '#fff' }}>
            <img src="/wsu-logo.png" alt="WSU" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.parentElement.innerHTML = '<span style="font-weight:900;font-size:22px;color:#1a5c2a;display:flex;align-items:center;justify-content:center;height:100%">WSU</span>'; }} />
          </div>

          {/* ── Slow zoom-forward title ── */}
          <h1 style={{
            fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, margin: '0 0 16px',
            lineHeight: 1.15, letterSpacing: -1,
            animation: 'titleZoomIn 1.4s cubic-bezier(.22,1,.36,1) both',
            animationDelay: '.2s',
          }}>
            Online Thesis &amp; Project<br />
            <span style={{ color: acc }}>Management System</span>
          </h1>
          <p style={{ fontSize: 16, color: muted, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
            A unified platform for managing undergraduate industrial projects and graduate theses — from title submission to final defense and publication.
          </p>

          <div className="pub-hero-btns" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              padding: '13px 32px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg,hsl(${accentHue},72%,50%),hsl(${accentHue},65%,36%))`,
              color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: `0 8px 24px hsla(${accentHue},70%,45%,.4)`,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              Get Started <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/about')} style={{
              padding: '13px 32px', borderRadius: 12, fontFamily: 'inherit',
              background: dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.08)',
              border: `1px solid ${bdr}`, color: text, fontWeight: 700, fontSize: 15, cursor: 'pointer',
              transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = dark?'rgba(255,255,255,.12)':'rgba(26,92,42,.14)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.08)'; }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 10px' }}>Everything in One Place</h2>
          <p style={{ color: muted, fontSize: 15, margin: 0 }}>All the tools your department needs to manage academic work efficiently.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: '22px 24px', borderRadius: 16, background: card, border: `1px solid ${bdr}`, backdropFilter: 'blur(16px)', transition: 'all .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `hsla(${accentHue},60%,52%,.35)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `hsla(${accentHue},70%,55%,.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={20} style={{ color: acc }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 8px', color: dark?'#fff':text }}>{title}</h3>
              <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who Uses It ── */}
      <section style={{ padding: '60px 24px', background: dark?'rgba(5,20,10,.5)':'rgba(26,92,42,.04)', borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 10px' }}>Who Uses OTPMS?</h2>
            <p style={{ color: muted, fontSize: 15 }}>Designed for every role in the academic workflow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
            {ROLES.map(({ emoji, label, desc }) => (
              <div key={label} style={{ padding: '20px 16px', borderRadius: 14, background: card, border: `1px solid ${bdr}`, textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: dark?'#fff':text, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 14px' }}>Ready to Get Started?</h2>
        <p style={{ color: muted, fontSize: 15, marginBottom: 32 }}>Log in with your university credentials to access your dashboard.</p>
        <button onClick={() => navigate('/login')} style={{
          padding: '14px 40px', borderRadius: 12, border: 'none',
          background: `linear-gradient(135deg,hsl(${accentHue},72%,50%),hsl(${accentHue},65%,36%))`,
          color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: `0 10px 28px hsla(${accentHue},70%,45%,.4)`,
          display: 'inline-flex', alignItems: 'center', gap: 10, transition: 'all .2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
        >
          <Shield size={17} /> Login to OTPMS
        </button>
        <p style={{ marginTop: 16, fontSize: 12, color: muted }}>
          Need help?{' '}
          <span style={{ color: acc, cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/contact')}>Contact us →</span>
        </p>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${bdr}`, padding: '20px 24px', textAlign: 'center', fontSize: 12, color: muted }}>
        © {new Date().getFullYear()} Melkamu Sime · Wolaita Sodo University · School of Informatics
      </footer>

      <style>{`
        @keyframes heroPing    { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:.4} }
        @keyframes arcFadeIn   { from{opacity:0;transform:translateY(-18px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes titleZoomIn { from{opacity:0;transform:scale(.72) translateY(28px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </div>
  );
}
