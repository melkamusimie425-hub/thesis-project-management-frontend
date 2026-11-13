import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const LINKS = [
  { to: '/',        label: 'Home'    },
  { to: '/about',   label: 'About'   },
  { to: '/contact', label: 'Contact' },
];

export default function PublicNav() {
  const navigate          = useNavigate();
  const location          = useLocation();
  const { accentHue, setAccentHue, dark, setDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bg = dark
    ? scrolled ? 'rgba(2,10,5,.92)' : 'rgba(2,10,5,.55)'
    : scrolled ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.65)';

  const textColor  = dark ? '#e2f0e8' : '#0d2e15';
  const mutedColor = dark ? 'rgba(226,240,232,.5)' : 'rgba(13,46,21,.5)';
  const accent     = `hsl(${accentHue},72%,${dark?'52%':'42%'})`;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 62,
        background: bg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.1)'}`,
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,.2)' : 'none',
        transition: 'all .3s',
      }}>
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
            border: `2px solid ${accent}`,
            background: '#fff', flexShrink: 0,
          }}>
            <img src="/wsu-logo.png" alt="WSU"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="font-weight:900;font-size:11px;color:#1a5c2a;display:flex;align-items:center;justify-content:center;height:100%">WSU</span>'; }}
            />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: textColor, lineHeight: 1.2 }}>OTPMS</div>
            <div style={{ fontSize: 9.5, color: mutedColor, fontWeight: 600, letterSpacing: 1 }}>WSU · School of Informatics</div>
          </div>
        </div>

        {/* Desktop links */}
        <div className="pub-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {LINKS.map((l) => {
            const active = location.pathname === l.to;
            return (
              <button key={l.to} onClick={() => navigate(l.to)} style={{
                background: active ? `hsla(${accentHue},72%,52%,.12)` : 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '7px 16px', borderRadius: 10,
                fontSize: 13.5, fontWeight: active ? 800 : 600,
                color: active ? accent : mutedColor,
                transition: 'all .15s',
              }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = textColor; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = mutedColor; }}
              >
                {l.label}
              </button>
            );
          })}

          <div style={{ width: 1, height: 20, background: dark?'rgba(255,255,255,.12)':'rgba(0,0,0,.1)', margin: '0 6px' }} />

          {/* Accent hue slider */}
          <input
            type="range" min="0" max="360" value={accentHue}
            onChange={(e) => setAccentHue(Number(e.target.value))}
            title="Change accent color"
            style={{ width: 70, height: 4, cursor: 'pointer', borderRadius: 4, accentColor: `hsl(${accentHue},80%,58%)` }}
          />

          {/* Dark/light toggle */}
          <button onClick={() => setDark(!dark)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: dark ? '#fbbf24' : '#4f46e5', padding: 6, display: 'flex',
          }} title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Login CTA */}
          <button onClick={() => navigate('/login')} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg,hsl(${accentHue},72%,50%),hsl(${accentHue},65%,36%))`,
            color: '#fff', fontWeight: 800, fontSize: 13.5, fontFamily: 'inherit',
            cursor: 'pointer', marginLeft: 4,
            boxShadow: `0 4px 14px hsla(${accentHue},70%,45%,.4)`,
            transition: 'all .15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
          >
            Login
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="pub-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: textColor, padding: 4 }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 62, left: 0, right: 0, zIndex: 199,
          background: dark ? 'rgba(2,10,5,.97)' : 'rgba(255,255,255,.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.1)'}`,
          padding: '12px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {LINKS.map((l) => (
            <button key={l.to} onClick={() => { navigate(l.to); setMenuOpen(false); }} style={{
              background: location.pathname === l.to ? `hsla(${accentHue},72%,52%,.12)` : 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '12px 16px', borderRadius: 10, textAlign: 'left',
              fontSize: 14, fontWeight: 600,
              color: location.pathname === l.to ? accent : textColor,
            }}>
              {l.label}
            </button>
          ))}
          <button onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{
            padding: '12px', borderRadius: 10, border: 'none', marginTop: 6,
            background: `linear-gradient(135deg,hsl(${accentHue},72%,50%),hsl(${accentHue},65%,36%))`,
            color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
          }}>
            Login
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
            <span style={{ fontSize: 13, color: mutedColor }}>Theme:</span>
            <button onClick={() => setDark(!dark)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: dark ? '#fbbf24' : '#4f46e5', padding: 4, display: 'flex',
            }}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      )}

      {/* Spacer so page content starts below navbar */}
      <div style={{ height: 62 }} />

      <style>{`
        @media (max-width: 640px) {
          .pub-nav-links { display: none !important; }
          .pub-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
