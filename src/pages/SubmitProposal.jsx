import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { StatusBadge, EmptyState } from '../components/ui';

export default function SubmitProposal() {
  const { user } = useAuth();
  const toast = useToast();
  const [proposals, setProposals] = useState([]);
  const [form, setForm] = useState({ title: '', abstract: '' });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    client.get('/proposals').then(({ data }) => setProposals(data.proposals.data || [])).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await client.post('/proposals', form);
      toast.success('Proposal submitted successfully!');
      setForm({ title: '', abstract: '' });
      const { data } = await client.get('/proposals');
      setProposals(data.proposals.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-head"><h2>Submit Proposal</h2><p>Submit your thesis proposal for School Graduate Committee review (EUC-19).</p></div>

      {proposals.length > 0 && (
        <div className="card card-pad mb">
          <h3 className="mb">My Proposals</h3>
          {proposals.map((p) => (
            <div key={p.id} style={{ padding: 12, border: '1px solid var(--slate-200)', borderRadius: 10, marginBottom: 10 }}>
              <div className="flex-between"><strong>{p.title}</strong><StatusBadge status={p.status} /></div>
              {p.reviewer_recommendation && <p className="text-sm muted" style={{ marginTop: 6 }}>Recommendation: {p.reviewer_recommendation}</p>}
              {p.general_comment && <p className="text-sm muted" style={{ marginTop: 4 }}>Comment: {p.general_comment}</p>}
              <p className="text-sm muted" style={{ marginTop: 6 }}>Advisor: {p.advisor?.full_name || 'Not assigned'}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card card-pad">
        <h3 className="mb">New Proposal</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field"><label>Thesis Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Your research topic" required /></div>
          <div className="field"><label>Abstract (optional)</label><textarea className="textarea" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} placeholder="Brief description of your research…" /></div>
          <div><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Submitting…' : '📑 Submit Proposal'}</button></div>
        </form>
      </div>
    </div>
  );
}
