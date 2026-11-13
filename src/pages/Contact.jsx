import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import PublicNav from '../components/PublicNav';
import { Mail, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const CONTACT_EMAIL = 'melkamusimie1@gmail.com';
const CONTACT_PHONE = '0946967075';
const TELEGRAM_URL  = 'https://t.me/MelkieOrtodox';

export default function Contact() {
  const { accentHue, dark } = useTheme();

  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus]   = useState(null); /* 'sent' | 'error' */

  const bg    = dark ? 'linear-gradient(135deg,#020c06 0%,#041a0b 50%,#030e06 100%)' : 'linear-gradient(135deg,#e8f5ec 0%,#f4fbf6 50%,#eaf6ef 100%)';
  const text  = dark ? '#e2f0e8' : '#0d2e15';
  const muted = dark ? 'rgba(226,240,232,.5)' : 'rgba(13,46,21,.55)';
  const card  = dark ? 'rgba(5,20,10,.65)' : 'rgba(255,255,255,.8)';
  const bdr   = dark ? 'rgba(255,255,255,.08)' : 'rgba(26,92,42,.12)';
  const acc   = `hsl(${accentHue},72%,${dark?'52%':'42%'})`;

  const inp = {
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${bdr}`, borderRadius: 10,
    fontSize: 14, fontFamily: 'inherit',
    color: text, background: dark?'rgba(255,255,255,.06)':'rgba(255,255,255,.8)',
    outline: 'none', boxSizing: 'border-box', transition: 'all .2s',
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus('error'); return;
    }
    /* Build mailto link — opens the user's email client pre-filled */
    const subject = encodeURIComponent(
      form.subject || `OTPMS Contact: ${form.name}`
    );
    const body = encodeURIComponent(
      `From: ${form.name} <${form.email}>\n\n${form.message}\n\n---\nSent via OTPMS Contact Form`
    );
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    setStatus('sent');
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',system-ui,sans-serif", transition: 'all .4s' }}>
      <PublicNav />

      {/* Header */}
      <section style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 999, marginBottom: 20, fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: dark?'rgba(255,255,255,.07)':'rgba(26,92,42,.08)', border: `1px solid hsla(${accentHue},60%,52%,.3)`, color: acc }}>
          Contact Us
        </div>
        <h1 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, margin: '0 0 14px' }}>
          Get in <span style={{ color: acc }}>Touch</span>
        </h1>
        <p style={{ fontSize: 15, color: muted, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          Have questions, feedback, or need support? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </section>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 28 }}>

        {/* ── Contact Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Contact Information</h2>
          <p style={{ fontSize: 13.5, color: muted, margin: '0 0 20px', lineHeight: 1.7 }}>
            Reach us through any of the channels below. We typically respond within 24 hours on working days.
          </p>

          {/* Email */}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, background: card, border: `1px solid ${bdr}`, backdropFilter: 'blur(14px)', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `hsla(${accentHue},60%,52%,.4)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `hsla(${accentHue},70%,55%,.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={20} style={{ color: acc }} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 3 }}>Email</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: acc }}>{CONTACT_EMAIL}</div>
              </div>
            </div>
          </a>

          {/* Phone */}
          <a href={`tel:${CONTACT_PHONE}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, background: card, border: `1px solid ${bdr}`, backdropFilter: 'blur(14px)', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `hsla(${accentHue},60%,52%,.4)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `hsla(${accentHue},70%,55%,.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={20} style={{ color: acc }} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 3 }}>Phone</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark?'#fff':text }}>{CONTACT_PHONE}</div>
              </div>
            </div>
          </a>

          {/* Telegram */}
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, background: card, border: `1px solid ${bdr}`, backdropFilter: 'blur(14px)', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `hsla(${accentHue},60%,52%,.4)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,235,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {/* Telegram icon (SVG) */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21.8 2.6L1.5 10.3c-1.3.5-1.3 1.3-.2 1.6l5.1 1.6L18.5 6c.6-.3 1.1-.1.7.4L8.5 15.4v3.1c0 .7.5.9 1 .5l2.6-2.5 5.1 3.9c.9.5 1.6.3 1.9-.9l3.4-15.8c.4-1.4-.5-2-1.7-1.6z" fill="#2563eb"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 3 }}>Telegram</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>@MelkieOrtodox</div>
              </div>
            </div>
          </a>

          {/* Office */}
          <div style={{ padding: '16px 20px', borderRadius: 14, background: card, border: `1px solid ${bdr}`, backdropFilter: 'blur(14px)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 8 }}>Office</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: dark?'#fff':text, lineHeight: 1.6 }}>
              School of Informatics<br />
              Wolaita Sodo University<br />
              Main Campus, Block B<br />
              Wolaita Sodo, Ethiopia
            </div>
          </div>
        </div>

        {/* ── Contact Form ── */}
        <div style={{ padding: '28px', borderRadius: 18, background: card, border: `1px solid ${bdr}`, backdropFilter: 'blur(18px)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 20px' }}>Send a Message</h2>

          {status === 'sent' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, marginBottom: 20, background: 'rgba(26,92,42,.15)', border: '1px solid rgba(26,92,42,.3)', color: '#4ade80', fontSize: 13, fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Your email client will open with the message pre-filled. Thank you!
            </div>
          )}
          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, marginBottom: 20, background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.3)', color: '#f43f5e', fontSize: 13, fontWeight: 600 }}>
              <AlertCircle size={16} /> Please fill in all required fields.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .7 }}>Your Name *</label>
                <input style={inp} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  onFocus={(e) => { e.target.style.borderColor = acc; e.target.style.boxShadow = `0 0 0 3px hsla(${accentHue},70%,52%,.15)`; }}
                  onBlur={(e)  => { e.target.style.borderColor = bdr; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .7 }}>Your Email *</label>
                <input type="email" style={inp} placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  onFocus={(e) => { e.target.style.borderColor = acc; e.target.style.boxShadow = `0 0 0 3px hsla(${accentHue},70%,52%,.15)`; }}
                  onBlur={(e)  => { e.target.style.borderColor = bdr; e.target.style.boxShadow = 'none'; }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .7 }}>Subject</label>
              <input style={inp} placeholder="e.g. Question about thesis submission" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                onFocus={(e) => { e.target.style.borderColor = acc; e.target.style.boxShadow = `0 0 0 3px hsla(${accentHue},70%,52%,.15)`; }}
                onBlur={(e)  => { e.target.style.borderColor = bdr; e.target.style.boxShadow = 'none'; }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: .7 }}>Message *</label>
              <textarea style={{ ...inp, padding: '12px 14px', minHeight: 130, resize: 'vertical' }} placeholder="Write your message here…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required
                onFocus={(e) => { e.target.style.borderColor = acc; e.target.style.boxShadow = `0 0 0 3px hsla(${accentHue},70%,52%,.15)`; }}
                onBlur={(e)  => { e.target.style.borderColor = bdr; e.target.style.boxShadow = 'none'; }} />
            </div>

            <button type="submit" style={{
              padding: '13px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg,hsl(${accentHue},72%,50%),hsl(${accentHue},65%,36%))`,
              color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 8px 24px hsla(${accentHue},70%,45%,.35)`,
              transition: 'all .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              <Send size={16} /> Send Message
            </button>

            <p style={{ fontSize: 12, color: muted, textAlign: 'center', margin: 0 }}>
              Your message will open in your default email app pre-addressed to {CONTACT_EMAIL}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
