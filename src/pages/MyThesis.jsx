import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';

export default function MyThesis() {
  const toast = useToast();
  const [theses, setTheses] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [form, setForm] = useState({ title: '', abstract: '', proposal_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      client.get('/theses'),
      client.get('/proposals'),
    ]).then(([{ data: t }, { data: p }]) => {
      setTheses(t.theses.data || []);
      setProposals(p.proposals.data || []);
    }).catch(() => setTheses([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await client.post('/theses', form);
      toast.success('Thesis registered!');
      const { data } = await client.get('/theses');
      setTheses(data.theses.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register thesis.');
    } finally {
      setSaving(false);
    }
  }

  async function submitThesis(id) {
    try {
      await client.post(`/theses/${id}/submit`);
      toast.success('Thesis submitted for examination!');
      const { data } = await client.get('/theses');
      setTheses(data.theses.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit thesis.');
    }
  }

  if (!theses) return <Spinner label="Loading…" />;

  const acceptedProposals = proposals.filter((p) => p.status === 'accepted');

  return (
    <div>
      <div className="page-head"><h2>My Thesis</h2><p>Register and manage your thesis work.</p></div>

      {theses.length > 0 ? (
        <div className="form-grid mb">
          {theses.map((t) => (
            <div className="card card-pad" key={t.id}>
              <div className="flex-between">
                <h3>{t.title}</h3>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-sm muted" style={{ marginTop: 8 }}>Advisor: {t.advisor?.full_name || 'Not assigned'}</p>
              {t.abstract && <p className="text-sm muted" style={{ marginTop: 6 }}>{t.abstract}</p>}
              {(t.status === 'writing' || t.status === 'submitted') && (
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => submitThesis(t.id)} disabled={t.status === 'submitted'}>
                    {t.status === 'submitted' ? 'Submitted ✓' : '📄 Submit for Defense'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {theses.length === 0 && (
        <div className="card card-pad">
          <h3 className="mb">Register Thesis</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="field">
              <label>From Accepted Proposal (optional)</label>
              <select className="select" value={form.proposal_id} onChange={(e) => {
                const proposal = proposals.find((p) => p.id === Number(e.target.value));
                setForm({ ...form, proposal_id: e.target.value, title: proposal?.title || form.title });
              }}>
                <option value="">— Link to an accepted proposal —</option>
                {acceptedProposals.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="field"><label>Thesis Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Your thesis topic" required /></div>
            <div className="field"><label>Abstract (optional)</label><textarea className="textarea" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} placeholder="Brief description…" /></div>
            <div><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Registering…' : '📄 Register Thesis'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
