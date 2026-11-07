import { useTheme } from '../context/ThemeContext';

/**
 * Floating accent-color slider and dark/light toggle.
 * Appears on every authenticated page (mounted in Layout).
 */
export default function ThemeControls() {
  const { accentHue, setAccentHue, dark, setDark } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 16px',
        borderRadius: 999,
        background: dark
          ? 'rgba(3,14,7,.85)'
          : 'rgba(255,255,255,.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: dark
          ? '1px solid rgba(255,255,255,.1)'
          : '1px solid rgba(26,92,42,.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,.35)',
        userSelect: 'none',
      }}
      title="Theme controls"
    >
      {/* Sparkle icon */}
      <span
        style={{
          fontSize: 15,
          color: `hsl(${accentHue},75%,${dark ? '65%' : '48%'})`,
          animation: 'tcPulse 2s ease-in-out infinite',
        }}
      >
        ✦
      </span>

      {/* Hue slider */}
      <input
        type="range"
        min="0"
        max="360"
        value={accentHue}
        onChange={(e) => setAccentHue(Number(e.target.value))}
        title="Change accent color"
        style={{
          width: 88,
          height: 4,
          cursor: 'pointer',
          borderRadius: 4,
          /* Rainbow track */
          background: 'linear-gradient(90deg,#f43f5e,#f59e0b,#4ade80,#22d3ee,#818cf8,#e879f9,#f43f5e)',
          outline: 'none',
          border: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          accentColor: `hsl(${accentHue},75%,55%)`,
        }}
      />

      <div
        style={{
          width: 1,
          height: 18,
          background: dark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)',
        }}
      />

      {/* Dark/Light toggle */}
      <button
        onClick={() => setDark(!dark)}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          fontSize: 17,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          transition: 'transform .2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
      >
        {dark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @keyframes tcPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(1.3); }
        }
        /* Custom slider thumb */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: hsl(var(--tc-hue,142),75%,55%);
          border: 2px solid rgba(255,255,255,.9);
          box-shadow: 0 2px 6px rgba(0,0,0,.3);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: hsl(var(--tc-hue,142),75%,55%);
          border: 2px solid rgba(255,255,255,.9);
          box-shadow: 0 2px 6px rgba(0,0,0,.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
