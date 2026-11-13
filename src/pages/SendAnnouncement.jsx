import { useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';

const RECIPIENTS = [
  { value:'all',           label:'Everyone' },
  { value:'Student',       label:'Undergraduate Students' },
  { value:'GradStudent',   label:'Graduate Students' },
  { value:'Advisor',       label:'Advisors' },
  { value:'Examiner',      label:'Examiners' },
  { value:'Undergraduate', label:'All Undergraduate Program' },
  { value:'Graduate',      label:'All Graduate Program' },
];

export default function SendAnnouncement() {
  const toast = useToast();
  const [form, setForm]     = useState({ recipient_role:'all', subject:'', message:'', is_pinned:false, expires_at:'' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post('/notices', {
        ...form,
        expires_at: form.expires_at || null,
      });
      toast.success('Announcement sent successfully!');
      setForm({ recipient_role:'all', subject:'', message:'', is_pinned:false, expires_at:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send announcement.');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-head">
        <h2>✉️ Send Announcement</h2>
        <p>Notify students, advisors, or examiners about important updates.</p>
      </div>
      <div style={{ maxWidth: 640 }}>
        <div className="card card-pad">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="field">
              <label>Recipient</label>
              <select className="select" value={form.recipient_role} onChange={(e) => setForm({ ...form, recipient_role: e.target.value })}>
                {RECIPIENTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Subject</label>
              <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Project title submission deadline" required />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea className="textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your announcement here…" required />
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'10px 14px', background:'rgba(255,255,255,.04)', borderRadius:10, border:'1px solid rgba(255,255,255,.07)' }}>
              <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} style={{ width:15, height:15, accentColor:'#c8a800' }} />
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'#fff' }}>Pin this announcement</div>
                <div style={{ fontSize:11.5, color:'rgba(226,240,232,.4)' }}>Pinned notices appear at the top of the list</div>
              </div>
            </label>
            <div className="field">
              <label>Expiry Date (optional)</label>
              <input
                type="date"
                className="input"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                placeholder="Leave empty for no expiry"
              />
              <div style={{ fontSize:11.5, color:'rgba(226,240,232,.4)' }}>
                When this date passes, the announcement is automatically removed. Leave blank for no expiry.
              </div>
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Sending…' : '✉️ Send Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
