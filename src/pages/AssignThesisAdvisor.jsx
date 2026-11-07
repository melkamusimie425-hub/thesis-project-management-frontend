import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState, StatusBadge } from '../components/ui';

export default function AssignThesisAdvisor() {
  const toast = useToast();
  const [proposals, setProposals] = useState(null);
  const [theses, setTheses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [type, setType] = useState('proposal');
  const [advisor, setAdvisor] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/proposals'),
      client.get('/theses'),
      client.get('/instructors'),
    ]).then(([{ data: p }, { data: t }, { data: i }]) => {
      setProposals(p.proposals.data || []);
      setTheses(t.theses.data || []);
      setInstructors(i.instructors || []);
    }).catch(() => setProposals([]));
  }, []);

  async function assign() {
    if (!advisor) { toast.error('Select an advisor.'); return; }
    try {
      if (type === 'proposal') {
        await client.post(`/proposals/${assigning.id}/assign-advisor`, { advisor_id: Number(advisor) });
      } else {
        await client.post(`/theses/${assigning.id}/assign-advisor`, { advisor_id: Number(advisor) });
      }
      toast.success('Thesis advisor assigned successfully!');
      setAssigning(null); setAdvisor('');
      const [{ data: p }, { data: t }] = await Promise.all([client.get('/proposals'), client.get('/theses')]);
      setProposals(p.proposals.data || []);
      setTheses(t.theses.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign advisor.');
    }
  }

  if (!proposals) return <Spinner label="Loading…" />;

  return (
    <div>
      <div className="page-head"><h2>Assign Thesis Advisor</h2><p>Match thesis candidates with available advisors (SUC-12 / EUC-15).</p></div>
      <div className="flex gap mb">
        <button className={`btn btn-sm ${type === 'proposal' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setType('proposal')}>Proposals</button>
        <button className={`btn btn-sm ${type === 'thesis' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setType('thesis')}>Theses</button>
      </div>
      <div className="card">
        {type === 'proposal' ? (
          proposals.length === 0 ? <div className="card-pad"><EmptyState icon="📑" title="No proposals" /></div> : (
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Student</th><th>Title</th><th>Advisor</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {proposals.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-600 text-sm">{p.student?.full_name}</td>
                      <td className="text-sm">{p.title}</td>
                      <td className="text-sm muted">{p.advisor?.full_name || 'Not assigned'}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => { setAssigning(p); setAdvisor(p.advisor_id || ''); }}>{p.advisor_id ? 'Reassign' : 'Assign'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          theses.length === 0 ? <div className="card-pad"><EmptyState icon="📄" title="No theses" /></div> : (
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Student</th><th>Title</th><th>Advisor</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {theses.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-600 text-sm">{t.student?.full_name}</td>
                      <td className="text-sm">{t.title}</td>
                      <td className="text-sm muted">{t.advisor?.full_name || 'Not assigned'}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => { setAssigning({ ...t, id: t.id }); setAdvisor(t.advisor_id || ''); }}>{t.advisor_id ? 'Reassign' : 'Assign'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {assigning && (
        <div className="modal-overlay" onClick={() => setAssigning(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h3>Assign Advisor</h3><button className="close" onClick={() => setAssigning(null)}>×</button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="alert alert-info"><span>🧑‍🏫</span><div>{assigning.title}</div></div>
                <div className="field">
                  <label>Advisor</label>
                  <select className="select" value={advisor} onChange={(e) => setAdvisor(e.target.value)}>
                    <option value="">— Choose —</option>
                    {instructors.map((i) => <option key={i.id} value={i.id}>{i.salutation} {i.first_name} {i.last_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setAssigning(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={assign}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
