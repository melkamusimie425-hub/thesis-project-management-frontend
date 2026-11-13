import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import PublicNav from '../components/PublicNav';
import { ArrowRight, CheckCircle2, Shield, Users, BookOpen, GraduationCap } from 'lucide-react';

const HIGHLIGHTS = [
  'Undergraduate Industrial Project management end-to-end',
  'Graduate thesis proposal submission and review',
  'Role-based access for all academic staff and students',
  'Automated advisor assignment and schedule management',
  'Secure document upload, review, and publication',
  'Real-time announcements from coordinators',
  'Department-level reports and analytics',
  'Public repository of completed student works',
];

export default function About() {
  const navigate            = useNavigate();
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

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '64px 24px 48px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vw', borderRadius: '50%', filter: 'blur(120px)', opacity: dark?.18:.08, background: `radial-gradient(circle,hsl(${accentHue},80%,55%),transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 999, marginBottom: 20, fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.08)', border: `1px solid hsla(${accentHue},60%,52%,.3)`, color: acc }}>
            About OTPMS
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.2 }}>
            Built for <span style={{ color: acc }}>Wolaita Sodo University</span>
          </h1>
          <p style={{ fontSize: 15, color: muted, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            OTPMS is the official Online Thesis and Project Management System of the School of Informatics, designed to streamline the entire academic project lifecycle.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Mission */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 56 }}>
          {[
            { icon: GraduationCap, title: 'Our Mission', desc: 'To digitize and simplify the management of undergraduate industrial projects and graduate theses, reducing paperwork and improving transparency for all stakeholders.' },
            { icon: Shield,        title: 'Security First', desc: 'Role-based access control ensures every user sees only what they are authorized to. All data is validated and secured at both frontend and backend layers.' },
            { icon: Users,         title: 'All Stakeholders', desc: 'From students and advisors to department heads and examiners — every role has a tailored interface designed around their specific workflow.' },
            { icon: BookOpen,      title: 'Open Repository', desc: 'Completed and approved student works are published to a public repository, contributing to the university\'s academic knowledge base.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: '24px', borderRadius: 16, background: card, border: `1px solid ${bdr}`, backdropFilter: 'blur(14px)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `hsla(${accentHue},70%,55%,.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={19} style={{ color: acc }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 8px', color: dark?'#fff':text }}>{title}</h3>
              <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Key highlights */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 24px', textAlign: 'center' }}>Key Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
            {HIGHLIGHTS.map((h) => (
              <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: card, border: `1px solid ${bdr}` }}>
                <CheckCircle2 size={16} style={{ color: acc, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Developer */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 8px', textAlign: 'center' }}>Developer</h2>
          <p style={{ color: muted, fontSize: 14, textAlign: 'center', marginBottom: 28 }}>
            Designed and built entirely by one developer
          </p>
          <div style={{ maxWidth: 340, margin: '0 auto', padding: '32px 28px', borderRadius: 20, background: card, border: `1px solid hsla(${accentHue},60%,52%,.25)`, textAlign: 'center', backdropFilter: 'blur(14px)', boxShadow: `0 16px 48px rgba(0,0,0,.18), 0 0 0 1px ${bdr}` }}>
            {/* Avatar — photo */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
              border: `3px solid ${acc}`,
              boxShadow: `0 0 0 6px hsla(${accentHue},65%,50%,.12), 0 8px 32px rgba(0,0,0,.25)`,
              margin: '0 auto 16px',
              background: `hsla(${accentHue},70%,50%,.2)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 900, color: acc,
            }}>
              <img
                src="/melkamu.jpg"
                alt="Melkamu Sime"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span style="font-weight:900;font-size:26px">MS</span>';
                }}
              />
            </div>
            <div style={{ fontWeight: 900, fontSize: 20, color: dark?'#fff':text, marginBottom: 6 }}>Melkamu Sime</div>
            <div style={{ fontSize: 13, color: acc, fontWeight: 700, marginBottom: 4 }}>Full-Stack Developer</div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 16 }}>UGR/70043/14 · Computer Science</div>
            <div style={{ fontSize: 12.5, color: muted, lineHeight: 1.65, marginBottom: 20 }}>
              Designed, developed and deployed OTPMS — from database schema and Laravel API to React UI — as a final-year capstone project at Wolaita Sodo University.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              {['Laravel', 'React', 'MySQL', 'Sanctum', 'Vite'].map((tech) => (
                <span key={tech} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: `hsla(${accentHue},70%,55%,.12)`, border: `1px solid hsla(${accentHue},60%,52%,.25)`, color: acc }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Advisor */}
        <div style={{ padding: '24px', borderRadius: 16, background: card, border: `1px solid ${bdr}`, textAlign: 'center', backdropFilter: 'blur(14px)', marginBottom: 48 }}>
          <p style={{ fontSize: 13, color: muted, margin: '0 0 6px' }}>Project Advisor</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: dark?'#fff':text, margin: '0 0 4px' }}>Mr. Tekalign B.</p>
          <p style={{ fontSize: 13, color: acc, fontWeight: 700, margin: 0 }}>School of Informatics · Wolaita Sodo University</p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/contact')} style={{
            padding: '12px 28px', borderRadius: 12, border: `1px solid ${bdr}`,
            background: dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.08)',
            color: text, fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8, marginRight: 12,
          }}>
            Contact Us <ArrowRight size={15} />
          </button>
          <button onClick={() => navigate('/login')} style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg,hsl(${accentHue},72%,50%),hsl(${accentHue},65%,36%))`,
            color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
          }}>
            Login to OTPMS
          </button>
        </div>
      </div>
    </div>
  );
}
