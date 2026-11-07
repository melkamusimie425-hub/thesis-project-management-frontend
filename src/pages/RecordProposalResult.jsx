import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';
import Modal from '../components/Modal';

export default function RecordProposalResult() {
  const toast = useToast();
  const [proposals, setProposals] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ reviewer_recommendation: 'Accepted', modified_title: '', general_comment: '' });

  useEffect(() => {
    client.get('/proposals').then(({ data }) => setProposals(data.proposals.data || [])).catch(() => setProposals([]));
  }, []);

  async function save() {
    try {
      await client.post(`/proposals/${editing.id}/review-result`, form);
      toast.success('Proposal review result recorded!');
      setEditing(null);
      const { data } = await client.get('/proposals');
      setProposals(data.proposals.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record result.');
    }
  }

  if (!proposals) return <Spinner label="Loading proposals…" />;

  return (
    <div>
      <div className="page-head">
        <h2>Record Proposal Result</h2>
        <p>Record the outcome of proposal review (SUC-14 / EUC-17).</p>
      </div>
      <div className="card">
        {proposals.length === 0 ? (
          <div className="card-pad"><EmptyState icon="📋" title="No proposals to review" /></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Student</th><th>Title</th><th>Status</th><th>Recommendation</th><th>Action</th></tr></thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-600 text-sm">{p.student?.full_name}</td>
                    <td className="text-sm">{p.title}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="text-sm muted">{p.reviewer_recommendation || '—'}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(p); setForm({ reviewer_recommendation: p.reviewer_recommendation || 'Accepted', modified_title: p.modified_title || '', general_comment: p.general_comment || '' }); }}>Record</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} title="Record Review Result" onClose={() => setEditing(null)}
        footer={<><button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Result</button></>}>
        {editing && (
          <div className="form-grid">
            <div className="alert alert-info"><span>📑</span><div>Proposal: <strong>{editing.title}</strong> by {editing.student?.full_name}</div></div>
            <div className="field">
              <label>Reviewer Recommendation</label>
              <select className="select" value={form.reviewer_recommendation} onChange={(e) => setForm({ ...form, reviewer_recommendation: e.target.value })}>
                <option value="Accepted">Accepted (no or minor revision)</option>
                <option value="Accepted on condition">Accepted on condition (major revision required)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="field"><label>Modified Title (if any)</label><input className="input" value={form.modified_title} onChange={(e) => setForm({ ...form, modified_title: e.target.value })} placeholder="Revised title suggestion" /></div>
            <div className="field"><label>General Comment</label><textarea className="textarea" value={form.general_comment} onChange={(e) => setForm({ ...form, general_comment: e.target.value })} placeholder="Detailed comments for the student…" /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
